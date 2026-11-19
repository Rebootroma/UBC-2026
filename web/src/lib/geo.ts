import type { TrackPoint } from "./types";

const R_KM = 6371.0088;
export const KM_PER_NM = 1.852;

export function isValidCoord(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  );
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!isValidCoord(lat1, lon1) || !isValidCoord(lat2, lon2)) throw new RangeError("invalid coordinate");
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export interface StormState {
  t: number;
  lat: number;
  lon: number;
  maxWindKt: number;
  minPressureMb: number;
  rmwNm: number;
  status: string;
  /** true when this exact time is a best-track fix, false when interpolated */
  isFix: boolean;
}

/** Linear interpolation of the storm between best-track fixes. Visual aid only. */
export function stormAt(track: TrackPoint[], t: number): StormState | null {
  if (track.length === 0) return null;
  if (t <= track[0].t) return toState(track[0], true);
  const last = track[track.length - 1];
  if (t >= last.t) return toState(last, true);
  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i];
    const b = track[i + 1];
    if (t >= a.t && t <= b.t) {
      if (t === a.t) return toState(a, true);
      if (t === b.t) return toState(b, true);
      const f = (t - a.t) / (b.t - a.t);
      const lerp = (x: number, y: number) => x + (y - x) * f;
      return {
        t,
        lat: lerp(a.lat, b.lat),
        lon: lerp(a.lon, b.lon),
        maxWindKt: lerp(a.maxWindKt, b.maxWindKt),
        minPressureMb: lerp(a.minPressureMb, b.minPressureMb),
        rmwNm: lerp(a.rmwNm ?? 30, b.rmwNm ?? 30),
        status: f < 0.5 ? a.status : b.status,
        isFix: false,
      };
    }
  }
  return null;
}

function toState(p: TrackPoint, isFix: boolean): StormState {
  return {
    t: p.t,
    lat: p.lat,
    lon: p.lon,
    maxWindKt: p.maxWindKt,
    minPressureMb: p.minPressureMb,
    rmwNm: p.rmwNm ?? 30,
    status: p.status,
    isFix,
  };
}

/**
 * Modeled sustained wind (kt) at a distance from the storm centre using a modified Rankine vortex.
 * This is a coarse visual/exposure model, NOT a measurement and NOT used for payout eligibility.
 */
export function rankineWindKt(maxWindKt: number, rmwNm: number, distanceKm: number, overLand = true): number {
  if (!(maxWindKt > 0) || !(rmwNm > 0) || !(distanceKm >= 0)) return 0;
  const rmwKm = rmwNm * KM_PER_NM;
  const x = 0.6; // decay exponent outside the RMW
  const v = distanceKm <= rmwKm ? maxWindKt * (distanceKm / rmwKm) : maxWindKt * Math.pow(rmwKm / distanceKm, x);
  return Math.max(0, overLand ? v * 0.85 : v);
}

/** Build a GeoJSON polygon approximating a circle (for wind-radius overlays). */
export function circlePolygon(lat: number, lon: number, radiusKm: number, steps = 64): [number, number][] {
  const coords: [number, number][] = [];
  const latR = (lat * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const brg = (i / steps) * 2 * Math.PI;
    const dLat = (radiusKm / R_KM) * Math.cos(brg);
    const dLon = ((radiusKm / R_KM) * Math.sin(brg)) / Math.cos(latR);
    coords.push([lon + (dLon * 180) / Math.PI, lat + (dLat * 180) / Math.PI]);
  }
  return coords;
}
