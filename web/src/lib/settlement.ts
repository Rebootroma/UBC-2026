import "server-only";
import { BaseError, ContractFunctionRevertedError, decodeEventLog, keccak256, toBytes, type Hex } from "viem";
import { parametricReserveAbi } from "./chain/abi";
import { DEPLOYMENT, policyKey, stationKey, eventKey, txUrl } from "./chain/config";
import {
  attackerAccount,
  oracleAccount,
  publicClient,
  relayerClient,
  reserveAddress,
  serialized,
  signObservation,
  toChainObservation,
  type ChainObservation,
} from "./chain/server";
import { invalidateChainState } from "./chain/state";
import { BIZ_BY_ID, OBS_BY_ID } from "./data";
import { parseMetarWind } from "./metar";
import { triggeredBy } from "./policy";
import { EVENT } from "./config";
import { ELIGIBILITY_CODES, POLICY_STATUS, type Observation } from "./types";

export interface ValidationCheck {
  check: string;
  passed: boolean;
  detail: string;
}

export interface SettlementResult {
  status: "settled" | "already-settled" | "no-eligible-policies" | "rejected" | "failed";
  observationId: string;
  checks: ValidationCheck[];
  digest?: Hex;
  txHash?: Hex;
  explorerUrl?: string;
  blockNumber?: string;
  gasUsed?: string;
  payouts: { businessId: string; policyId: Hex; amountUnits: string; outcome: "paid" | "deferred" }[];
  skipped: { businessId: string; reason: string }[];
  message: string;
}

/** Layer-1 validation: the observation must come from the verified fixture set and survive re-parsing. */
export function validateObservation(o: Observation | undefined): ValidationCheck[] {
  if (!o) return [{ check: "Known source record", passed: false, detail: "Observation id not found in the verified NOAA/IEM dataset." }];
  const metar = parseMetarWind(o.metar);
  return [
    { check: "Known source record", passed: true, detail: `IEM ASOS archive record ${o.id}` },
    {
      check: "Source hash",
      passed: keccak256(toBytes(o.metar)) === o.sourceHash,
      detail: `keccak256(METAR) = ${o.sourceHash.slice(0, 18)}…`,
    },
    {
      check: "Independent METAR parse",
      passed: !!metar && metar.sustainedKt === o.sustainedKt,
      detail: metar ? `Raw METAR wind group says ${metar.sustainedKt} kt sustained${metar.gustKt ? `, gust ${metar.gustKt} kt` : ""}` : "Wind group not parseable",
    },
    { check: "Data-quality flags", passed: o.verifiable && o.issues.length === 0, detail: o.issues.length ? o.issues.join(", ") : "none" },
    { check: "Physical plausibility", passed: (o.sustainedKt ?? 999) <= 200, detail: `${o.sustainedKt} kt ≤ 200 kt bound` },
  ];
}

function revertReason(e: unknown): string {
  if (e instanceof BaseError) {
    const r = e.walk((x) => x instanceof ContractFunctionRevertedError);
    if (r instanceof ContractFunctionRevertedError) {
      const name = r.data?.errorName ?? r.reason ?? "reverted";
      const args = r.data?.args ?? [];
      if (name === "NotEligible") return `NotEligible(${ELIGIBILITY_CODES[Number(args[1])] ?? args[1]})`;
      return `${name}(${args.map(String).join(", ")})`;
    }
    return e.shortMessage;
  }
  return (e as Error)?.message ?? String(e);
}

export async function settleObservation(observationId: string): Promise<SettlementResult> {
  return serialized(() => settleInner(observationId));
}

