"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { BUSINESSES, OBSERVATIONS, TRACK } from "@/lib/data";
import { stormAt } from "@/lib/geo";
import { formatUsd } from "@/lib/config";
import { txUrl } from "@/lib/chain/config";
import { REPLAY_END, REPLAY_START, SETTLEMENT_POINTS, useApp } from "../state";
import { Button, Kpi, Panel, StatusPill, Tag, TxLink, fmtUtc, usdc } from "../ui";
import { BusinessDetail } from "../BusinessDetail";

const MapView = dynamic(() => import("../MapView").then((m) => m.MapView), { ssr: false, loading: () => <div className="h-full grid place-items-center text-muted text-sm">Loading map…</div> });

export function CommandCenter() {
  const { t, exposures, bizStatus, chain } = useApp();
  const storm = stormAt(TRACK, t);
  const statuses = BUSINESSES.map((b) => bizStatus(b).status);
  const highExposure = [...exposures.values()].filter((e) => e.score >= 50).length;
  const triggered = statuses.filter((s) => s !== "covered").length;
  const paidOnChain = chain?.events.filter((e) => e.name === "PayoutExecuted").length ?? 0;
  const [tab, setTab] = useState<"feed" | "business">("feed");

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 shrink-0">
        <Kpi label="Storm (best track)" value={storm ? `${Math.round(storm.maxWindKt)} kt` : "—"} sub={storm ? `${storm.status} · ${Math.round(storm.minPressureMb)} mb · ${fmtUtc(t)}` : ""} tone="red" tag={<Tag kind={storm?.isFix ? "best-track" : "interpolated"} />} />
        <Kpi label="High / severe exposure" value={`${highExposure}`} sub="of 80 synthetic businesses" tone="amber" tag={<Tag kind="modeled" />} />
        <Kpi label="Triggers met" value={`${triggered}`} sub={`${SETTLEMENT_POINTS.filter((p) => p.observation.t <= t).length} verified trigger observations`} tone="cyan" tag={<Tag kind="observed" />} />
        <Kpi label="Paid on Arc" value={chain ? `${usdc(chain.totalPaid)}` : "—"} sub={`USDC · ${paidOnChain} payout events · owed ${usdc(chain?.totalOwed ?? "0")}`} tone="green" tag={<Tag kind="onchain" />} />
        <Kpi label="Reserve" value={chain ? usdc(chain.reserveBalance) : "—"} sub={chain ? `USDC · exposure ${usdc(chain.activeExposure)} remaining` : "loading"} tag={<Tag kind="onchain" />} />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-3">
        <div className="min-h-[360px] rounded-xl overflow-hidden border border-line relative">
          <MapView />
        </div>
        <Panel
          className="min-h-0"
          bodyClass="flex-1 min-h-0 overflow-y-auto scroll-thin"
          title={
            <span className="flex gap-1">
              {(["feed", "business"] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={clsx("px-2 py-1 rounded uppercase", tab === k ? "bg-panel-2 text-text" : "text-dim hover:text-muted")}>
                  {k === "feed" ? "Event feed" : "Business"}
                </button>
              ))}
            </span>
          }
        >
          {tab === "feed" ? <EventFeed onOpenBusiness={() => setTab("business")} /> : <BusinessDetail />}
        </Panel>
      </div>

      <ReplayBar />
    </div>
  );
}

