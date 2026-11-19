// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ParametricReserve
/// @notice ResilienceOS settlement contract. Holds a stablecoin reserve and pays predefined amounts to
///         policyholders when an observation, signed by a registered oracle key, satisfies the policy's
///         predefined trigger: sustained wind at an approved station, inside the coverage window,
///         at or above the threshold.
/// @dev    Nothing in this contract depends on an AI model. Eligibility is fully deterministic.
///         Wind values are in deci-knots (tenths of a knot) of the station's reported sustained wind
///         (US ASOS: 2-minute average). Times are unix seconds (UTC).
contract ParametricReserve is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    // ------------------------------------------------------------------ roles
    bytes32 public constant POLICY_ADMIN_ROLE = keccak256("POLICY_ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");

    // ------------------------------------------------------------------ limits
    /// @notice Observations claiming more than 200 kt sustained are physically implausible and rejected.
    uint32 public constant MAX_PLAUSIBLE_DECIKNOTS = 2000;
    /// @notice Observations may not be timestamped more than 5 minutes in the future.
    uint64 public constant MAX_FUTURE_SKEW = 5 minutes;
    uint256 public constant MAX_STATIONS_PER_POLICY = 16;

    bytes32 public constant OBSERVATION_TYPEHASH = keccak256(
        "Observation(bytes32 eventId,bytes32 stationId,uint64 observedAt,uint32 sustainedDeciKnots,uint32 gustDeciKnots,bytes32 sourceHash)"
    );

    // ------------------------------------------------------------------ types
    enum PolicyStatus {
        None,
        Active,
        Paid,
        Deferred,
        Cancelled
    }

    /// @notice Eligibility outcome codes, returned by checkEligibility so a UI can explain a decision
    ///         using exactly the contract's own logic.
    enum Eligibility {
        Eligible,
        PolicyNotActive,
        UnknownObservation,
        StationNotApproved,
        OutsideCoverageWindow,
        BelowThreshold,
        AlreadySettledForEvent
    }

    struct Policy {
        address holder;
        uint128 payoutAmount; // token base units
        uint32 thresholdDeciKnots;
        uint64 coverageStart;
        uint64 coverageEnd;
        bytes32 businessRef; // keccak256 of the off-chain business id
        PolicyStatus status;
        uint128 paidAmount;
        uint128 owedAmount;
    }

    struct Observation {
        bytes32 eventId; // e.g. keccak256("NHC:AL022024")
        bytes32 stationId; // e.g. keccak256("ASOS:KPSX")
        uint64 observedAt;
        uint32 sustainedDeciKnots;
        uint32 gustDeciKnots; // 0 when no gust reported
        bytes32 sourceHash; // keccak256 of the raw source record (e.g. the METAR string)
    }

    struct ObservationRecord {
        Observation obs;
        address signer;
        uint64 acceptedAt;
    }

    // ------------------------------------------------------------------ storage
    IERC20 public immutable token;
    uint8 public immutable tokenDecimals;

    mapping(bytes32 => Policy) private _policies;
    mapping(bytes32 => mapping(bytes32 => bool)) public approvedStation;
    mapping(bytes32 => ObservationRecord) private _observations;
    mapping(bytes32 => mapping(bytes32 => bool)) public settledForEvent;

    bytes32[] public policyIds;
    uint256 public activeExposure; // sum of remaining limits of Active policies
    uint256 public totalOwed; // deferred payouts awaiting reserve
    uint256 public totalPaid;
    uint256 public observationCount;

    // ------------------------------------------------------------------ events
    event PolicyRegistered(
        bytes32 indexed policyId,
        address indexed holder,
        bytes32 indexed businessRef,
        uint128 payoutAmount,
        uint32 thresholdDeciKnots,
        uint64 coverageStart,
        uint64 coverageEnd,
        bytes32[] stations
    );
    event PolicyCancelled(bytes32 indexed policyId);
    event ReserveFunded(address indexed from, uint256 amount, uint256 newBalance);
    event ReserveWithdrawn(address indexed to, uint256 amount);
    event ObservationAccepted(
        bytes32 indexed digest,
        bytes32 indexed eventId,
        bytes32 indexed stationId,
        uint64 observedAt,
        uint32 sustainedDeciKnots,
        uint32 gustDeciKnots,
        address signer
    );
    event PayoutExecuted(
        bytes32 indexed policyId,
        address indexed holder,
        bytes32 indexed eventId,
        uint256 amount,
        bytes32 observationDigest
    );
    event PayoutDeferred(bytes32 indexed policyId, bytes32 indexed eventId, uint256 amount, uint256 shortfall);
    event DeferredPayoutSettled(bytes32 indexed policyId, address indexed holder, uint256 amount);

    // ------------------------------------------------------------------ errors
    error ZeroAddress();
    error InvalidPolicyParameters();
    error PolicyExists(bytes32 policyId);
    error PolicyNotActive(bytes32 policyId);
    error UnauthorizedOracle(address signer);
    error ObservationAlreadySubmitted(bytes32 digest);
    error ObservationInFuture(uint64 observedAt);
    error ImplausibleObservation();
    error NotEligible(bytes32 policyId, Eligibility reason);
    error NothingOwed(bytes32 policyId);
    error InsufficientFreeReserve(uint256 requested, uint256 available);

    constructor(IERC20 token_, address admin) EIP712("ResilienceOS ParametricReserve", "1") {
        if (address(token_) == address(0) || admin == address(0)) revert ZeroAddress();
        token = token_;
        tokenDecimals = IERC20Metadata(address(token_)).decimals();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(POLICY_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(TREASURER_ROLE, admin);
    }

    // ================================================================== policies

    struct PolicyInput {
        bytes32 policyId;
        address holder;
        bytes32 businessRef;
        uint128 payoutAmount;
        uint32 thresholdDeciKnots;
        uint64 coverageStart;
        uint64 coverageEnd;
        bytes32[] stations;
    }

    function registerPolicy(
        bytes32 policyId,
        address holder,
        bytes32 businessRef,
        uint128 payoutAmount,
        uint32 thresholdDeciKnots,
        uint64 coverageStart,
        uint64 coverageEnd,
        bytes32[] calldata stations
    ) external onlyRole(POLICY_ADMIN_ROLE) {
        _register(
            PolicyInput(
                policyId, holder, businessRef, payoutAmount, thresholdDeciKnots, coverageStart, coverageEnd, stations
            )
        );
    }

    /// @notice Register many policies in one transaction (all-or-nothing).
    function registerPolicies(PolicyInput[] calldata inputs) external onlyRole(POLICY_ADMIN_ROLE) {
        for (uint256 i; i < inputs.length; ++i) {
            _register(inputs[i]);
        }
    }

    function _register(PolicyInput memory a) internal {
        if (a.holder == address(0)) revert ZeroAddress();
        if (
            a.policyId == bytes32(0) || a.payoutAmount == 0 || a.thresholdDeciKnots == 0
                || a.thresholdDeciKnots > MAX_PLAUSIBLE_DECIKNOTS || a.coverageStart >= a.coverageEnd
                || a.stations.length == 0 || a.stations.length > MAX_STATIONS_PER_POLICY
        ) revert InvalidPolicyParameters();
        if (_policies[a.policyId].status != PolicyStatus.None) revert PolicyExists(a.policyId);

        _policies[a.policyId] = Policy({
            holder: a.holder,
            payoutAmount: a.payoutAmount,
            thresholdDeciKnots: a.thresholdDeciKnots,
            coverageStart: a.coverageStart,
            coverageEnd: a.coverageEnd,
            businessRef: a.businessRef,
            status: PolicyStatus.Active,
            paidAmount: 0,
            owedAmount: 0
        });
        for (uint256 i; i < a.stations.length; ++i) {
            if (a.stations[i] == bytes32(0)) revert InvalidPolicyParameters();
            approvedStation[a.policyId][a.stations[i]] = true;
        }
        policyIds.push(a.policyId);
        activeExposure += a.payoutAmount;
        emit PolicyRegistered(
            a.policyId,
            a.holder,
            a.businessRef,
            a.payoutAmount,
            a.thresholdDeciKnots,
            a.coverageStart,
            a.coverageEnd,
            a.stations
        );
    }

    function cancelPolicy(bytes32 policyId) external onlyRole(POLICY_ADMIN_ROLE) {
        Policy storage p = _policies[policyId];
        if (p.status != PolicyStatus.Active) revert PolicyNotActive(policyId);
        p.status = PolicyStatus.Cancelled;
        activeExposure -= p.payoutAmount;
        emit PolicyCancelled(policyId);
    }

    // ================================================================== reserve

    function fundReserve(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidPolicyParameters();
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit ReserveFunded(msg.sender, amount, token.balanceOf(address(this)));
    }

    /// @notice Withdraw only reserve that is not owed to deferred claims.
    function withdrawFreeReserve(address to, uint256 amount) external onlyRole(TREASURER_ROLE) nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        uint256 free = freeReserve();
        if (amount > free) revert InsufficientFreeReserve(amount, free);
        token.safeTransfer(to, amount);
        emit ReserveWithdrawn(to, amount);
    }

    function reserveBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice Balance minus amounts already owed to deferred claims.
    function freeReserve() public view returns (uint256) {
        uint256 bal = token.balanceOf(address(this));
        return bal > totalOwed ? bal - totalOwed : 0;
    }

    // ================================================================== oracle

    function hashObservation(Observation calldata obs) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    OBSERVATION_TYPEHASH,
                    obs.eventId,
                    obs.stationId,
                    obs.observedAt,
                    obs.sustainedDeciKnots,
                    obs.gustDeciKnots,
                    obs.sourceHash
                )
            )
        );
    }

    /// @notice Record an observation signed by a registered oracle. Anyone may relay it; the signature,
    ///         not the sender, is what is authorised. Each observation can be accepted exactly once.
    function submitObservation(Observation calldata obs, bytes calldata signature)
        public
        whenNotPaused
        returns (bytes32 digest)
    {
        digest = hashObservation(obs);
        if (_observations[digest].signer != address(0)) revert ObservationAlreadySubmitted(digest);
        address signer = ECDSA.recover(digest, signature);
        if (!hasRole(ORACLE_ROLE, signer)) revert UnauthorizedOracle(signer);
        if (obs.observedAt > block.timestamp + MAX_FUTURE_SKEW) revert ObservationInFuture(obs.observedAt);
        if (
            obs.sustainedDeciKnots > MAX_PLAUSIBLE_DECIKNOTS || obs.gustDeciKnots > MAX_PLAUSIBLE_DECIKNOTS
                || (obs.gustDeciKnots != 0 && obs.gustDeciKnots < obs.sustainedDeciKnots) || obs.eventId == bytes32(0)
                || obs.stationId == bytes32(0) || obs.observedAt == 0
        ) revert ImplausibleObservation();

        _observations[digest] = ObservationRecord({obs: obs, signer: signer, acceptedAt: uint64(block.timestamp)});
        observationCount++;
        emit ObservationAccepted(
            digest, obs.eventId, obs.stationId, obs.observedAt, obs.sustainedDeciKnots, obs.gustDeciKnots, signer
        );
    }

    // ================================================================== settlement

    /// @notice Deterministic eligibility check, identical to the one settle() enforces.
    function checkEligibility(bytes32 policyId, bytes32 digest) public view returns (Eligibility) {
        Policy storage p = _policies[policyId];
        ObservationRecord storage rec = _observations[digest];
        if (rec.signer == address(0)) return Eligibility.UnknownObservation;
        if (settledForEvent[policyId][rec.obs.eventId]) return Eligibility.AlreadySettledForEvent;
        if (p.status != PolicyStatus.Active) return Eligibility.PolicyNotActive;
        if (!approvedStation[policyId][rec.obs.stationId]) return Eligibility.StationNotApproved;
        if (rec.obs.observedAt < p.coverageStart || rec.obs.observedAt > p.coverageEnd) {
            return Eligibility.OutsideCoverageWindow;
        }
        if (rec.obs.sustainedDeciKnots < p.thresholdDeciKnots) return Eligibility.BelowThreshold;
        return Eligibility.Eligible;
    }

    /// @notice Settle a policy against an accepted observation. Permissionless: the payout always goes to the
    ///         holder fixed at registration, so a caller cannot redirect funds.
    function settle(bytes32 policyId, bytes32 digest) public whenNotPaused nonReentrant {
        Eligibility e = checkEligibility(policyId, digest);
        if (e != Eligibility.Eligible) revert NotEligible(policyId, e);

        Policy storage p = _policies[policyId];
        bytes32 eventId = _observations[digest].obs.eventId;
        uint256 amount = p.payoutAmount - p.paidAmount;

        // effects
        settledForEvent[policyId][eventId] = true;
        activeExposure -= amount;
        uint256 free = freeReserve();
        if (free >= amount) {
            p.status = PolicyStatus.Paid;
            p.paidAmount += uint128(amount);
            totalPaid += amount;
            // interaction
            token.safeTransfer(p.holder, amount);
            emit PayoutExecuted(policyId, p.holder, eventId, amount, digest);
        } else {
            // Never hide insolvency: record the obligation and the shortfall instead of reverting.
            p.status = PolicyStatus.Deferred;
            p.owedAmount += uint128(amount);
            totalOwed += amount;
            emit PayoutDeferred(policyId, eventId, amount, amount - free);
        }
    }

    /// @notice Submit an observation and settle a set of policies against it in one transaction.
    ///         Reverts entirely if any policy is not eligible.
    function submitAndSettle(Observation calldata obs, bytes calldata signature, bytes32[] calldata policies)
        external
        returns (bytes32 digest)
    {
        digest = submitObservation(obs, signature);
        for (uint256 i; i < policies.length; ++i) {
            settle(policies[i], digest);
        }
    }

    /// @notice Pay a deferred claim once the reserve has been topped up. Permissionless.
    function payDeferred(bytes32 policyId) external whenNotPaused nonReentrant {
        Policy storage p = _policies[policyId];
        if (p.status != PolicyStatus.Deferred || p.owedAmount == 0) revert NothingOwed(policyId);
        uint256 amount = p.owedAmount;
        uint256 bal = token.balanceOf(address(this));
        // Deferred claims are paid in the order callers settle them; the full owed amount must be on hand.
        if (bal < amount) revert InsufficientFreeReserve(amount, bal);
        p.owedAmount = 0;
        p.paidAmount += uint128(amount);
        p.status = PolicyStatus.Paid;
        totalOwed -= amount;
        totalPaid += amount;
        token.safeTransfer(p.holder, amount);
        emit DeferredPayoutSettled(policyId, p.holder, amount);
    }

    // ================================================================== admin

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ================================================================== views

    function getPolicy(bytes32 policyId) external view returns (Policy memory) {
        return _policies[policyId];
    }

    function getObservation(bytes32 digest) external view returns (ObservationRecord memory) {
        return _observations[digest];
    }

    function policyCount() external view returns (uint256) {
        return policyIds.length;
    }
}
