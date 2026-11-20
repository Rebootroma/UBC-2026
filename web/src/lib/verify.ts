import "server-only";
import { decodeEventLog, erc20Abi, type Address, type Hex } from "viem";
import { parametricReserveAbi } from "./chain/abi";
import { DEPLOYMENT, stationKey } from "./chain/config";
import { archiveUrl, observationDigest, sourceHashOf } from "./chain/digest";
import { publicClient } from "./chain/server";
import { BUSINESSES, OBSERVATIONS, STATION_BY_ID } from "./data";

export interface VerifyCheck {
  label: string;
  passed: boolean | null; // null = could not be checked
  detail: string;
}

export interface VerifiedPayout {
  business: { id: string; name: string; town: string; industry: string; policyNumber: string; thresholdKt: number; stations: string[]; coverageUsd: number } | null;
  holder: Address;
  amountUnits: string;
  deferred: boolean;
  checks: VerifyCheck[];
}

export interface Verification {
  txHash: Hex;
  found: boolean;
  error?: string;
  blockNumber?: string;
  blockTime?: number;
  reserve?: Address;
  observation?: { stationId: string; stationName: string; t: number; sustainedKt: number; gustKt: number | null; metar: string; sourceHash: Hex; digest: Hex; signer: Address; archiveUrl: string };
  shared: VerifyCheck[];
  payouts: VerifiedPayout[];
}

const STATION_BY_KEY = new Map([...STATION_BY_ID.keys()].map((id) => [stationKey(id).toLowerCase(), id]));
const BIZ_BY_WALLET = new Map(BUSINESSES.map((b) => [b.wallet.toLowerCase(), b]));

/** Re-download the station's reports from the public archive and look for the exact text the oracle signed. */
async function archiveHas(stationId: string, t: number, metar: string): Promise<boolean | null> {
  try {
    const res = await fetch(archiveUrl(stationId, t), { cache: "no-store", signal: AbortSignal.timeout(7000) });
    if (!res.ok) return null;
    const text = await res.text();
    return text.split("\n").some((line) => line.split(",").slice(2).join(",").trim() === metar);
  } catch {
    return null;
  }
}

