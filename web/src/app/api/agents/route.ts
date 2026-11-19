import { NextResponse } from "next/server";
import { z } from "zod";
import { buildFacts, type AgentId, type FinancialSnapshot } from "@/lib/agents/facts";
import { runAgent } from "@/lib/agents/run";
import { readChainState } from "@/lib/chain/state";
import { formatUsdc } from "@/lib/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  agent: z.enum(["intel", "exposure", "coverage", "integrity", "financial"]),
  t: z.number().int().min(1719792000).max(1722470400), // July 2024 only
  businessId: z.string().regex(/^RSL-\d{4}$/).optional(),
});

// Small in-memory cache: same agent, same replay half-hour, same business → same report.
const cache = new Map<string, { at: number; value: unknown }>();

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const { agent, t, businessId } = parsed.data;
  const bucket = Math.floor(t / 1800);
  let fin: FinancialSnapshot | undefined;
  let finKey = "";
  if (agent === "financial") {
    const s = await readChainState();
    const payouts = s.events.filter((e) => e.name === "PayoutExecuted" || e.name === "DeferredPayoutSettled");
    fin = {
      reserveUsdc: formatUsdc(s.reserveBalance),
      freeUsdc: formatUsdc(s.freeReserve),
      paidUsdc: formatUsdc(s.totalPaid),
      owedUsdc: formatUsdc(s.totalOwed),
      exposureUsdc: formatUsdc(s.activeExposure),
      payoutCount: payouts.length,
      deferredCount: s.policies.filter((p) => p.status === "Deferred").length,
      lastPayoutTx: payouts[0]?.txHash,
    };
    finKey = `${s.totalPaid}-${s.totalOwed}-${s.reserveBalance}`;
  }
  const key = `${agent}:${bucket}:${businessId ?? ""}:${finKey}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60_000) return NextResponse.json(hit.value);
  const facts = buildFacts(agent as AgentId, t, businessId, fin);
  const report = await runAgent(agent as AgentId, facts);
  cache.set(key, { at: Date.now(), value: report });
  return NextResponse.json(report);
}
