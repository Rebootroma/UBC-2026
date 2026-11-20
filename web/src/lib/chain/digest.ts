import { hashTypedData, keccak256, toBytes, type Address, type Hex } from "viem";
import { arcTestnet, eventKey, stationKey } from "./config";
import { EVENT } from "../config";

/**
 * Client-safe recomputation of the EIP-712 digest that ParametricReserve stores for an observation.
 * Everything here is derived from public inputs: the raw METAR text, the station, the time and the wind.
 * It mirrors OBSERVATION_TYPES / signObservation in ./server.ts and `hashObservation` in the contract.
 */
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

export interface PublicObservation {
  stationId: string; // ICAO, e.g. KPSX
  t: number; // unix seconds
  sustainedKt: number;
  gustKt: number | null;
  metar: string;
}

export const sourceHashOf = (metar: string): Hex => keccak256(toBytes(metar));

export function observationDigest(o: PublicObservation, reserve: Address): Hex {
  return hashTypedData({
    domain: { name: "ResilienceOS ParametricReserve", version: "1", chainId: arcTestnet.id, verifyingContract: reserve },
    types: OBSERVATION_TYPES,
    primaryType: "Observation",
    message: {
      eventId: eventKey(EVENT.atcfId),
      stationId: stationKey(o.stationId),
      observedAt: BigInt(o.t),
      sustainedDeciKnots: Math.round(o.sustainedKt * 10),
      gustDeciKnots: o.gustKt === null ? 0 : Math.round(o.gustKt * 10),
      sourceHash: sourceHashOf(o.metar),
    },
  });
}

/** Public Iowa Environmental Mesonet query returning the station's raw METARs for the UTC day of `t`. */
export function archiveUrl(stationId: string, t: number): string {
  const d = new Date(t * 1000);
  const n = new Date((t + 86400) * 1000);
  const q = new URLSearchParams({
    station: stationId.replace(/^K/, ""),
    data: "metar",
    year1: String(d.getUTCFullYear()), month1: String(d.getUTCMonth() + 1), day1: String(d.getUTCDate()),
    year2: String(n.getUTCFullYear()), month2: String(n.getUTCMonth() + 1), day2: String(n.getUTCDate()),
    tz: "Etc/UTC", format: "onlycomma",
  });
  return `https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?${q}&report_type=3&report_type=4`;
}
