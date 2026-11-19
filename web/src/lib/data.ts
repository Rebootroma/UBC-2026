import trackJson from "@/data/track.json";
import stationsJson from "@/data/stations.json";
import observationsJson from "@/data/observations.json";
import businessesJson from "@/data/businesses.json";
import metaJson from "@/data/meta.json";
import type { Business, Observation, Station, TrackPoint } from "./types";

export const TRACK = trackJson as TrackPoint[];
export const STATIONS = stationsJson as Station[];
export const OBSERVATIONS = observationsJson as Observation[];
export const BUSINESSES = businessesJson as Business[];
export const META = metaJson;

export const OBS_BY_ID = new Map(OBSERVATIONS.map((o) => [o.id, o]));
export const BIZ_BY_ID = new Map(BUSINESSES.map((b) => [b.id, b]));
export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));

/**
 * Settlement points of the replay: the first verifiable observation at each station that satisfies
 * at least one policy threshold that has not already been satisfied by an earlier observation.
 */
export function settlementPoints(): { observation: Observation; policies: Business[] }[] {
  const covered = new Set<string>();
  const out: { observation: Observation; policies: Business[] }[] = [];
  for (const o of OBSERVATIONS) {
    if (!o.verifiable || o.sustainedKt === null) continue;
    const hit = BUSINESSES.filter((b) => {
      if (covered.has(b.id)) return false;
      const s = Date.parse(b.policy.coverageStart) / 1000;
      const e = Date.parse(b.policy.coverageEnd) / 1000;
      return b.policy.stations.includes(o.stationId) && o.t >= s && o.t <= e && o.sustainedKt! >= b.policy.thresholdKt;
    });
    if (hit.length) {
      hit.forEach((b) => covered.add(b.id));
      out.push({ observation: o, policies: hit });
    }
  }
  return out;
}
