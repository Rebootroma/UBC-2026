import { describe, expect, it } from "vitest";
import { keccak256, toBytes } from "viem";
import { haversineKm, isValidCoord, rankineWindKt, stormAt } from "@/lib/geo";
import { parseMetarWind } from "@/lib/metar";
import { flagNeighborOutliers, normalizeIemRow, toIcao } from "@/lib/observations";
import { bandFor, computeExposure, surgeProxy } from "@/lib/exposure";
import { evaluatePolicy, triggeredBy } from "@/lib/policy";
import { BUSINESSES, OBSERVATIONS, TRACK, settlementPoints } from "@/lib/data";
import { usdToUnits } from "@/lib/config";
import type { Business, Observation } from "@/lib/types";

const row = (over: Partial<Record<string, string>> = {}) => ({
  station: "PSX",
  valid: "2024-07-08 09:42",
  lon: "-96.25",
  lat: "28.73",
  sknt: "50.00",
  gust: "70.00",
  metar: "KPSX 080942Z AUTO 33050G70KT 2SM +RA SCT008 OVC013 23/ A2913 RMK AO2 PK WND 33077/0921",
  ...over,
});

describe("METAR parsing", () => {
  it("parses sustained, gust and peak wind", () => {
    const w = parseMetarWind(row().metar)!;
    expect(w).toMatchObject({ station: "KPSX", directionDeg: 330, sustainedKt: 50, gustKt: 70, peakWindKt: 77 });
  });
  it("handles variable wind without gust", () => {
    expect(parseMetarWind("KDWH 071802Z VRB04KT 2SM -TSRA")).toMatchObject({ directionDeg: null, sustainedKt: 4, gustKt: null });
  });
  it("rejects garbage", () => {
    expect(parseMetarWind("")).toBeNull();
    expect(parseMetarWind("not a metar at all")).toBeNull();
    expect(parseMetarWind("KPSX 080942Z AUTO 10SM CLR")).toBeNull();
  });
});