/** Independently re-derive why a settlement transaction paid, using only the chain and public weather data. */
export async function verifyTransaction(txHash: Hex): Promise<Verification> {
  const base: Verification = { txHash, found: false, shared: [], payouts: [] };
  const reserve = DEPLOYMENT.reserve;
  if (!reserve) return { ...base, error: "Contract not deployed." };
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch {
    return { ...base, error: "No transaction with this hash on Arc testnet." };
  }
  const logs = receipt.logs.filter((l) => l.address.toLowerCase() === reserve.toLowerCase());
  const decoded = logs.flatMap((l) => {
    try {
      return [decodeEventLog({ abi: parametricReserveAbi, topics: l.topics, data: l.data })];
    } catch {
      return [];
    }
  });
  const transfers = receipt.logs.flatMap((l) => {
    if (l.address.toLowerCase() !== DEPLOYMENT.token.toLowerCase()) return [];
    try {
      const d = decodeEventLog({ abi: erc20Abi, topics: l.topics, data: l.data });
      return d.eventName === "Transfer" ? [d.args] : [];
    } catch {
      return [];
    }
  });
  const accepted = decoded.find((d) => d.eventName === "ObservationAccepted");
  const paid = decoded.filter((d) => d.eventName === "PayoutExecuted" || d.eventName === "PayoutDeferred");
  if (!paid.length) return { ...base, error: "This transaction is not a ResilienceOS settlement (no payout events from the reserve contract)." };

  const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
  const out: Verification = { ...base, found: true, blockNumber: receipt.blockNumber.toString(), blockTime: Number(block.timestamp), reserve };
  out.shared.push({ label: "Transaction succeeded on Arc testnet", passed: receipt.status === "success", detail: `Block ${receipt.blockNumber.toLocaleString()}, status ${receipt.status}` });

  // The observation is either accepted in this transaction or was accepted earlier and is referenced by digest.
  let digest: Hex | undefined;
  let stationId: string | undefined;
  let observedAt: number | undefined;
  let signer: Address | undefined;
  if (accepted && accepted.eventName === "ObservationAccepted") {
    digest = accepted.args.digest;
    stationId = STATION_BY_KEY.get(accepted.args.stationId.toLowerCase());
    observedAt = Number(accepted.args.observedAt);
    signer = accepted.args.signer;
  }
  const obs = stationId && observedAt ? OBSERVATIONS.find((o) => o.stationId === stationId && o.t === observedAt) : undefined;
  if (!digest || !obs || obs.sustainedKt === null || !signer) {
    out.shared.push({ label: "Observation located", passed: null, detail: "The observation for this payout was accepted in an earlier transaction; open that transaction to verify the weather data." });
  } else {
    const pub = { stationId: obs.stationId, t: obs.t, sustainedKt: obs.sustainedKt, gustKt: obs.gustKt, metar: obs.metar };
    const sourceHash = sourceHashOf(obs.metar);
    const recomputed = observationDigest(pub, reserve);
    const [inArchive, isOracle, onchainHash] = await Promise.all([
      archiveHas(obs.stationId, obs.t, obs.metar),
      publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "hasRole", args: [await publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "ORACLE_ROLE" }), signer] }).catch(() => null),
      Promise.resolve(obs.sourceHash),
    ]);
    out.observation = { stationId: obs.stationId, stationName: STATION_BY_ID.get(obs.stationId)?.name ?? obs.stationId, t: obs.t, sustainedKt: obs.sustainedKt, gustKt: obs.gustKt, metar: obs.metar, sourceHash, digest, signer, archiveUrl: archiveUrl(obs.stationId, obs.t) };
    out.shared.push(
      { label: "Weather report exists in the public NOAA archive", passed: inArchive, detail: inArchive === null ? "The Iowa Environmental Mesonet archive did not answer just now. Use the archive link to check it yourself." : inArchive ? "Re-downloaded from the Iowa Environmental Mesonet ASOS archive just now; the text is identical, character for character." : "The archive no longer returns this exact text." },
      { label: "Report hash matches", passed: sourceHash === onchainHash, detail: `keccak256(report) = ${sourceHash}` },
      { label: "Contract recorded exactly this report", passed: recomputed.toLowerCase() === digest.toLowerCase(), detail: `EIP-712 digest recomputed from the report, station, time and wind equals the digest in the contract's ObservationAccepted event (${digest.slice(0, 18)}…). Changing one character of the report changes this value.` },
      { label: "Signed by a registered oracle", passed: isOracle, detail: `${signer} ${isOracle ? "holds" : isOracle === false ? "does not hold" : "could not be checked for"} ORACLE_ROLE on the contract right now` },
    );
  }

  for (const p of paid) {
    if (p.eventName !== "PayoutExecuted" && p.eventName !== "PayoutDeferred") continue;
    const deferred = p.eventName === "PayoutDeferred";
    const policy = await publicClient.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "getPolicy", args: [p.args.policyId] }).catch(() => null) as { holder: Address; payoutAmount: bigint; thresholdDeciKnots?: number } | null;
    const holder = (p.eventName === "PayoutExecuted" ? p.args.holder : policy?.holder) as Address;
    const b = holder ? BIZ_BY_WALLET.get(holder.toLowerCase()) : undefined;
    const checks: VerifyCheck[] = [];
    if (b && obs && obs.sustainedKt !== null) {
      checks.push(
        { label: "Station is approved for this policy", passed: b.policy.stations.includes(obs.stationId), detail: `Policy ${b.policy.policyNumber} accepts ${b.policy.stations.join(", ")}; the report is from ${obs.stationId}` },
        { label: "Wind met the trigger", passed: obs.sustainedKt >= b.policy.thresholdKt, detail: `${obs.sustainedKt} kt sustained ≥ ${b.policy.thresholdKt} kt threshold` },
        { label: "Inside the coverage window", passed: obs.t >= Date.parse(b.policy.coverageStart) / 1000 && obs.t <= Date.parse(b.policy.coverageEnd) / 1000, detail: `${b.policy.coverageStart.slice(0, 10)} to ${b.policy.coverageEnd.slice(0, 10)}` },
      );
    }
    if (policy) checks.push({ label: "Amount equals the registered payout", passed: policy.payoutAmount === p.args.amount, detail: `${(Number(p.args.amount) / 1e6).toFixed(2)} USDC, fixed when the policy was registered` });
    if (!deferred) {
      const moved = transfers.some((t) => t.to.toLowerCase() === holder.toLowerCase() && t.from.toLowerCase() === reserve.toLowerCase() && t.value === p.args.amount);
      checks.push({ label: "USDC moved from the reserve to the policyholder", passed: moved, detail: `ERC-20 Transfer of ${(Number(p.args.amount) / 1e6).toFixed(2)} USDC to ${holder} in this transaction` });
    } else {
      checks.push({ label: "Recorded as owed", passed: true, detail: "The reserve was short, so the contract recorded the claim as a debt instead of paying. Nothing was lost." });
    }
    out.payouts.push({
      business: b ? { id: b.id, name: b.name, town: b.town, industry: b.industry, policyNumber: b.policy.policyNumber, thresholdKt: b.policy.thresholdKt, stations: b.policy.stations, coverageUsd: b.policy.coverageUsd } : null,
      holder,
      amountUnits: p.args.amount.toString(),
      deferred,
      checks,
    });
  }
  return out;
}
