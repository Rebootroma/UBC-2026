import { keccak256, toBytes } from "viem";
import { z } from "zod";
import { parseMetarWind } from "./metar";
import type { Observation, ObservationIssue } from "./types";

export const MAX_PLAUSIBLE_KT = 200;

/** Schema for one row of the Iowa Environmental Mesonet ASOS CSV export (format=onlycomma, missing=M). */
export const IemRowSchema = z.object({
  station: z.string().regex(/^[A-Z0-9]{3,4}$/),
  valid: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
  lon: z.string(),
  lat: z.string(),
  sknt: z.string(),
  gust: z.string(),
  metar: z.string().min(10),
});
export type IemRow = z.infer<typeof IemRowSchema>;

function num(v: string): number | null {
  if (v === "M" || v === "" || v === "T") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** IEM 3-letter ids are FAA ids; the ICAO form used on chain adds the K prefix for CONUS stations. */
export function toIcao(sid: string): string {
  return sid.length === 3 && /^[A-Z]{3}$/.test(sid) ? `K${sid}` : sid;
}

export function stationKey(icao: string): `0x${string}` {
  return keccak256(toBytes(`ASOS:${icao}`));
}

/**
 * Normalize and validate a raw IEM row. Never throws on bad data: problems are recorded as issues,
 * and only clean, cross-checked observations are marked verifiable (signable by the oracle).
 */
export function normalizeIemRow(raw: unknown): Observation | null {
  const parsed = IemRowSchema.safeParse(raw);
  if (!parsed.success) return null;
  const r = parsed.data;
  const icao = toIcao(r.station);
  const t = Date.parse(r.valid.replace(" ", "T") + ":00Z") / 1000;
  if (!Number.isFinite(t)) return null;

  const issues: ObservationIssue[] = [];
  const sustained = num(r.sknt);
  const gust = num(r.gust);
  const metar = parseMetarWind(r.metar);

  if (sustained === null) issues.push("missing-wind");
  if (sustained !== null) {
    // Independent second parse: CSV column vs the raw METAR wind group.
    if (!metar || metar.sustainedKt !== sustained || (gust !== null && metar.gustKt !== gust)) {
      issues.push("metar-mismatch");
    }
    if (sustained < 0 || sustained > MAX_PLAUSIBLE_KT || (gust !== null && (gust < 0 || gust > MAX_PLAUSIBLE_KT))) {
      issues.push("implausible-value");
    }
    if (gust !== null && gust < sustained) issues.push("gust-below-sustained");
  }

  return {
    id: `${icao}-${t}`,
    stationId: icao,
    time: new Date(t * 1000).toISOString(),
    t,
    sustainedKt: sustained,
    gustKt: gust,
    peakWindKt: metar?.peakWindKt ?? null,
    pressureMb: metar?.pressureMb ?? null,
    metar: r.metar,
    sourceHash: keccak256(toBytes(r.metar)),
    issues,
    verifiable: issues.length === 0,
  };
}

/**
 * Flag observations that disagree sharply with nearby stations at the same hour.
 * Neighbour outliers are flagged for review; they are still a valid measurement, but a reading far ABOVE
 * every neighbour is held back from signing because it is the shape of a faulty or spoofed sensor.
 */
export function flagNeighborOutliers(
  obs: Observation[],
  neighbors: Record<string, string[]>,
  windowSec = 3600,
  thresholdKt = 25,
): Observation[] {
  const byStation = new Map<string, Observation[]>();
  for (const o of obs) {
    if (!byStation.has(o.stationId)) byStation.set(o.stationId, []);
    byStation.get(o.stationId)!.push(o);
  }
  return obs.map((o) => {
    if (o.sustainedKt === null) return o;
    const ns = neighbors[o.stationId] ?? [];
    const vals: number[] = [];
    for (const n of ns) {
      for (const x of byStation.get(n) ?? []) {
        if (x.sustainedKt !== null && Math.abs(x.t - o.t) <= windowSec) vals.push(x.sustainedKt);
      }
    }
    if (vals.length < 2) return o;
    const maxN = Math.max(...vals);
    if (o.sustainedKt - maxN > thresholdKt) {
      return { ...o, issues: [...o.issues, "neighbor-outlier"], verifiable: false };
    }
    return o;
  });
}