async function settleInner(observationId: string): Promise<SettlementResult> {
  const o = OBS_BY_ID.get(observationId);
  const checks = validateObservation(o);
  const base: SettlementResult = { observationId, checks, payouts: [], skipped: [], status: "failed", message: "" };
  if (!o || checks.some((c) => !c.passed)) {
    return { ...base, status: "rejected", message: "Observation failed validation; the oracle will not sign it." };
  }
  const relayer = relayerClient();
  const oracle = oracleAccount();
  const cohort = DEPLOYMENT.cohort;
  if (!relayer || !oracle || !DEPLOYMENT.reserve || !cohort) {
    return { ...base, status: "failed", message: "Settlement is not configured on this server (missing keys or deployment)." };
  }
  const reserve = reserveAddress();
  const candidates = triggeredBy([...BIZ_BY_ID.values()], o);
  checks.push({ check: "Deterministic trigger evaluation", passed: candidates.length > 0, detail: `${candidates.length} policies have a threshold ≤ ${o.sustainedKt} kt at ${o.stationId}` });

  const chainObs = toChainObservation(o);
  const digest = await publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "hashObservation", args: [chainObs] });
  const existing = await publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "getObservation", args: [digest] });
  const alreadySubmitted = existing.signer !== "0x0000000000000000000000000000000000000000";

  // Ask the contract itself which candidates are still payable.
  const eventId = eventKey(EVENT.atcfId);
  const statuses = await publicClient.multicall({
    allowFailure: false,
    contracts: candidates.flatMap((b) => [
      { address: reserve, abi: parametricReserveAbi, functionName: "getPolicy" as const, args: [policyKey(cohort, b.policy.policyNumber)] as const },
      { address: reserve, abi: parametricReserveAbi, functionName: "settledForEvent" as const, args: [policyKey(cohort, b.policy.policyNumber), eventId] as const },
    ]),
  });
  const payable: typeof candidates = [];
  candidates.forEach((b, i) => {
    const p = statuses[i * 2] as { status: number };
    const settled = statuses[i * 2 + 1] as boolean;
    const st = POLICY_STATUS[p.status];
    if (settled) base.skipped.push({ businessId: b.id, reason: "Already settled for this event" });
    else if (st !== "Active") base.skipped.push({ businessId: b.id, reason: `Policy is ${st} on chain` });
    else payable.push(b);
  });

  if (payable.length === 0) {
    return {
      ...base,
      digest,
      status: base.skipped.length ? "already-settled" : "no-eligible-policies",
      message: base.skipped.length
        ? "Every policy this observation triggers has already been settled on chain."
        : "No policy is triggered by this observation.",
    };
  }

  const policyIds = payable.map((b) => policyKey(cohort, b.policy.policyNumber));
  try {
    let hash: Hex;
    if (alreadySubmitted) {
      // Observation recorded earlier (e.g. by another relayer); settle against it.
      if (policyIds.length !== 1) {
        // settle each in sequence
        let last: Hex = "0x";
        for (const id of policyIds) {
          const { request } = await publicClient.simulateContract({ account: relayer.account, address: reserve, abi: parametricReserveAbi, functionName: "settle", args: [id, digest] });
          last = await relayer.writeContract(request);
          await publicClient.waitForTransactionReceipt({ hash: last });
        }
        hash = last;
      } else {
        const { request } = await publicClient.simulateContract({ account: relayer.account, address: reserve, abi: parametricReserveAbi, functionName: "settle", args: [policyIds[0], digest] });
        hash = await relayer.writeContract(request);
      }
    } else {
      const signature = await signObservation(oracle, chainObs);
      checks.push({ check: "Oracle signature (EIP-712)", passed: true, detail: `Signed by registered oracle ${oracle.address}` });
      const { request } = await publicClient.simulateContract({
        account: relayer.account,
        address: reserve,
        abi: parametricReserveAbi,
        functionName: "submitAndSettle",
        args: [chainObs, signature, policyIds],
      });
      hash = await relayer.writeContract(request);
    }
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
    invalidateChainState();
    if (receipt.status !== "success") {
      return { ...base, digest, txHash: hash, explorerUrl: txUrl(hash), status: "failed", message: "Transaction reverted on chain." };
    }
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== reserve.toLowerCase()) continue;
      try {
        const ev = decodeEventLog({ abi: parametricReserveAbi, topics: log.topics, data: log.data });
        if (ev.eventName === "PayoutExecuted" || ev.eventName === "PayoutDeferred") {
          const b = payable[policyIds.indexOf(ev.args.policyId)];
          base.payouts.push({ businessId: b?.id ?? "?", policyId: ev.args.policyId, amountUnits: ev.args.amount.toString(), outcome: ev.eventName === "PayoutExecuted" ? "paid" : "deferred" });
        }
      } catch {
        /* not ours */
      }
    }
    return {
      ...base,
      digest,
      txHash: hash,
      explorerUrl: txUrl(hash),
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      status: "settled",
      message: `Settled ${base.payouts.length} ${base.payouts.length === 1 ? "policy" : "policies"} on Arc testnet.`,
    };
  } catch (e) {
    return { ...base, digest, status: "failed", message: `Settlement failed: ${revertReason(e)}` };
  }
}

// ======================================================================= attack demonstrations

export interface AttackResult {
  attack: "unauthorized-oracle" | "duplicate-payout" | "replayed-observation";
  description: string;
  layers: { layer: string; outcome: "rejected" | "accepted"; detail: string }[];
  revertReason?: string;
  failedTxHash?: Hex;
  explorerUrl?: string;
  message: string;
}

