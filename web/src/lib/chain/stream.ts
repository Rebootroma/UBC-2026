import "server-only";
import crypto from "node:crypto";
import { decodeEventLog, type Hex } from "viem";
import { parametricReserveAbi } from "./abi";
import { DEPLOYMENT } from "./config";

/**
 * QuickNode Streams receiver. A Stream on Arc testnet filters every block's logs down to
 * ParametricReserve events (see web/quicknode/stream-filter.js) and POSTs them to /api/stream.
 * Events are held in process memory: they reach the dashboard without waiting for the block
 * explorer to index them, and the explorer/RPC read in state.ts remains the fallback after a cold start.
 */
export interface StreamEvent {
  name: string;
  txHash: Hex;
  blockNumber: string;
  logIndex: number;
  args: Record<string, string>;
  timestamp?: number;
}

interface Store {
  events: Map<string, StreamEvent>;
  deliveries: number;
  lastDeliveryAt: string | null;
  lastBlock: string | null;
}

const g = globalThis as unknown as { __qnStream?: Store };
const store: Store = (g.__qnStream ??= { events: new Map(), deliveries: 0, lastDeliveryAt: null, lastBlock: null });

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
export function ingestStreamPayload(payload: unknown): number {
  const logs = (payload as { logs?: RawLog[] } | null)?.logs;
  store.deliveries += 1;
  store.lastDeliveryAt = new Date().toISOString();
  if (!Array.isArray(logs) || !DEPLOYMENT.reserve) return 0;
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
      if (!store.events.has(key)) added += 1;
      store.events.set(key, { name: d.eventName, txHash: l.transactionHash, blockNumber, logIndex, args, timestamp: l.blockTimestamp ? Number(BigInt(l.blockTimestamp)) : undefined });
      if (!store.lastBlock || BigInt(blockNumber) > BigInt(store.lastBlock)) store.lastBlock = blockNumber;
    } catch {
      // not a ParametricReserve event
    }
  }
  return added;
}

export function streamEvents(): StreamEvent[] {
  return [...store.events.values()];
}

export function streamStatus() {
  return { configured: streamConfigured(), deliveries: store.deliveries, events: store.events.size, lastDeliveryAt: store.lastDeliveryAt, lastBlock: store.lastBlock };
}
