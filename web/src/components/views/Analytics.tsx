"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BUSINESSES, OBSERVATIONS, TRACK } from "@/lib/data";
import { computeExposure } from "@/lib/exposure";
import { formatUsd } from "@/lib/config";
import { REPLAY_END, useApp } from "../state";
import { Panel, Tag, usdc } from "../ui";

const SERIES = "#1898ba";
const SCENARIOS = [
  { id: "moderate", label: "Moderate storm", factor: 0.8 },
  { id: "beryl", label: "Beryl as observed", factor: 1.0 },
  { id: "severe", label: "Severe hurricane", factor: 1.25 },
  { id: "extreme", label: "Extreme event", factor: 1.5 },
];

/** Re-run the deterministic trigger rule with every observed sustained wind scaled by a factor. MODELED, not a prediction. */
function runScenario(factor: number) {
  const maxBy = new Map<string, number>();
  for (const o of OBSERVATIONS) if (o.verifiable && o.sustainedKt !== null) maxBy.set(o.stationId, Math.max(maxBy.get(o.stationId) ?? 0, o.sustainedKt * factor));
  const hit = BUSINESSES.filter((b) => b.policy.stations.some((s) => (maxBy.get(s) ?? 0) >= b.policy.thresholdKt));
  return { count: hit.length, usd: hit.reduce((a, b) => a + b.policy.coverageUsd, 0), units: hit.reduce((a, b) => a + Number(b.policy.payoutUnits), 0), hit };
}

export function Analytics() {
  const { chain } = useApp();
  const reserveUsd = chain ? (Number(chain.reserveBalance) + Number(chain.totalPaid)) / 1e6 * 10_000 : 0; // reserve at start of event, in modeled USD
  const results = useMemo(() => SCENARIOS.map((s) => ({ ...s, ...runScenario(s.factor) })), []);
  const [dim, setDim] = useState<"town" | "industry">("town");
  const conc = useMemo(() => {
    const m = new Map<string, { key: string; usd: number; n: number }>();
    for (const b of BUSINESSES) {
      const k = dim === "town" ? b.town : b.industry;
      const cur = m.get(k) ?? { key: k, usd: 0, n: 0 };
      cur.usd += b.policy.coverageUsd;
      cur.n++;
      m.set(k, cur);
    }
    return [...m.values()].sort((a, b) => b.usd - a.usd);
  }, [dim]);
  const total = BUSINESSES.reduce((a, b) => a + b.policy.coverageUsd, 0);
  const tooltipStyle = { background: "#101a2e", border: "1px solid #26365a", borderRadius: 8, fontSize: 12 };

  return (
    <div className="h-full overflow-y-auto scroll-thin p-3 space-y-3">
      <div className="flex items-center gap-2"><h1 className="text-lg font-semibold">Risk analytics &amp; financial digital twin</h1><Tag kind="modeled">modeled scenarios — not predictions</Tag></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel title="Payout obligations by scenario vs funded reserve (modeled USD)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={results} margin={{ top: 20, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="#1c2840" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8494b4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#ffffff08" }} contentStyle={tooltipStyle} formatter={(v: number, _n, p) => [`${formatUsd(v)} · ${(p.payload as { count: number }).count} policies`, "Obligations"]} />
                {reserveUsd > 0 && <ReferenceLine y={reserveUsd} stroke="#e6ecf7" strokeDasharray="4 4" label={{ value: `Funded reserve ${formatUsd(reserveUsd)}`, fill: "#e6ecf7", fontSize: 11, position: "insideBottomLeft" }} />}
                <Bar dataKey="usd" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={56}>
                  <LabelList dataKey="count" position="top" formatter={(v: number) => `${v} paid`} fill="#8494b4" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="mt-3 w-full text-[13px] num">
            <thead className="text-[11px] uppercase text-muted"><tr><th className="text-left py-1">Scenario</th><th className="text-right">Wind ×</th><th className="text-right">Policies</th><th className="text-right">Obligation</th><th className="text-right">On-chain USDC</th><th className="text-right">Reserve gap</th></tr></thead>
            <tbody>
              {results.map((r) => {
                const gap = reserveUsd - r.usd;
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="py-1.5">{r.label}</td><td className="text-right">{r.factor.toFixed(2)}</td><td className="text-right">{r.count}</td><td className="text-right">{formatUsd(r.usd)}</td><td className="text-right">{usdc(r.units)}</td>
                    <td className={`text-right ${gap < 0 ? "text-red" : "text-green"}`}>{reserveUsd ? (gap < 0 ? `shortfall ${formatUsd(-gap)}` : `surplus ${formatUsd(gap)}`) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-dim">Method: every verified Beryl station reading is multiplied by the scenario factor and the same deterministic trigger rule is applied. A shortfall means some claims would be recorded on chain as owed (PayoutDeferred) until the reserve is topped up — the contract never hides insolvency.</p>
        </Panel>

        <Panel title="Coverage concentration" right={<div className="flex gap-1 text-[11px]">{(["town", "industry"] as const).map((d) => <button key={d} onClick={() => setDim(d)} className={`px-2 py-0.5 rounded ${dim === d ? "bg-panel-2 text-text" : "text-dim"}`}>{d}</button>)}</div>}>
          <div className="h-[420px]">
            <ResponsiveContainer>
              <BarChart data={conc} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="#1c2840" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="key" width={130} interval={0} tick={{ fill: "#8494b4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#ffffff08" }} contentStyle={tooltipStyle} formatter={(v: number, _n, p) => [`${formatUsd(v)} · ${(p.payload as { n: number }).n} businesses · ${((v / total) * 100).toFixed(1)}%`, "Coverage"]} />
                <Bar dataKey="usd" fill={SERIES} radius={[0, 4, 4, 0]} maxBarSize={14}>
                  <LabelList dataKey="usd" position="right" formatter={(v: number) => `${((v / total) * 100).toFixed(0)}%`} fill="#8494b4" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-dim">Share of {formatUsd(total)} total modeled coverage. Concentration matters because one storm hits neighbouring policies together — the reserve must be sized for correlated losses, not averages.</p>
        </Panel>
      </div>

      <Panel title="Basis risk — where the rule and reality can disagree">
        <BasisRisk />
      </Panel>
    </div>
  );
}

function BasisRisk() {
  const res = runScenario(1);
  const paid = new Set(res.hit.map((b) => b.id));
  // Exposure over the whole storm (end of replay), not the current replay time.
  const highNotPaid = BUSINESSES.filter((b) => !paid.has(b.id)).map((b) => ({ b, e: computeExposure(b, TRACK, REPLAY_END) })).sort((a, b) => b.e.score - a.e.score).slice(0, 6);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
      <div className="space-y-2 text-muted">
        <p><span className="text-text font-medium">Parametric cover pays on a measured index, not on assessed loss.</span> A business can suffer damage while its approved station reads below threshold (no payout), or get paid with little damage. That gap is basis risk, and we show it rather than hide it.</p>
        <p>With Beryl as observed, {res.count} of 80 policies pay. The highest-exposure businesses that do <b className="text-text">not</b> pay are listed here. They are the ones to reach first for a traditional claims assessment.</p>
      </div>
      <ul className="divide-y divide-line">
        {highNotPaid.map(({ b, e }) => (
          <li key={b.id} className="py-1.5 flex justify-between gap-2"><span>{b.name} <span className="text-dim text-xs">{b.town} · ≥{b.policy.thresholdKt} kt at {b.policy.stations.join("/")}</span></span><span className="num text-xs text-amber">exposure {e.score}</span></li>
        ))}
      </ul>
    </div>
  );
}
