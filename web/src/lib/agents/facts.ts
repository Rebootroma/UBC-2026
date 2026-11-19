import { computeExposure } from "../exposure";
import { stormAt } from "../geo";
import { BUSINESSES, OBSERVATIONS, STATIONS, TRACK, settlementPoints } from "../data";
import { formatUsd } from "../config";

/**
 * Deterministic fact sheets for each agent, computed server-side from verified fixtures and chain state.
 * Agents see ONLY these facts. Every fact has an id the agent must cite; unknown ids are discarded.
 */
export type AgentId = "intel" | "exposure" | "coverage" | "integrity" | "financial";

export interface Fact {
  id: string;
  text: string;
  provenance: "observed" | "best-track" | "interpolated" | "modeled" | "synthetic" | "onchain" | "derived";
}

export interface FinancialSnapshot {
  reserveUsdc: string;
  freeUsdc: string;
  paidUsdc: string;
  owedUsdc: string;
  exposureUsdc: string;
  payoutCount: number;
  deferredCount: number;
  lastPayoutTx?: string;
}

export function buildFacts(agent: AgentId, t: number, businessId?: string, fin?: FinancialSnapshot): Fact[] {
  const facts: Fact[] = [];
  const seen = OBSERVATIONS.filter((o) => o.t <= t);
  const storm = stormAt(TRACK, t);
  const iso = new Date(t * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";

  if (agent === "intel" || agent === "integrity") {
    if (storm) {
      facts.push({
        id: "storm-now",
        provenance: storm.isFix ? "best-track" : "interpolated",
        text: `At ${iso} Beryl (${storm.status}) is near ${storm.lat.toFixed(1)}N ${Math.abs(storm.lon).toFixed(1)}W, max sustained ${Math.round(storm.maxWindKt)} kt, min pressure ${Math.round(storm.minPressureMb)} mb (NHC best track${storm.isFix ? "" : ", interpolated between 6-hourly fixes"}).`,
      });
    }
    const lf = TRACK.find((p) => p.landfall);
    if (lf && lf.t <= t) facts.push({ id: "landfall", provenance: "best-track", text: `Landfall near Matagorda, TX at ${lf.time.slice(11, 16)} UTC 8 Jul 2024 with ${lf.maxWindKt} kt and ${lf.minPressureMb} mb.` });
  }

  if (agent === "intel") {
    const recent = seen.filter((o) => o.t > t - 3 * 3600 && o.sustainedKt !== null && o.verifiable);
    const byStation = new Map<string, (typeof recent)[number]>();
    for (const o of recent) if (!byStation.has(o.stationId) || o.sustainedKt! > byStation.get(o.stationId)!.sustainedKt!) byStation.set(o.stationId, o);
    [...byStation.values()]
      .sort((a, b) => b.sustainedKt! - a.sustainedKt!)
      .slice(0, 6)
      .forEach((o) => facts.push({ id: `obs-${o.id}`, provenance: "observed", text: `${o.stationId} max in last 3h: ${o.sustainedKt} kt sustained${o.gustKt ? `, gust ${o.gustKt} kt` : ""} at ${o.time.slice(11, 16)} UTC.` }));
    if (byStation.size === 0) facts.push({ id: "no-recent", provenance: "derived", text: "No verified station reports in the last 3 hours of replay time." });
  }

  if (agent === "exposure" || agent === "coverage") {
    const scored = BUSINESSES.map((b) => ({ b, e: computeExposure(b, TRACK, t) })).sort((x, y) => y.e.score - x.e.score);
    const bands = { Severe: 0, High: 0, Elevated: 0, Low: 0 } as Record<string, number>;
    scored.forEach((s) => bands[s.e.band]++);
    if (agent === "exposure") {
      facts.push({ id: "bands", provenance: "modeled", text: `Modeled exposure bands across 80 synthetic businesses: Severe ${bands.Severe}, High ${bands.High}, Elevated ${bands.Elevated}, Low ${bands.Low}.` });
      scored.slice(0, 6).forEach(({ b, e }) =>
        facts.push({
          id: `exp-${b.id}`,
          provenance: "modeled",
          text: `${b.name} (${b.industry}, ${b.town}): exposure ${e.score}/100 (${e.band}); modeled peak wind ${e.modeledPeakWindKt} kt; closest storm approach ${Number.isFinite(e.closestApproachKm) ? Math.round(e.closestApproachKm) + " km" : "n/a"}; elevation ~${b.elevationM} m; ~${b.coastDistanceKm} km from coast; uncertainty ${e.uncertainty}.`,
        }),
      );
    }
  }

  if (agent === "coverage") {
    const pts = settlementPoints().filter((p) => p.observation.t <= t);
    const triggered = new Set(pts.flatMap((p) => p.policies.map((b) => b.id)));
    facts.push({ id: "triggered", provenance: "derived", text: `${triggered.size} of 80 policies have a verified observation at an approved station meeting their threshold so far (deterministic evaluation).` });
    const maxByStation = new Map<string, number>();
    for (const o of seen) if (o.verifiable && o.sustainedKt !== null) maxByStation.set(o.stationId, Math.max(maxByStation.get(o.stationId) ?? 0, o.sustainedKt));
    const near = BUSINESSES.filter((b) => !triggered.has(b.id))
      .map((b) => ({ b, best: Math.max(0, ...b.policy.stations.map((s) => maxByStation.get(s) ?? 0)) }))
      .filter((x) => x.best >= x.b.policy.thresholdKt - 5)
      .sort((a, b) => b.best - b.b.policy.thresholdKt - (a.best - a.b.policy.thresholdKt))
      .slice(0, 5);
    near.forEach(({ b, best }) =>
      facts.push({ id: `near-${b.id}`, provenance: "derived", text: `${b.name} (${b.policy.policyNumber}) is NOT triggered: best verified reading at its approved stations (${b.policy.stations.join(", ")}) is ${best} kt vs a ${b.policy.thresholdKt} kt threshold. Basis risk: the business may have experienced damaging wind that its approved station did not measure.` }),
    );
    const target = businessId ? BUSINESSES.find((b) => b.id === businessId) : BUSINESSES[0];
    if (target) {
      const pt = pts.find((p) => p.policies.some((b) => b.id === target.id));
      facts.push({
        id: `policy-${target.id}`,
        provenance: "synthetic",
        text: `${target.name} policy ${target.policy.policyNumber}: pays ${formatUsd(target.policy.coverageUsd)} modeled coverage (${(Number(target.policy.payoutUnits) / 1e6).toFixed(2)} testnet USDC) if 2-minute sustained wind ≥ ${target.policy.thresholdKt} kt is reported at ${target.policy.stations.join(" or ")} between ${target.policy.coverageStart.slice(0, 10)} and ${target.policy.coverageEnd.slice(0, 10)}. Pays at most once per storm.`,
      });
      facts.push(
        pt
          ? { id: `trigger-${target.id}`, provenance: "observed", text: `Trigger met: ${pt.observation.stationId} reported ${pt.observation.sustainedKt} kt sustained at ${pt.observation.time.slice(11, 16)} UTC (METAR: "${pt.observation.metar.slice(0, 60)}…").` }
          : { id: `trigger-${target.id}`, provenance: "derived", text: `Trigger not met as of ${iso}.` },
      );
    }
  }

  if (agent === "integrity") {
    const bad = seen.filter((o) => !o.verifiable);
    const counts: Record<string, number> = {};
    bad.forEach((o) => o.issues.forEach((i) => (counts[i] = (counts[i] ?? 0) + 1)));
    facts.push({ id: "quality", provenance: "derived", text: `${seen.length} station reports ingested so far; ${bad.length} withheld from the oracle (${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}).` });
    // silent stations: last report > 90 min before t while the storm is active
    for (const s of STATIONS) {
      const last = seen.filter((o) => o.stationId === s.id).at(-1);
      if (last && t - last.t > 90 * 60 && t < Date.parse("2024-07-09T00:00:00Z") / 1000) {
        facts.push({ id: `silent-${s.id}`, provenance: "observed", text: `${s.id} (${s.name}) has not reported since ${last.time.slice(11, 16)} UTC — a gap of ${Math.round((t - last.t) / 60)} minutes. Missing data is never treated as a trigger.` });
      }
    }
    const mismatch = bad.find((o) => o.issues.includes("metar-mismatch"));
    if (mismatch) facts.push({ id: `mismatch-${mismatch.id}`, provenance: "observed", text: `Example withheld record ${mismatch.id}: CSV column and raw METAR wind group disagree, so the oracle refuses to sign it.` });
    facts.push({ id: "controls", provenance: "onchain", text: "Contract controls: only ORACLE_ROLE signatures accepted; each signed observation accepted once; each policy settles at most once per storm; payouts go only to the holder fixed at registration." });
  }

  if (agent === "financial" && fin) {
    facts.push({ id: "reserve", provenance: "onchain", text: `Reserve balance ${fin.reserveUsdc} USDC (free ${fin.freeUsdc}); total paid ${fin.paidUsdc} USDC across ${fin.payoutCount} payouts; deferred/owed ${fin.owedUsdc} USDC across ${fin.deferredCount} policies; remaining active exposure ${fin.exposureUsdc} USDC.` });
    const cover = Number(fin.reserveUsdc) / Math.max(1e-9, Number(fin.exposureUsdc));
    facts.push({ id: "coverage-ratio", provenance: "derived", text: `Reserve covers ${(cover * 100).toFixed(1)}% of remaining active exposure. If more triggers occur than the free reserve can pay, payouts are recorded as owed on chain, not hidden.` });
    if (fin.lastPayoutTx) facts.push({ id: "last-tx", provenance: "onchain", text: `Most recent payout transaction: ${fin.lastPayoutTx}.` });
  }
  return facts;
}