describe("observation normalization and validation", () => {
  it("accepts a clean record and hashes the raw METAR", () => {
    const o = normalizeIemRow(row())!;
    expect(o.stationId).toBe("KPSX");
    expect(o.t).toBe(Date.parse("2024-07-08T09:42:00Z") / 1000);
    expect(o.verifiable).toBe(true);
    expect(o.sourceHash).toBe(keccak256(toBytes(row().metar)));
  });
  it("flags missing wind", () => {
    const o = normalizeIemRow(row({ sknt: "M", gust: "M", metar: "KPSX 080153Z AUTO 10SM FEW017 26/26 A2968" }))!;
    expect(o.issues).toContain("missing-wind");
    expect(o.verifiable).toBe(false);
  });
  it("flags a CSV value that disagrees with the raw METAR (tampering)", () => {
    const o = normalizeIemRow(row({ sknt: "90.00" }))!;
    expect(o.issues).toContain("metar-mismatch");
    expect(o.verifiable).toBe(false);
  });
  it("flags implausible and inconsistent values", () => {
    const o = normalizeIemRow(row({ sknt: "250.00", gust: "260.00", metar: "KPSX 080942Z AUTO 33250G260KT" }))!;
    expect(o.issues).toContain("implausible-value");
    const g = normalizeIemRow(row({ sknt: "50.00", gust: "30.00", metar: "KPSX 080942Z AUTO 33050G30KT" }))!;
    expect(g.issues).toContain("gust-below-sustained");
  });
  it("rejects malformed rows outright", () => {
    expect(normalizeIemRow(null)).toBeNull();
    expect(normalizeIemRow({ station: "x" })).toBeNull();
    expect(normalizeIemRow(row({ valid: "yesterday" }))).toBeNull();
  });
  it("maps FAA ids to ICAO", () => {
    expect(toIcao("PSX")).toBe("KPSX");
    expect(toIcao("6R3")).toBe("6R3");
  });
  it("flags a reading far above every neighbour", () => {
    const mk = (s: string, kt: number): Observation => ({ ...normalizeIemRow(row())!, id: s, stationId: s, sustainedKt: kt });
    const out = flagNeighborOutliers([mk("A", 95), mk("B", 30), mk("C", 32)], { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"] });
    expect(out[0].issues).toContain("neighbor-outlier");
    expect(out[0].verifiable).toBe(false);
    expect(out[1].verifiable).toBe(true);
  });
});

describe("geo", () => {
  it("validates coordinates", () => {
    expect(isValidCoord(29.7, -95.4)).toBe(true);
    expect(isValidCoord(91, 0)).toBe(false);
    expect(isValidCoord(NaN, 0)).toBe(false);
    expect(() => haversineKm(100, 0, 0, 0)).toThrow(RangeError);
  });
  it("computes known distances", () => {
    // Houston Hobby to Galveston ~ 50 km
    expect(haversineKm(29.6375, -95.2824, 29.2653, -94.8604)).toBeGreaterThan(50);
    expect(haversineKm(29.6375, -95.2824, 29.2653, -94.8604)).toBeLessThan(60);
  });
  it("interpolates the storm only between fixes and marks it", () => {
    const lf = TRACK.find((p) => p.landfall)!;
    expect(stormAt(TRACK, lf.t)).toMatchObject({ isFix: true, maxWindKt: 80 });
    const mid = stormAt(TRACK, lf.t + 600)!;
    expect(mid.isFix).toBe(false);
    expect(stormAt([], 0)).toBeNull();
  });
  it("vortex wind is bounded and never negative", () => {
    expect(rankineWindKt(80, 25, 0)).toBe(0);
    expect(rankineWindKt(80, 25, 25 * 1.852, false)).toBeCloseTo(80);
    expect(rankineWindKt(-5, 25, 10)).toBe(0);
    expect(rankineWindKt(80, 25, 5000)).toBeLessThan(15);
  });
});

describe("exposure model", () => {
  const base = { lat: 28.7089, lon: -96.2189, industry: "Hardware & Supply" as const, coastDistanceKm: 1, elevationM: 2 };
  it("is 0..100 and rises as the storm approaches", () => {
    const early = computeExposure(base, TRACK, Date.parse("2024-07-07T00:00:00Z") / 1000);
    const late = computeExposure(base, TRACK, Date.parse("2024-07-08T12:00:00Z") / 1000);
    expect(late.score).toBeGreaterThan(early.score);
    for (const r of [early, late]) expect(r.score).toBeGreaterThanOrEqual(0), expect(r.score).toBeLessThanOrEqual(100);
  });
  it("handles missing geography with high uncertainty instead of crashing", () => {
    const r = computeExposure({ ...base, coastDistanceKm: NaN, elevationM: NaN }, TRACK, Date.parse("2024-07-08T12:00:00Z") / 1000);
    expect(r.uncertainty).toBe("high");
    expect(Number.isFinite(r.score)).toBe(true);
  });
  it("handles an empty track and a far-away business", () => {
    expect(computeExposure(base, [], 0).score).toBeGreaterThanOrEqual(0);
    const far = computeExposure({ ...base, lat: 45, lon: -70 }, TRACK, Date.parse("2024-07-08T12:00:00Z") / 1000);
    expect(far.score).toBeLessThan(25);
  });
  it("band boundaries", () => {
    expect([bandFor(29), bandFor(30), bandFor(50), bandFor(70)]).toEqual(["Low", "Elevated", "High", "Severe"]);
    expect(surgeProxy(0, 0)).toBe(1);
    expect(surgeProxy(500, 100)).toBe(0);
  });
});

describe("deterministic policy evaluation", () => {
  const b = BUSINESSES[0];
  const obs = OBSERVATIONS.find((o) => o.stationId === "KPSX" && o.sustainedKt === 47 && o.verifiable)!;
  const ev = (over: Partial<Parameters<typeof evaluatePolicy>[0]> = {}) =>
    evaluatePolicy({ policy: b.policy, status: "Active", settledEvents: new Set(), observation: obs, eventId: "NHC:AL022024", ...over }).result;

  it("Gulf Coast Hardware: 45 kt trigger at KPSX", () => {
    expect(b.name).toBe("Gulf Coast Hardware");
    expect(b.policy).toMatchObject({ thresholdKt: 45, stations: ["KPSX"], coverageUsd: 5000 });
    expect(ev()).toBe("Eligible");
  });
  it("each rejection reason", () => {
    expect(ev({ observation: undefined })).toBe("UnknownObservation");
    expect(ev({ observation: { ...obs, verifiable: false } })).toBe("UnknownObservation");
    expect(ev({ settledEvents: new Set(["NHC:AL022024"]) })).toBe("AlreadySettledForEvent");
    expect(ev({ status: "Paid" })).toBe("PolicyNotActive");
    expect(ev({ observation: { ...obs, stationId: "KGLS" } })).toBe("StationNotApproved");
    expect(ev({ observation: { ...obs, t: Date.parse("2025-01-01T00:00:00Z") / 1000 } })).toBe("OutsideCoverageWindow");
    expect(ev({ observation: { ...obs, sustainedKt: 44 } })).toBe("BelowThreshold");
  });
  it("threshold is inclusive", () => {
    expect(ev({ observation: { ...obs, sustainedKt: 45 } })).toBe("Eligible");
  });
  it("never triggers from a forecast, model or proximity — only verified observations", () => {
    const fake: Observation = { ...obs, verifiable: false, issues: ["metar-mismatch"] };
    expect(triggeredBy(BUSINESSES, fake)).toHaveLength(0);
  });
  it("settlement points pay each policy at most once and in time order", () => {
    const pts = settlementPoints();
    const ids = pts.flatMap((p) => p.policies.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < pts.length; i++) expect(pts[i].observation.t).toBeGreaterThanOrEqual(pts[i - 1].observation.t);
    // Gulf Coast Hardware triggers at the 07:51Z KPSX report (47 kt)
    const p = pts.find((x) => x.policies.some((y: Business) => y.id === "RSL-0001"))!;
    expect(p.observation.time).toBe("2024-07-08T07:51:00.000Z");
  });
});

describe("fixtures and units", () => {
  it("are labeled and internally consistent", () => {
    expect(BUSINESSES).toHaveLength(80);
    expect(new Set(BUSINESSES.map((b) => b.wallet)).size).toBe(80);
    for (const b of BUSINESSES) {
      expect(isValidCoord(b.lat, b.lon)).toBe(true);
      expect(BigInt(b.policy.payoutUnits)).toBe(usdToUnits(b.policy.coverageUsd));
      expect(b.policy.stations.length).toBeGreaterThan(0);
    }
  });
  it("USDC conversion uses 6 decimals at demo scale 1:10,000", () => {
    expect(usdToUnits(5000)).toBe(500000n); // 0.50 USDC
  });
  it("Palacios station really went silent mid-storm (data-integrity case)", () => {
    const last = OBSERVATIONS.filter((o) => o.stationId === "KPSX").at(-1)!;
    expect(last.time).toBe("2024-07-08T10:22:00.000Z");
  });
});
