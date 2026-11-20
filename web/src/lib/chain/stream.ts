import "server-only";
import crypto from "node:crypto";
import { getCache } from "@vercel/functions";
import { decodeEventLog, type Hex } from "viem";
import { parametricReserveAbi } from "./abi";
import { DEPLOYMENT } from "./config";

/**
 * QuickNode Streams receiver. A Stream on Arc testnet filters every block's logs down to
 * ParametricReserve events (see web/quicknode/stream-filter.js) and POSTs them to /api/stream.
 * Events are kept in the Vercel Runtime Cache, which every function instance in the region shares, so a
 * delivery handled by one instance is visible to the next request. Outside Vercel the same store lives in
 * process memory. The explorer/RPC read in state.ts remains the fallback if the cache is evicted.
 */
export interface StreamEvent {
  name: string;
  txHash: Hex;
  blockNumber: string;
  logIndex: number;
  args: Record<string, string>;
  timestamp?: number;
  /** When the Stream delivered this log to /api/stream. */
  receivedAt?: string;
}

interface Store {
  events: Record<string, StreamEvent>;
  deliveries: number;
  lastDeliveryAt: string | null;
  lastBlock: string | null;
}

const KEY = `qn-stream:${DEPLOYMENT.reserve ?? "none"}`;
const empty = (): Store => ({ events: {}, deliveries: 0, lastDeliveryAt: null, lastBlock: null });
const g = globalThis as unknown as { __qnStream?: Store };

async function load(): Promise<Store> {
  try {
    const hit = (await getCache().get(KEY)) as Store | undefined | null;
    if (hit && typeof hit === "object" && hit.events) return hit;
  } catch {
    // no runtime cache (local run): fall through to process memory
  }
  return (g.__qnStream ??= empty());
}

async function save(store: Store): Promise<void> {
  g.__qnStream = store;
  try {
    await getCache().set(KEY, store, { ttl: 60 * 60 * 24 * 14, name: "quicknode-stream-events" });
  } catch {
    // process memory only
  }
}

export function streamConfigured(): boolean {
  return !!process.env.QUICKNODE_STREAM_TOKEN;
}

/** HMAC-SHA256 over nonce + timestamp + raw body, hex encoded, keyed with the Stream's security token. */
export function verifyStreamSignature(body: string, nonce: string | null, timestamp: string | null, signature: string | null): boolean {
  const secret = process.env.QUICKNODE_STREAM_TOKEN;
  if (!secret || !nonce || !timestamp || !signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha256", Buffer.from(secret)).update(Buffer.from(nonce + timestamp + body)).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

type RawLog = { address?: string; topics?: Hex[]; data?: Hex; transactionHash?: Hex; blockNumber?: string | number; logIndex?: string | number; blockTimestamp?: string | number };

/** Accepts the filter's `{ logs: [...] }` output. Logs from any other address are ignored. Returns how many new events were stored. */
export async function ingestStreamPayload(payload: unknown): Promise<number> {
  const logs = (payload as { logs?: RawLog[] } | null)?.logs;
  const store = await load();
  store.deliveries += 1;
  store.lastDeliveryAt = new Date().toISOString();
  if (!Array.isArray(logs) || !DEPLOYMENT.reserve) {
    await save(store);
    return 0;
  }
  const reserve = DEPLOYMENT.reserve.toLowerCase();
  let added = 0;
  for (const l of logs) {
    if (!l || l.address?.toLowerCase() !== reserve || !l.topics?.length || !l.transactionHash) continue;
    try {
      const d = decodeEventLog({ abi: parametricReserveAbi, topics: l.topics as [Hex, ...Hex[]], data: l.data ?? "0x" });
      const args: Record<string, string> = {};
      for (const [k, v] of Object.entries(d.args ?? {})) args[k] = Array.isArray(v) ? v.join(",") : String(v);
      const blockNumber = BigInt(l.blockNumber ?? 0).toString();
      const logIndex = Number(BigInt(l.logIndex ?? 0));
      const key = `${l.transactionHash}-${logIndex}`;
      const receivedAt = store.events[key]?.receivedAt ?? store.lastDeliveryAt ?? undefined;
      if (!store.events[key]) added += 1;
      store.events[key] = { name: d.eventName, txHash: l.transactionHash, blockNumber, logIndex, args, timestamp: l.blockTimestamp ? Number(BigInt(l.blockTimestamp)) : undefined, receivedAt };
      if (!store.lastBlock || BigInt(blockNumber) > BigInt(store.lastBlock)) store.lastBlock = blockNumber;
    } catch {
      // not a ParametricReserve event
    }
  }
  await save(store);
  return added;
}

export async function streamSnapshot() {
  const store = await load();
  return {
    events: Object.values(store.events),
    status: { configured: streamConfigured(), deliveries: store.deliveries, events: Object.keys(store.events).length, lastDeliveryAt: store.lastDeliveryAt, lastBlock: store.lastBlock },
  };
}
