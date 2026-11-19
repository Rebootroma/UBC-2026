import "server-only";
import { decodeEventLog, erc20Abi, type Address, type Hex } from "viem";
import { parametricReserveAbi } from "./abi";
import { DEPLOYMENT, EXPLORER, policyKey } from "./config";
import { publicClient } from "./server";
import { BUSINESSES } from "../data";
import { POLICY_STATUS, type PolicyStatus } from "../types";

export interface ChainPolicy {
  businessId: string;
  policyId: Hex;
  status: PolicyStatus;
  paidUnits: string;
  owedUnits: string;
  payoutUnits: string;
  holder: Address;
}

export interface ChainEvent {
  name: string;
  txHash: Hex;
  blockNumber: string;
  logIndex: number;
  args: Record<string, string>;
  timestamp?: number;
}

export interface ChainState {
  deployed: boolean;
  reserve: Address | null;
  token: Address;
  cohort: string | null;
  blockNumber: string;
  reserveBalance: string;
  freeReserve: string;
  totalOwed: string;
  totalPaid: string;
  activeExposure: string;
  observationCount: string;
  policyCount: string;
  paused: boolean;
  policies: ChainPolicy[];
  events: ChainEvent[];
  fetchedAt: string;
  error?: string;
}

const EMPTY = (error?: string): ChainState => ({
  deployed: false,
  reserve: null,
  token: DEPLOYMENT.token,
  cohort: DEPLOYMENT.cohort,
  blockNumber: "0",
  reserveBalance: "0",
  freeReserve: "0",
  totalOwed: "0",
  totalPaid: "0",
  activeExposure: "0",
  observationCount: "0",
  policyCount: "0",
  paused: false,
  policies: [],
  events: [],
  fetchedAt: new Date().toISOString(),
  error,
});

let cache: { at: number; state: ChainState } | null = null;

export function invalidateChainState() {
  cache = null;
}

export async function readChainState(maxAgeMs = 4000): Promise<ChainState> {
  if (cache && Date.now() - cache.at < maxAgeMs) return cache.state;
  const reserve = DEPLOYMENT.reserve;
  if (!reserve) return EMPTY("Contract not deployed yet.");
  try {
    const c = { address: reserve, abi: parametricReserveAbi } as const;
    const cohort = DEPLOYMENT.cohort;
    const [blockNumber, scalars, policies, events] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.multicall({
        allowFailure: false,
        contracts: [
          { ...c, functionName: "reserveBalance" },
          { ...c, functionName: "freeReserve" },
          { ...c, functionName: "totalOwed" },
          { ...c, functionName: "totalPaid" },
          { ...c, functionName: "activeExposure" },
          { ...c, functionName: "observationCount" },
          { ...c, functionName: "policyCount" },
          { ...c, functionName: "paused" },
        ],
      }),
      cohort
        ? publicClient.multicall({
            allowFailure: false,
            contracts: BUSINESSES.map((b) => ({ ...c, functionName: "getPolicy" as const, args: [policyKey(cohort, b.policy.policyNumber)] as const })),
          })
        : Promise.resolve([]),
      readReserveEvents(reserve),
    ]);
    const [bal, free, owed, paid, exposure, obsCount, polCount, paused] = scalars as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
    const state: ChainState = {
      deployed: true,
      reserve,
      token: DEPLOYMENT.token,
      cohort,
      blockNumber: blockNumber.toString(),
      reserveBalance: bal.toString(),
      freeReserve: free.toString(),
      totalOwed: owed.toString(),
      totalPaid: paid.toString(),
      activeExposure: exposure.toString(),
      observationCount: obsCount.toString(),
      policyCount: polCount.toString(),
      paused,
      policies: (policies as { holder: Address; payoutAmount: bigint; status: number; paidAmount: bigint; owedAmount: bigint }[]).map((p, i) => ({
        businessId: BUSINESSES[i].id,
        policyId: policyKey(cohort!, BUSINESSES[i].policy.policyNumber),
        status: POLICY_STATUS[p.status] ?? "None",
        paidUnits: p.paidAmount.toString(),
        owedUnits: p.owedAmount.toString(),
        payoutUnits: p.payoutAmount.toString(),
        holder: p.holder,
      })),
      events,
      fetchedAt: new Date().toISOString(),
    };
    cache = { at: Date.now(), state };
    return state;
  } catch (e) {
    return { ...EMPTY(`Chain read failed: ${(e as Error).message.split("\n")[0]}`), reserve, deployed: true };
  }
}

