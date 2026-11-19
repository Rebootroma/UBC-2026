import { haversineKm, rankineWindKt, stormAt } from "./geo";
import type { Business, Industry, TrackPoint } from "./types";

/**
 * ResilienceOS exposure model. Transparent, deterministic, and deliberately simple.
 * It ranks businesses for attention; it is NOT actuarially validated and it NEVER decides payouts.
 */

export const INDUSTRY_SENSITIVITY: Record<Industry, number> = {
  "Marine Services": 0.95,
  Restaurant: 0.85,
  Hospitality: 0.85,
  Grocery: 0.8,
  Retail: 0.7,
  "Hardware & Supply": 0.55, // demand often rises after storms, but inventory and access are exposed
  "Auto Repair": 0.6,
  Childcare: 0.75,
  "Medical Clinic": 0.65,
  Pharmacy: 0.6,
  Construction: 0.45,
  Logistics: 0.7,
};

export interface ExposureFactors {
  windHazard: number; // 0..1 from modeled peak wind so far
  surgeProxy: number; // 0..1 from coast distance and elevation
  industry: number; // 0..1
  proximity: number; // 0..1 from closest approach to the storm centre so far
}

export interface ExposureResult {
  score: number; // 0..100
  band: "Low" | "Elevated" | "High" | "Severe";
  modeledPeakWindKt: number;
  closestApproachKm: number;
  factors: ExposureFactors;
  uncertainty: "low" | "medium" | "high";
  notes: string[];
}

export const WEIGHTS = { windHazard: 0.45, surgeProxy: 0.2, industry: 0.2, proximity: 0.15 } as const;

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

export function surgeProxy(coastDistanceKm: number, elevationM: number): number {
  if (!Number.isFinite(coastDistanceKm) || !Number.isFinite(elevationM)) return 0.5; // unknown → mid, flagged
  const coast = clamp01(1 - coastDistanceKm / 60);
  const elev = clamp01(1 - elevationM / 15);
  return clamp01(0.6 * coast + 0.4 * elev);
}

export function bandFor(score: number): ExposureResult["band"] {
  if (score >= 70) return "Severe";
  if (score >= 50) return "High";
  if (score >= 30) return "Elevated";
  return "Low";
}

/**
 * Exposure of a business up to replay time `t`, using best-track positions sampled every 30 minutes.
 */
export function computeExposure(b: Pick<Business, "lat" | "lon" | "industry" | "coastDistanceKm" | "elevationM">, track: TrackPoint[], t: number): ExposureResult {
  const notes: string[] = [];
  let peak = 0;
  let closest = Infinity;
  if (track.length > 0) {
    const start = track[0].t;
    const end = Math.min(t, track[track.length - 1].t);
    for (let s = start; s <= end; s += 1800) {
      const st = stormAt(track, s);
      if (!st) continue;
      const d = haversineKm(b.lat, b.lon, st.lat, st.lon);
      closest = Math.min(closest, d);
      peak = Math.max(peak, rankineWindKt(st.maxWindKt, st.rmwNm, d));
    }
  }
  if (!Number.isFinite(closest)) {
    closest = Number.POSITIVE_INFINITY;
    notes.push("No storm positions before this time.");
  }

  const factors: ExposureFactors = {
    windHazard: clamp01((peak - 20) / 60), // 20 kt → 0, 80 kt → 1
    surgeProxy: surgeProxy(b.coastDistanceKm, b.elevationM),
    industry: INDUSTRY_SENSITIVITY[b.industry] ?? 0.6,
    proximity: Number.isFinite(closest) ? clamp01(1 - closest / 250) : 0,
  };
  // Surge only matters once the storm is close enough to push water; scale by proximity.
  const surgeEffective = factors.surgeProxy * Math.max(factors.proximity, factors.windHazard);
  const raw =
    WEIGHTS.windHazard * factors.windHazard +
    WEIGHTS.surgeProxy * surgeEffective +
    WEIGHTS.industry * factors.industry * Math.max(factors.windHazard, factors.proximity * 0.5) +
    WEIGHTS.proximity * factors.proximity;
  const score = Math.round(clamp01(raw) * 100);

  let uncertainty: ExposureResult["uncertainty"] = "medium";
  if (!Number.isFinite(b.coastDistanceKm) || !Number.isFinite(b.elevationM)) {
    uncertainty = "high";
    notes.push("Missing geography inputs; surge proxy defaulted to 0.5.");
  } else if (Number.isFinite(closest) && closest < 60) {
    uncertainty = "high";
    notes.push("Near the storm core, a simple vortex model is least reliable.");
  } else if (Number.isFinite(closest) && closest > 300) {
    uncertainty = "low";
  }
  return { score, band: bandFor(score), modeledPeakWindKt: Math.round(peak), closestApproachKm: closest, factors, uncertainty, notes };
}