function ReplayBar() {
  const { t, setT, playing, setPlaying, speed, setSpeed, reset, autoSettle, setAutoSettle, gates } = useApp();
  const pct = (x: number) => ((x - REPLAY_START) / (REPLAY_END - REPLAY_START)) * 100;
  const landfall = TRACK.find((p) => p.landfall)!;
  const running = Object.values(gates).some((g) => g.status === "running");
  return (
    <div className="shrink-0 rounded-xl border border-line bg-panel/90 px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={() => setPlaying(!playing)} disabled={running} className="w-24">
          {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : t >= REPLAY_END ? "Done" : "Play"}
        </Button>
        <Button onClick={reset} title="Reset replay"><RotateCcw size={14} /></Button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-8 rounded-lg border border-line-2 bg-panel-2 px-2 text-xs">
          {[15, 45, 90, 180].map((s) => <option key={s} value={s}>{s} min/s</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[240px]">
        <div className="relative h-5">
          <div className="absolute inset-x-0 top-2 h-1 rounded bg-line-2" />
          <div className="absolute left-0 top-2 h-1 rounded bg-cyan/70" style={{ width: `${pct(t)}%` }} />
          {SETTLEMENT_POINTS.map((p) => {
            const g = gates[p.observation.id];
            return (
              <span
                key={p.observation.id}
                title={`${p.observation.stationId} ${p.observation.sustainedKt} kt → ${p.policies.length} policies`}
                className={clsx("absolute top-0.5 h-4 w-1 rounded-sm -translate-x-1/2", g?.status === "done" ? "bg-green" : g?.status === "error" ? "bg-red" : "bg-amber")}
                style={{ left: `${pct(p.observation.t)}%` }}
              />
            );
          })}
          <span className="absolute -top-0.5 text-[9px] text-red -translate-x-1/2" style={{ left: `${pct(landfall.t)}%` }}>▼</span>
          <input type="range" className="scrub absolute inset-0 w-full" min={REPLAY_START} max={REPLAY_END} step={60} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} />
        </div>
        <div className="flex justify-between text-[10px] text-dim mt-0.5 num">
          <span>{fmtUtc(REPLAY_START)}</span>
          <span className="text-red">Landfall {fmtUtc(landfall.t)} near Matagorda, TX</span>
          <span>{fmtUtc(REPLAY_END)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-lg leading-none num">{new Date(t * 1000).toISOString().slice(11, 16)}<span className="text-xs text-dim"> UTC</span></div>
          <div className="text-[10px] text-dim">{new Date(t * 1000).toUTCString().slice(0, 16)} · Hurricane Beryl (AL022024)</div>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
          <input type="checkbox" checked={autoSettle} onChange={(e) => setAutoSettle(e.target.checked)} className="accent-cyan" />
          Settle on Arc
        </label>
      </div>
    </div>
  );
}

interface FeedItem {
  t: number;
  kind: "track" | "obs" | "trigger" | "silent";
  text: string;
  obsId?: string;
}

function EventFeed({ onOpenBusiness }: { onOpenBusiness: () => void }) {
  const { t, gates, runGate, select, bizStatus } = useApp();
  const items = useMemo(() => {
    const out: FeedItem[] = [];
    for (const p of TRACK) if (p.t >= REPLAY_START - 6 * 3600) out.push({ t: p.t, kind: "track", text: `Best-track fix: ${p.status} ${p.maxWindKt} kt, ${p.minPressureMb} mb at ${p.lat.toFixed(1)}N ${Math.abs(p.lon).toFixed(1)}W${p.landfall ? " — LANDFALL near Matagorda" : ""}` });
    // first observation at each station reaching tropical-storm force (34 kt)
    const seen = new Set<string>();
    for (const o of OBSERVATIONS) {
      if (o.verifiable && (o.sustainedKt ?? 0) >= 34 && !seen.has(o.stationId)) {
        seen.add(o.stationId);
        out.push({ t: o.t, kind: "obs", text: `${o.stationId} reaches tropical-storm force: ${o.sustainedKt} kt sustained${o.gustKt ? `, gust ${o.gustKt} kt` : ""}` });
      }
    }
    for (const p of SETTLEMENT_POINTS) out.push({ t: p.observation.t, kind: "trigger", obsId: p.observation.id, text: `${p.observation.stationId} ${p.observation.sustainedKt} kt meets the trigger for ${p.policies.length} ${p.policies.length === 1 ? "policy" : "policies"}` });
    const kpsxLast = OBSERVATIONS.filter((o) => o.stationId === "KPSX").at(-1);
    if (kpsxLast) out.push({ t: kpsxLast.t + 5400, kind: "silent", text: `KPSX (Palacios) silent since ${kpsxLast.time.slice(11, 16)} UTC — station outage. Missing data never triggers a payout.` });
    return out.sort((a, b) => b.t - a.t);
  }, []);
  const visible = items.filter((i) => i.t <= t);
  if (visible.length === 0) return <div className="p-4 text-sm text-muted">Press Play to start the Hurricane Beryl replay. Events appear here as they happen.</div>;
  return (
    <ol className="divide-y divide-line">
      {visible.map((i, idx) => {
        const point = i.obsId ? SETTLEMENT_POINTS.find((p) => p.observation.id === i.obsId) : undefined;
        const g = i.obsId ? gates[i.obsId] : undefined;
        return (
          <li key={idx} className="px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-dim">
              <span className="font-mono">{fmtUtc(i.t)}</span>
              <Tag kind={i.kind === "track" ? "best-track" : i.kind === "silent" ? "derived" : "observed"} />
              {i.kind === "trigger" && <Tag kind="onchain">settlement</Tag>}
            </div>
            <p className={clsx("mt-1 text-[13px] leading-snug", i.kind === "trigger" ? "text-amber" : i.kind === "silent" ? "text-red" : "text-text")}>{i.text}</p>
            {point && (
              <div className="mt-2 rounded-lg border border-line bg-bg/50 p-2.5 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {point.policies.map((b) => (
                    <button key={b.id} onClick={() => { select(b.id); onOpenBusiness(); }} className="rounded border border-line-2 px-1.5 py-0.5 text-[11px] hover:border-cyan">
                      {b.name} <span className="text-dim">≥{b.policy.thresholdKt}kt · {formatUsd(b.policy.coverageUsd)}</span>
                    </button>
                  ))}
                </div>
                <GateStatus obsId={point.observation.id} />
                {!g && <Button variant="primary" onClick={() => runGate(point.observation.id)}><Zap size={13} /> Verify &amp; settle on Arc</Button>}
                {g?.result?.payouts.length ? (
                  <div className="text-[11px] text-muted">
                    {g.result.payouts.map((p) => {
                      const b = BUSINESSES.find((x) => x.id === p.businessId);
                      return <div key={p.policyId} className="flex justify-between"><span>{b?.name}</span><span className={p.outcome === "paid" ? "text-green" : "text-red"}>{usdc(p.amountUnits)} USDC {p.outcome}</span></div>;
                    })}
                  </div>
                ) : null}
                {g?.result?.status === "already-settled" && (
                  <div className="text-[11px] text-muted space-y-0.5">
                    {point.policies.map((b) => {
                      const s = bizStatus(b);
                      return <div key={b.id} className="flex justify-between items-center gap-2"><span className="truncate">{b.name}</span>{s.txHash ? <TxLink hash={s.txHash} url={txUrl(s.txHash)} /> : <StatusPill status={s.status} />}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function GateStatus({ obsId }: { obsId: string }) {
  const { gates } = useApp();
  const g = gates[obsId];
  if (!g) return null;
  if (g.status === "running")
    return (
      <div className="flex items-center gap-2 text-xs text-cyan">
        <Loader2 size={13} className="animate-spin" /> Validating observation → oracle signature → submitting to Arc…
      </div>
    );
  if (g.status === "error") return <div className="flex items-start gap-2 text-xs text-red"><CircleAlert size={13} className="mt-0.5 shrink-0" /> {g.error}</div>;
  const r = g.result!;
  return (
    <div className="space-y-1.5">
      <ul className="grid grid-cols-1 gap-0.5">
        {r.checks.map((c) => (
          <li key={c.check} className="flex items-start gap-1.5 text-[11px]">
            {c.passed ? <CheckCircle2 size={12} className="text-green mt-0.5 shrink-0" /> : <CircleAlert size={12} className="text-red mt-0.5 shrink-0" />}
            <span className="text-muted"><span className="text-text">{c.check}</span> — {c.detail}</span>
          </li>
        ))}
      </ul>
      <div className={clsx("text-xs font-medium", r.status === "settled" ? "text-green" : r.status === "already-settled" ? "text-cyan" : "text-amber")}>{r.message}</div>
      {r.txHash && r.explorerUrl && (
        <div className="flex items-center gap-2 text-[11px] text-muted">
          Tx <TxLink hash={r.txHash} url={r.explorerUrl} /> {r.blockNumber && <span>block {Number(r.blockNumber).toLocaleString()}</span>}
        </div>
      )}
    </div>
  );
}
