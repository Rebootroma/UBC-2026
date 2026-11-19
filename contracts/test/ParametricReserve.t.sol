// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ParametricReserve} from "../src/ParametricReserve.sol";

/// Test-only 6-decimal token mirroring the Arc USDC ERC-20 interface precision.
contract TestUSD is ERC20 {
    constructor() ERC20("Test USD", "tUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

/// Malicious token that tries to re-enter settle() during the payout transfer.
contract ReentrantToken is ERC20 {
    ParametricReserve public target;
    bytes32 public policyId;
    bytes32 public digest;
    bool public attempted;
    bool public reentrySucceeded;

    constructor() ERC20("Evil", "EVL") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }

    function arm(ParametricReserve t, bytes32 p, bytes32 d) external {
        target = t;
        policyId = p;
        digest = d;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (address(target) != address(0) && from == address(target) && !attempted) {
            attempted = true;
            try target.settle(policyId, digest) {
                reentrySucceeded = true;
            } catch {}
        }
    }
}

contract ParametricReserveTest is Test {
    ParametricReserve reserve;
    TestUSD usd;

    address admin = makeAddr("admin");
    address holder = makeAddr("gulfCoastHardware");
    address holder2 = makeAddr("bayouBakery");
    address relayer = makeAddr("relayer");
    uint256 oracleKey = 0xA11CE;
    address oracle;
    uint256 attackerKey = 0xBAD;

    bytes32 constant EVENT_BERYL = keccak256("NHC:AL022024");
    bytes32 constant EVENT_OTHER = keccak256("NHC:AL092022");
    bytes32 constant KPSX = keccak256("ASOS:KPSX");
    bytes32 constant KGLS = keccak256("ASOS:KGLS");
    bytes32 constant P1 = keccak256("policy:RSL-0001");
    bytes32 constant P2 = keccak256("policy:RSL-0002");

    uint64 constant START = 1720310400; // 2024-07-07 00:00 UTC
    uint64 constant END = 1720569600; // 2024-07-10 00:00 UTC
    uint64 constant OBS_TIME = 1720431720; // 2024-07-08 09:42 UTC (KPSX peak report)
    uint128 constant PAYOUT = 5e6; // 5 USDC (6 decimals)

    function setUp() public {
        vm.warp(1763500000); // Nov 2025: historical replay observations are in the past
        oracle = vm.addr(oracleKey);
        usd = new TestUSD();
        reserve = new ParametricReserve(IERC20(address(usd)), admin);
        bytes32 oracleRole = reserve.ORACLE_ROLE();
        vm.prank(admin);
        reserve.grantRole(oracleRole, oracle);
        usd.mint(admin, 1_000e6);
        vm.startPrank(admin);
        usd.approve(address(reserve), type(uint256).max);
        reserve.fundReserve(20e6);
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- helpers
    function _stations(bytes32 a) internal pure returns (bytes32[] memory s) {
        s = new bytes32[](1);
        s[0] = a;
    }

    function _register(bytes32 id, address who, uint128 amt, uint32 threshold) internal {
        vm.prank(admin);
        reserve.registerPolicy(id, who, keccak256(abi.encode(id)), amt, threshold, START, END, _stations(KPSX));
    }

    function _obs(bytes32 eventId, bytes32 station, uint64 t, uint32 sus, uint32 gust)
        internal
        pure
        returns (ParametricReserve.Observation memory o)
    {
        o = ParametricReserve.Observation({
            eventId: eventId,
            stationId: station,
            observedAt: t,
            sustainedDeciKnots: sus,
            gustDeciKnots: gust,
            sourceHash: keccak256(abi.encode(station, t, sus))
        });
    }

    function _sign(uint256 key, ParametricReserve.Observation memory o) internal view returns (bytes memory) {
        bytes32 d = reserve.hashObservation(o);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, d);
        return abi.encodePacked(r, s, v);
    }

    function _beryl() internal pure returns (ParametricReserve.Observation memory) {
        return _obs(EVENT_BERYL, KPSX, OBS_TIME, 500, 700); // 50 kt sustained, 70 kt gust
    }

    // ---------------------------------------------------------------- registration
    function test_RegisterPolicy() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Policy memory p = reserve.getPolicy(P1);
        assertEq(p.holder, holder);
        assertEq(p.payoutAmount, PAYOUT);
        assertEq(uint8(p.status), uint8(ParametricReserve.PolicyStatus.Active));
        assertTrue(reserve.approvedStation(P1, KPSX));
        assertEq(reserve.activeExposure(), PAYOUT);
        assertEq(reserve.policyCount(), 1);
    }

    function test_RevertWhen_RegisterDuplicatePolicy() public {
        _register(P1, holder, PAYOUT, 450);
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.PolicyExists.selector, P1));
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
    }

    function test_RevertWhen_RegisterInvalidParameters() public {
        vm.startPrank(admin);
        vm.expectRevert(ParametricReserve.ZeroAddress.selector);
        reserve.registerPolicy(P1, address(0), bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
        vm.expectRevert(ParametricReserve.InvalidPolicyParameters.selector);
        reserve.registerPolicy(P1, holder, bytes32(0), 0, 450, START, END, _stations(KPSX)); // zero payout
        vm.expectRevert(ParametricReserve.InvalidPolicyParameters.selector);
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 0, START, END, _stations(KPSX)); // zero threshold
        vm.expectRevert(ParametricReserve.InvalidPolicyParameters.selector);
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 450, END, START, _stations(KPSX)); // inverted window
        vm.expectRevert(ParametricReserve.InvalidPolicyParameters.selector);
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 450, START, END, new bytes32[](0)); // no station
        vm.expectRevert(ParametricReserve.InvalidPolicyParameters.selector);
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 3000, START, END, _stations(KPSX)); // implausible
        vm.stopPrank();
    }

    function test_RevertWhen_NonAdminRegisters() public {
        bytes32 role = reserve.POLICY_ADMIN_ROLE();
        vm.prank(relayer);
        vm.expectRevert(abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, relayer, role));
        reserve.registerPolicy(P1, holder, bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
    }

    function test_RegisterPoliciesBatch() public {
        ParametricReserve.PolicyInput[] memory xs = new ParametricReserve.PolicyInput[](2);
        xs[0] = ParametricReserve.PolicyInput(P1, holder, bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
        xs[1] = ParametricReserve.PolicyInput(P2, holder2, bytes32(0), 3e6, 400, START, END, _stations(KGLS));
        vm.prank(admin);
        reserve.registerPolicies(xs);
        assertEq(reserve.policyCount(), 2);
        assertEq(reserve.activeExposure(), PAYOUT + 3e6);
        assertTrue(reserve.approvedStation(P2, KGLS));
        assertFalse(reserve.approvedStation(P2, KPSX));
    }

    function test_RevertWhen_BatchContainsInvalidPolicy() public {
        ParametricReserve.PolicyInput[] memory xs = new ParametricReserve.PolicyInput[](2);
        xs[0] = ParametricReserve.PolicyInput(P1, holder, bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
        xs[1] = ParametricReserve.PolicyInput(P2, address(0), bytes32(0), 3e6, 400, START, END, _stations(KGLS));
        vm.prank(admin);
        vm.expectRevert(ParametricReserve.ZeroAddress.selector);
        reserve.registerPolicies(xs);
        assertEq(reserve.policyCount(), 0); // all-or-nothing
    }

    // ---------------------------------------------------------------- oracle
    function test_AuthorizedOracleObservationAccepted() public {
        ParametricReserve.Observation memory o = _beryl();
        bytes memory sig = _sign(oracleKey, o);
        vm.prank(relayer); // anyone may relay a signed observation
        bytes32 d = reserve.submitObservation(o, sig);
        ParametricReserve.ObservationRecord memory rec = reserve.getObservation(d);
        assertEq(rec.signer, oracle);
        assertEq(rec.obs.sustainedDeciKnots, 500);
        assertEq(reserve.observationCount(), 1);
    }

    function test_RevertWhen_UnauthorizedOracle() public {
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KPSX, OBS_TIME, 1500, 1800); // forged 150 kt
        bytes memory sig = _sign(attackerKey, o);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.UnauthorizedOracle.selector, vm.addr(attackerKey)));
        reserve.submitObservation(o, sig);
    }

    function test_RevertWhen_TamperedObservation() public {
        ParametricReserve.Observation memory o = _beryl();
        bytes memory sig = _sign(oracleKey, o);
        o.sustainedDeciKnots = 900; // attacker edits the value after signing
        // Recovered signer is now some unrelated address, which holds no oracle role.
        vm.expectRevert();
        reserve.submitObservation(o, sig);
    }

    function test_RevertWhen_ReplayedObservation() public {
        ParametricReserve.Observation memory o = _beryl();
        bytes memory sig = _sign(oracleKey, o);
        bytes32 d = reserve.submitObservation(o, sig);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.ObservationAlreadySubmitted.selector, d));
        reserve.submitObservation(o, sig);
    }

    function test_RevertWhen_ObservationInFuture() public {
        uint64 t = uint64(block.timestamp + 1 hours);
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KPSX, t, 500, 600);
        bytes memory sig = _sign(oracleKey, o);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.ObservationInFuture.selector, t));
        reserve.submitObservation(o, sig);
    }

    function test_RevertWhen_ImplausibleObservation() public {
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KPSX, OBS_TIME, 2500, 2600); // 250 kt
        bytes memory sig = _sign(oracleKey, o);
        vm.expectRevert(ParametricReserve.ImplausibleObservation.selector);
        reserve.submitObservation(o, sig);

        ParametricReserve.Observation memory o2 = _obs(EVENT_BERYL, KPSX, OBS_TIME, 500, 300); // gust < sustained
        bytes memory sig2 = _sign(oracleKey, o2);
        vm.expectRevert(ParametricReserve.ImplausibleObservation.selector);
        reserve.submitObservation(o2, sig2);
    }

    // ---------------------------------------------------------------- settlement
    function test_ValidTriggerPaysHolder() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        assertEq(uint8(reserve.checkEligibility(P1, d)), uint8(ParametricReserve.Eligibility.Eligible));

        vm.prank(relayer);
        reserve.settle(P1, d);

        assertEq(usd.balanceOf(holder), PAYOUT);
        assertEq(usd.balanceOf(relayer), 0); // caller never receives funds
        assertEq(reserve.totalPaid(), PAYOUT);
        assertEq(reserve.reserveBalance(), 20e6 - PAYOUT);
        assertEq(reserve.activeExposure(), 0);
        assertEq(uint8(reserve.getPolicy(P1).status), uint8(ParametricReserve.PolicyStatus.Paid));
    }

    function test_SubmitAndSettleBatch() public {
        _register(P1, holder, PAYOUT, 450);
        _register(P2, holder2, 3e6, 400);
        ParametricReserve.Observation memory o = _beryl();
        bytes32[] memory ps = new bytes32[](2);
        ps[0] = P1;
        ps[1] = P2;
        reserve.submitAndSettle(o, _sign(oracleKey, o), ps);
        assertEq(usd.balanceOf(holder), PAYOUT);
        assertEq(usd.balanceOf(holder2), 3e6);
    }

    function test_RevertWhen_BelowThreshold() public {
        _register(P1, holder, PAYOUT, 550); // 55 kt threshold; observation is 50 kt
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.BelowThreshold
            )
        );
        reserve.settle(P1, d);
        assertEq(usd.balanceOf(holder), 0);
    }

    function test_ThresholdBoundaryIsInclusive() public {
        _register(P1, holder, PAYOUT, 500); // exactly 50.0 kt
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        reserve.settle(P1, d);
        assertEq(usd.balanceOf(holder), PAYOUT);
    }

    function test_RevertWhen_StationNotApproved() public {
        _register(P1, holder, PAYOUT, 450); // only KPSX approved
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KGLS, OBS_TIME, 600, 700);
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.StationNotApproved
            )
        );
        reserve.settle(P1, d);
    }

    function test_RevertWhen_OutsideCoverageWindow() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KPSX, END + 1, 600, 700);
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.OutsideCoverageWindow
            )
        );
        reserve.settle(P1, d);
    }

    function test_RevertWhen_DuplicatePayoutSameEvent() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        reserve.settle(P1, d);

        // Same observation again
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.AlreadySettledForEvent
            )
        );
        reserve.settle(P1, d);

        // A second, genuinely different valid report from the same storm
        ParametricReserve.Observation memory o2 = _obs(EVENT_BERYL, KPSX, OBS_TIME + 3600, 480, 650);
        bytes32 d2 = reserve.submitObservation(o2, _sign(oracleKey, o2));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.AlreadySettledForEvent
            )
        );
        reserve.settle(P1, d2);
        assertEq(usd.balanceOf(holder), PAYOUT); // paid exactly once
    }

    function test_RevertWhen_PaidPolicyHitByDifferentEvent() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Observation memory o = _beryl();
        reserve.settle(P1, reserve.submitObservation(o, _sign(oracleKey, o)));
        ParametricReserve.Observation memory o2 = _obs(EVENT_OTHER, KPSX, OBS_TIME + 7200, 700, 800);
        bytes32 d2 = reserve.submitObservation(o2, _sign(oracleKey, o2));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.PolicyNotActive
            )
        );
        reserve.settle(P1, d2);
    }

    function test_RevertWhen_UnknownObservation() public {
        _register(P1, holder, PAYOUT, 450);
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.UnknownObservation
            )
        );
        reserve.settle(P1, keccak256("made-up digest"));
    }

    function test_CancelledPolicyCannotSettle() public {
        _register(P1, holder, PAYOUT, 450);
        vm.prank(admin);
        reserve.cancelPolicy(P1);
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.expectRevert(
            abi.encodeWithSelector(
                ParametricReserve.NotEligible.selector, P1, ParametricReserve.Eligibility.PolicyNotActive
            )
        );
        reserve.settle(P1, d);
        assertEq(reserve.activeExposure(), 0);
    }

    // ---------------------------------------------------------------- reserves
    function test_InsufficientReserveDefersThenPays() public {
        _register(P1, holder, 50e6, 450); // 50 USDC limit; reserve holds 20
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.expectEmit(true, true, false, true);
        emit ParametricReserve.PayoutDeferred(P1, EVENT_BERYL, 50e6, 30e6);
        reserve.settle(P1, d);

        assertEq(usd.balanceOf(holder), 0);
        assertEq(reserve.totalOwed(), 50e6);
        assertEq(reserve.freeReserve(), 0);
        assertEq(uint8(reserve.getPolicy(P1).status), uint8(ParametricReserve.PolicyStatus.Deferred));

        // Treasury cannot drain funds that are owed
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.InsufficientFreeReserve.selector, 1, 0));
        reserve.withdrawFreeReserve(admin, 1);

        // Paying before top-up fails
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.InsufficientFreeReserve.selector, 50e6, 20e6));
        reserve.payDeferred(P1);

        vm.prank(admin);
        reserve.fundReserve(40e6);
        reserve.payDeferred(P1);
        assertEq(usd.balanceOf(holder), 50e6);
        assertEq(reserve.totalOwed(), 0);
        assertEq(uint8(reserve.getPolicy(P1).status), uint8(ParametricReserve.PolicyStatus.Paid));

        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.NothingOwed.selector, P1));
        reserve.payDeferred(P1);
    }

    function test_WithdrawFreeReserve() public {
        vm.prank(admin);
        reserve.withdrawFreeReserve(admin, 5e6);
        assertEq(reserve.reserveBalance(), 15e6);
        vm.prank(relayer);
        vm.expectRevert();
        reserve.withdrawFreeReserve(relayer, 1);
    }

    function test_TokenDecimals() public view {
        assertEq(reserve.tokenDecimals(), 6);
    }

    // ---------------------------------------------------------------- pause / access
    function test_PauseBlocksSettlement() public {
        _register(P1, holder, PAYOUT, 450);
        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        vm.prank(admin);
        reserve.pause();
        vm.expectRevert(Pausable.EnforcedPause.selector);
        reserve.settle(P1, d);
        vm.prank(admin);
        reserve.unpause();
        reserve.settle(P1, d);
        assertEq(usd.balanceOf(holder), PAYOUT);
    }

    function test_RevertWhen_NonPauserPauses() public {
        vm.prank(relayer);
        vm.expectRevert();
        reserve.pause();
    }

    function test_RevokedOracleRejected() public {
        bytes32 role = reserve.ORACLE_ROLE();
        vm.prank(admin);
        reserve.revokeRole(role, oracle);
        ParametricReserve.Observation memory o = _beryl();
        bytes memory sig = _sign(oracleKey, o);
        vm.expectRevert(abi.encodeWithSelector(ParametricReserve.UnauthorizedOracle.selector, oracle));
        reserve.submitObservation(o, sig);
    }

    // ---------------------------------------------------------------- reentrancy
    function test_ReentrancyBlocked() public {
        ReentrantToken evil = new ReentrantToken();
        ParametricReserve r2 = new ParametricReserve(IERC20(address(evil)), admin);
        bytes32 oracleRole = r2.ORACLE_ROLE();
        vm.startPrank(admin);
        r2.grantRole(oracleRole, oracle);
        evil.mint(admin, 100e6);
        evil.approve(address(r2), type(uint256).max);
        r2.fundReserve(100e6);
        r2.registerPolicy(P1, holder, bytes32(0), PAYOUT, 450, START, END, _stations(KPSX));
        vm.stopPrank();

        ParametricReserve.Observation memory o = _beryl();
        bytes32 d = r2.hashObservation(o);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oracleKey, d);
        r2.submitObservation(o, abi.encodePacked(r, s, v));
        evil.arm(r2, P1, d);
        r2.settle(P1, d);

        assertTrue(evil.attempted());
        assertFalse(evil.reentrySucceeded());
        assertEq(evil.balanceOf(holder), PAYOUT);
    }

    // ---------------------------------------------------------------- fuzz
    function testFuzz_PaysIffAtOrAboveThreshold(uint32 threshold, uint32 observed) public {
        threshold = uint32(bound(threshold, 1, 2000));
        observed = uint32(bound(observed, 0, 2000));
        _register(P1, holder, PAYOUT, threshold);
        ParametricReserve.Observation memory o = _obs(EVENT_BERYL, KPSX, OBS_TIME, observed, 0);
        bytes32 d = reserve.submitObservation(o, _sign(oracleKey, o));
        if (observed >= threshold) {
            reserve.settle(P1, d);
            assertEq(usd.balanceOf(holder), PAYOUT);
        } else {
            vm.expectRevert();
            reserve.settle(P1, d);
            assertEq(usd.balanceOf(holder), 0);
        }
    }
}