/** Reserve contract logs via the Arc Blockscout API, falling back to chunked eth_getLogs. */
async function readReserveEvents(reserve: Address): Promise<ChainEvent[]> {
  try {
    const out: ChainEvent[] = [];
    let url: string | null = `${EXPLORER}/api/v2/addresses/${reserve}/logs`;
    for (let page = 0; url && page < 10; page++) {
      const res: Response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`blockscout ${res.status}`);
      const body = (await res.json()) as {
        items: { topics: (Hex | null)[]; data: Hex; transaction_hash?: Hex; tx_hash?: Hex; block_number: number; index: number; block_timestamp?: string }[];
        next_page_params: Record<string, string | number> | null;
      };
      for (const it of body.items) {
        const ev = decode({ topics: it.topics.filter((t): t is Hex => !!t), data: it.data });
        if (ev) out.push({ ...ev, txHash: (it.transaction_hash ?? it.tx_hash)!, blockNumber: String(it.block_number), logIndex: it.index, timestamp: it.block_timestamp ? Date.parse(it.block_timestamp) / 1000 : undefined });
      }
      url = body.next_page_params
        ? `${EXPLORER}/api/v2/addresses/${reserve}/logs?${new URLSearchParams(Object.entries(body.next_page_params).map(([k, v]) => [k, String(v)]))}`
        : null;
    }
    // An indexer that hasn't seen the contract (or a local fork) returns nothing: fall back to the node itself.
    if (out.length === 0) throw new Error("indexer returned no logs");
    return out.sort((a, b) => Number(BigInt(b.blockNumber) - BigInt(a.blockNumber)) || b.logIndex - a.logIndex);
  } catch {
    return readReserveEventsRpc(reserve);
  }
}

async function readReserveEventsRpc(reserve: Address): Promise<ChainEvent[]> {
  const latest = await publicClient.getBlockNumber();
  const from = BigInt(DEPLOYMENT.deployBlock || 0);
  const out: ChainEvent[] = [];
  const STEP = 9_000n;
  for (let start = from; start <= latest; start += STEP + 1n) {
    const end = start + STEP > latest ? latest : start + STEP;
    const logs = await publicClient.getLogs({ address: reserve, fromBlock: start, toBlock: end });
    for (const l of logs) {
      const ev = decode({ topics: l.topics, data: l.data });
      if (ev) out.push({ ...ev, txHash: l.transactionHash!, blockNumber: String(l.blockNumber), logIndex: l.logIndex ?? 0 });
    }
  }
  return out.reverse();
}

function decode(l: { topics: readonly Hex[]; data: Hex }): { name: string; args: Record<string, string> } | null {
  try {
    const d = decodeEventLog({ abi: parametricReserveAbi, topics: l.topics as unknown as [Hex, ...Hex[]], data: l.data });
    const args: Record<string, string> = {};
    for (const [k, v] of Object.entries(d.args ?? {})) args[k] = Array.isArray(v) ? v.join(",") : String(v);
    return { name: d.eventName, args };
  } catch {
    return null;
  }
}

export async function usdcBalance(addr: Address): Promise<bigint> {
  return publicClient.readContract({ address: DEPLOYMENT.token, abi: erc20Abi, functionName: "balanceOf", args: [addr] });
}
