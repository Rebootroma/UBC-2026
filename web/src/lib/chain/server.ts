import "server-only";
import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet, DEPLOYMENT, eventKey, stationKey } from "./config";
import type { Observation } from "../types";
import { EVENT } from "../config";

export const publicClient = createPublicClient({ chain: arcTestnet, transport: http(undefined, { timeout: 20_000, retryCount: 2 }) });

function key(name: string): Hex | null {
  const v = process.env[name];
  return v && /^0x[0-9a-fA-F]{64}$/.test(v) ? (v as Hex) : null;
}

/** Relayer / policy-admin wallet. Pays gas in USDC; never receives payouts. */
export function relayerClient() {
  const k = key("ADMIN_PRIVATE_KEY");
  if (!k) return null;
  return createWalletClient({ account: privateKeyToAccount(k), chain: arcTestnet, transport: http() });
}

export function oracleAccount() {
  const k = key("ORACLE_PRIVATE_KEY");
  return k ? privateKeyToAccount(k) : null;
}

/** A key that holds NO oracle role. Used only by the attack demonstration. */
export function attackerAccount() {
  const k = key("ATTACKER_PRIVATE_KEY");
  return k ? privateKeyToAccount(k) : null;
}

export function reserveAddress(): Address {
  if (!DEPLOYMENT.reserve) throw new Error("ParametricReserve is not deployed yet (web/src/data/deployment.json).");
  return DEPLOYMENT.reserve;
}

export interface ChainObservation {
  eventId: Hex;
  stationId: Hex;
  observedAt: bigint;
  sustainedDeciKnots: number;
  gustDeciKnots: number;
  sourceHash: Hex;
}

export function toChainObservation(o: Observation): ChainObservation {
  if (o.sustainedKt === null) throw new Error("observation has no sustained wind");
  return {
    eventId: eventKey(EVENT.atcfId),
    stationId: stationKey(o.stationId),
    observedAt: BigInt(o.t),
    sustainedDeciKnots: Math.round(o.sustainedKt * 10),
    gustDeciKnots: o.gustKt === null ? 0 : Math.round(o.gustKt * 10),
    sourceHash: o.sourceHash,
  };
}

export const OBSERVATION_TYPES = {
  Observation: [
    { name: "eventId", type: "bytes32" },
    { name: "stationId", type: "bytes32" },
    { name: "observedAt", type: "uint64" },
    { name: "sustainedDeciKnots", type: "uint32" },
    { name: "gustDeciKnots", type: "uint32" },
    { name: "sourceHash", type: "bytes32" },
  ],
} as const;

export async function signObservation(account: ReturnType<typeof privateKeyToAccount>, obs: ChainObservation): Promise<Hex> {
  return account.signTypedData({
    domain: { name: "ResilienceOS ParametricReserve", version: "1", chainId: arcTestnet.id, verifyingContract: reserveAddress() },
    types: OBSERVATION_TYPES,
    primaryType: "Observation",
    message: obs,
  });
}

/** Serialise all relayer writes in this process so nonces never collide. */
let queue: Promise<unknown> = Promise.resolve();
export function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}
