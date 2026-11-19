// Shared domain types for ResilienceOS.

/** Data provenance label. Every value shown in the UI carries one of these. */
export type Provenance =
  | "observed" // historical measurement from a named public source
  | "best-track" // NHC post-storm best track (hindsight analysis, not real-time)
  | "interpolated" // visual interpolation between best-track fixes
  | "modeled" // output of the ResilienceOS exposure model
  | "synthetic" // fictional business / policy data
  | "onchain"; // read from Arc testnet

export interface TrackPoint {
  time: string; // ISO UTC
  t: number; // unix seconds
  lat: number;
  lon: number;
  status: string; // TS, HU, TD, EX
  maxWindKt: number;
  minPressureMb: number;
  rmwNm: number | null; // radius of maximum wind, nautical miles
  landfall: boolean;
  r34Nm: [number, number, number, number]; // NE, SE, SW, NW
  r64Nm: [number, number, number, number];
}

export interface Station {
  id: string; // ICAO, e.g. KPSX
  sid: string; // IEM id, e.g. PSX
  name: string;
  lat: number;
  lon: number;
  elevationM: number | null;
}

export type ObservationIssue =
  | "missing-wind"
  | "metar-mismatch"
  | "gust-below-sustained"
  | "implausible-value"
  | "neighbor-outlier";

export interface Observation {
  id: string; // `${station}-${unix}`
  stationId: string; // ICAO
  time: string;
  t: number;
  sustainedKt: number | null;
  gustKt: number | null;
  peakWindKt: number | null; // PK WND remark if present
  pressureMb: number | null;
  metar: string;
  sourceHash: `0x${string}`; // keccak256(metar)
  issues: ObservationIssue[];
  /** Eligible to be signed by the oracle: parsed independently from the METAR and cross-checked. */
  verifiable: boolean;
}

export type Industry =
  | "Hardware & Supply"
  | "Restaurant"
  | "Grocery"
  | "Marine Services"
  | "Auto Repair"
  | "Medical Clinic"
  | "Retail"
  | "Hospitality"
  | "Construction"
  | "Logistics"
  | "Pharmacy"
  | "Childcare";

export interface Business {
  id: string; // RSL-0001
  name: string;
  industry: Industry;
  town: string;
  lat: number;
  lon: number;
  employees: number;
  monthlyRevenueUsd: number;
  elevationM: number; // approximate town-level elevation (modeled proxy)
  coastDistanceKm: number; // modeled proxy
  wallet: `0x${string}`;
  policy: PolicyTerms;
}

export interface PolicyTerms {
  policyNumber: string; // RSL-P-0001
  /** Modeled coverage the policy represents, in USD. */
  coverageUsd: number;
  /** Actual on-chain payout in testnet USDC base units (6 decimals) = coverageUsd * demo scale. */
  payoutUnits: string; // bigint as string
  thresholdKt: number; // sustained-wind trigger (inclusive)
  stations: string[]; // approved ICAO stations
  coverageStart: string;
  coverageEnd: string;
}

export type Eligibility =
  | "Eligible"
  | "PolicyNotActive"
  | "UnknownObservation"
  | "StationNotApproved"
  | "OutsideCoverageWindow"
  | "BelowThreshold"
  | "AlreadySettledForEvent";

/** Order must match ParametricReserve.Eligibility. */
export const ELIGIBILITY_CODES: Eligibility[] = [
  "Eligible",
  "PolicyNotActive",
  "UnknownObservation",
  "StationNotApproved",
  "OutsideCoverageWindow",
  "BelowThreshold",
  "AlreadySettledForEvent",
];

export const POLICY_STATUS = ["None", "Active", "Paid", "Deferred", "Cancelled"] as const;
export type PolicyStatus = (typeof POLICY_STATUS)[number];