/** Forge a hurricane-force observation and sign it with a key that has no ORACLE_ROLE. */
export async function attackUnauthorizedOracle(broadcast: boolean): Promise<AttackResult> {
  return serialized(async () => {
    const attacker = attackerAccount();
    const relayer = relayerClient();
    if (!attacker || !relayer || !DEPLOYMENT.reserve) throw new Error("not configured");
    const reserve = reserveAddress();
    const forged: ChainObservation = {
      eventId: eventKey(EVENT.atcfId),
      stationId: stationKey("KGLS"),
      observedAt: BigInt(Date.parse("2024-07-08T09:00:00Z") / 1000),
      sustainedDeciKnots: 950, // 95 kt: Galveston never measured this during Beryl
      gustDeciKnots: 1200,
      sourceHash: keccak256(toBytes(`FORGED KGLS 080900Z 18095G120KT ${Date.now()}`)),
    };
    const sig = await signObservation(attacker, forged);
    const layers: AttackResult["layers"] = [
      {
        layer: "ResilienceOS API validation",
        outcome: "rejected",
        detail: "Not present in the verified NOAA/IEM source dataset; the platform oracle would never sign it.",
      },
    ];
    let reason = "";
    try {
      await publicClient.simulateContract({ account: relayer.account, address: reserve, abi: parametricReserveAbi, functionName: "submitObservation", args: [forged, sig] });
      layers.push({ layer: "ParametricReserve contract (eth_call)", outcome: "accepted", detail: "UNEXPECTED: contract accepted the forged observation" });
    } catch (e) {
      reason = revertReason(e);
      layers.push({ layer: "ParametricReserve contract (eth_call on Arc testnet)", outcome: "rejected", detail: reason });
    }
    let failedTxHash: Hex | undefined;
    if (broadcast) {
      try {
        failedTxHash = await relayer.writeContract({ address: reserve, abi: parametricReserveAbi, functionName: "submitObservation", args: [forged, sig], gas: 200_000n });
        const r = await publicClient.waitForTransactionReceipt({ hash: failedTxHash, timeout: 60_000 });
        layers.push({ layer: "Broadcast transaction", outcome: r.status === "success" ? "accepted" : "rejected", detail: `Mined in block ${r.blockNumber} with status ${r.status}` });
      } catch (e) {
        layers.push({ layer: "Broadcast transaction", outcome: "rejected", detail: `Node refused: ${revertReason(e)}` });
      }
    }
    return {
      attack: "unauthorized-oracle",
      description: `Attacker key ${attacker.address} signs a forged 95 kt observation at Galveston (KGLS) and relays it directly to the contract, bypassing the API.`,
      layers,
      revertReason: reason,
      failedTxHash,
      explorerUrl: failedTxHash ? txUrl(failedTxHash) : undefined,
      message: reason.startsWith("UnauthorizedOracle") ? "Rejected: the signer does not hold ORACLE_ROLE." : `Result: ${reason}`,
    };
  });
}

/** Try to get paid twice: settle an already-paid policy, and replay an already-accepted observation. */
export async function attackDuplicate(businessId: string, observationId: string, broadcast: boolean): Promise<AttackResult> {
  return serialized(async () => {
    const relayer = relayerClient();
    const oracle = oracleAccount();
    const cohort = DEPLOYMENT.cohort;
    const b = BIZ_BY_ID.get(businessId);
    const o = OBS_BY_ID.get(observationId);
    if (!relayer || !oracle || !cohort || !b || !o) throw new Error("not configured or unknown ids");
    const reserve = reserveAddress();
    const chainObs = toChainObservation(o);
    const digest = await publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "hashObservation", args: [chainObs] });
    const policyId = policyKey(cohort, b.policy.policyNumber);
    const layers: AttackResult["layers"] = [];
    let reason = "";
    try {
      await publicClient.simulateContract({ account: relayer.account, address: reserve, abi: parametricReserveAbi, functionName: "settle", args: [policyId, digest] });
      layers.push({ layer: "settle() again (eth_call)", outcome: "accepted", detail: "Policy has not been paid yet — run the replay first." });
    } catch (e) {
      reason = revertReason(e);
      layers.push({ layer: "settle() same policy, same storm (eth_call on Arc testnet)", outcome: "rejected", detail: reason });
    }
    try {
      const sig = await signObservation(oracle, chainObs);
      await publicClient.simulateContract({ account: relayer.account, address: reserve, abi: parametricReserveAbi, functionName: "submitObservation", args: [chainObs, sig] });
      layers.push({ layer: "Resubmit the same signed observation (eth_call)", outcome: "accepted", detail: "Observation not yet recorded on chain." });
    } catch (e) {
      layers.push({ layer: "Resubmit the same signed observation (eth_call on Arc testnet)", outcome: "rejected", detail: revertReason(e) });
    }
    let failedTxHash: Hex | undefined;
    if (broadcast && reason) {
      try {
        failedTxHash = await relayer.writeContract({ address: reserve, abi: parametricReserveAbi, functionName: "settle", args: [policyId, digest], gas: 200_000n });
        const r = await publicClient.waitForTransactionReceipt({ hash: failedTxHash, timeout: 60_000 });
        layers.push({ layer: "Broadcast duplicate settle()", outcome: r.status === "success" ? "accepted" : "rejected", detail: `Mined in block ${r.blockNumber} with status ${r.status}` });
      } catch (e) {
        layers.push({ layer: "Broadcast duplicate settle()", outcome: "rejected", detail: `Node refused: ${revertReason(e)}` });
      }
    }
    return {
      attack: "duplicate-payout",
      description: `Attempt to pay ${b.name} (${b.policy.policyNumber}) a second time for Hurricane Beryl.`,
      layers,
      revertReason: reason,
      failedTxHash,
      explorerUrl: failedTxHash ? txUrl(failedTxHash) : undefined,
      message: reason ? `Rejected by the contract: ${reason}` : "Not rejected — this policy has not been paid yet.",
    };
  });
}
