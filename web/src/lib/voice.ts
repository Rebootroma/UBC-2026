import { settlementPoints, STATION_BY_ID } from "./data";
import { formatUsd } from "./config";

/**
 * Spoken incident briefings for the response desk. The script for each settlement gate is built
 * only from verified data (station, wind, triggered policies, fixed payout amounts), never from an LLM,
 * so what is spoken can be checked against the same facts the contract used.
 */
export type VoiceVariant = "paid" | "deferred";

const say = (n: number) => String(Math.round(n));

export function briefingScript(observationId: string, variant: VoiceVariant): string | null {
  const point = settlementPoints().find((p) => p.observation.id === observationId);
  if (!point) return null;
  const o = point.observation;
  const station = (STATION_BY_ID.get(o.stationId)?.name ?? o.stationId).replace(/\//g, " ");
  const names = point.policies.map((b) => b.name);
  const total = point.policies.reduce((a, b) => a + b.policy.coverageUsd, 0);
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and ${names.length - 2} more`;
  const wind = `${say(o.sustainedKt ?? 0)} knots sustained${o.gustKt ? `, gusting ${say(o.gustKt)}` : ""}`;
  const count = `${names.length} ${names.length === 1 ? "policy" : "policies"} triggered`;
  const outcome =
    variant === "paid"
      ? `${who} ${names.length === 1 ? "has" : "have"} been paid in U S D C on Arc, representing ${formatUsd(total)} of cover.`
      : `The reserve is short, so claims for ${who} are recorded on chain as owed and will be paid when the reserve is topped up.`;
  return `Verified report from ${station}: ${wind}. ${count}. ${outcome}`;
}
