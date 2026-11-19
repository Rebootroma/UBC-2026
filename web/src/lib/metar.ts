/**
 * Minimal, strict METAR wind parser. Used as an independent second parse of every observation:
 * the value in the IEM CSV column must agree with the wind group inside the raw METAR text,
 * or the observation is not signed by the oracle.
 */
export interface MetarWind {
  station: string;
  directionDeg: number | null; // null for VRB
  sustainedKt: number;
  gustKt: number | null;
  peakWindKt: number | null; // from "PK WND dddff(f)/(hh)mm" remark
  pressureMb: number | null; // from SLP remark
}

const WIND_RE = /\s(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT\b/;
const PK_RE = /PK WND (\d{3})(\d{2,3})\/\d{2,4}/;
const SLP_RE = /\bSLP(\d{3})\b/;

export function parseMetarWind(metar: string): MetarWind | null {
  if (typeof metar !== "string" || metar.length < 10) return null;
  const station = metar.trim().split(/\s+/)[0];
  if (!/^[A-Z0-9]{4}$/.test(station)) return null;
  const m = WIND_RE.exec(metar);
  if (!m) return null;
  const pk = PK_RE.exec(metar);
  const slp = SLP_RE.exec(metar);
  let pressureMb: number | null = null;
  if (slp) {
    const v = Number(slp[1]) / 10;
    pressureMb = v < 50 ? 1000 + v : 900 + v;
  }
  return {
    station,
    directionDeg: m[1] === "VRB" ? null : Number(m[1]),
    sustainedKt: Number(m[2]),
    gustKt: m[3] ? Number(m[3]) : null,
    peakWindKt: pk ? Number(pk[2]) : null,
    pressureMb,
  };
}
