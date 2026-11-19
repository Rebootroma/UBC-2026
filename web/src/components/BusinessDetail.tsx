"use client";

import { BUSINESSES, OBSERVATIONS, STATION_BY_ID } from "@/lib/data";
import { WEIGHTS } from "@/lib/exposure";
import { formatUsd } from "@/lib/config";
import { addrUrl, txUrl } from "@/lib/chain/config";
import { evaluatePolicy } from "@/lib/policy";
import { EVENT } from "@/lib/config";
import { useApp } from "./state";
import { StatusPill, Tag, TxLink, fmtUtc, scoreColor, usdc } from "./ui";
import { AgentCard } from "./AgentCard";

export function BusinessDetail() {
  const { selected, select, exposures, bizStatus, t, chain } = useApp();
  const b = BUSINESSES.find((x) => x.id === selected);
  if (!b) return <div className="p-4 text-sm text-muted">Select a business on the map.</div>;
  const e = exposures.get(b.id)!;
  const st = bizStatus(b);
  const onchain = chain?.policies.find((p) => p.businessId === b.id);
  const maxAtStations = b.policy.stations.map((s) => {
    const obs = OBSERVATIONS.filter((o) => o.stationId === s && o.t <= t && o.verifiable && o.sustainedKt !== null);
    const max = obs.reduce((m, o) => (o.sustainedKt! > (m?.sustainedKt ?? -1) ? o : m), undefined as (typeof obs)[number] | undefined);
    return { s, max };
  });
  const decision = st.observation
    ? evaluatePolicy({ policy: b.policy, status: "Active", settledEvents: new Set(), observation: st.observation, eventId: EVENT.eventKey })
    : null;

  return (
    <div className="p-4 space-y-4 text-sm">
      <div>
        <div className="flex items-center justify-between gap-2">
          <select value={b.id} onChange={(ev) => select(ev.target.value)} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none">
            {BUSINESSES.map((x) => <option key={x.id} value={x.id} className="bg-panel">{x.name}</option>)}
          </select>
          <StatusPill status={st.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{b.industry}</span>·<span>{b.town}, TX</span>·<span>{b.employees} staff</span><Tag kind="synthetic">fictional</Tag>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Exposure" value={<span style={{ color: scoreColor(e.score) }}>{e.score}<span className="text-xs text-dim">/100 {e.band}</span></span>} tag="modeled" />
        <Stat label="Coverage" value={formatUsd(b.policy.coverageUsd)} sub={`${usdc(b.policy.payoutUnits)} testnet USDC`} tag="synthetic" />
        <Stat label="Trigger" value={`≥ ${b.policy.thresholdKt} kt`} sub={`sustained at ${b.policy.stations.join(" / ")}`} />
        <Stat label="On-chain status" value={onchain?.status ?? "—"} sub={onchain?.paidUnits && onchain.paidUnits !== "0" ? `paid ${usdc(onchain.paidUnits)} USDC` : "Arc testnet"} tag="onchain" />
      </div>

      {st.status === "paid" && st.observation && (
        <div className="rounded-lg border border-green/30 bg-green/5 p-3 space-y-1.5">
          <div className="text-xs font-semibold text-green">Why this business was paid</div>
          <p className="text-[13px] leading-snug">{b.name} qualified because {decision?.explanation}</p>
          <div className="text-[11px] text-muted font-mono break-all">METAR: {st.observation.metar}</div>
          {st.txHash && <div className="text-[11px] text-muted flex items-center gap-2">Payout tx <TxLink hash={st.txHash} url={txUrl(st.txHash)} /></div>}
          <div className="text-[11px] text-muted">Recipient (fixed at registration): <a className="font-mono text-cyan" href={addrUrl(b.wallet)} target="_blank" rel="noreferrer">{b.wallet.slice(0, 10)}…</a></div>
        </div>
      )}
      {st.status === "triggered" && <div className="rounded-lg border border-amber/30 bg-amber/5 p-3 text-[13px]">Trigger met by {st.observation?.stationId} at {fmtUtc(st.observation!.t)} — awaiting settlement on Arc.</div>}

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted mb-2">Approved stations (observed so far)</h3>
        {maxAtStations.map(({ s, max }) => (
          <div key={s} className="flex items-center justify-between py-1 border-b border-line text-[13px]">
            <span>{s} <span className="text-dim text-xs">{STATION_BY_ID.get(s)?.name}</span></span>
            <span className={max && max.sustainedKt! >= b.policy.thresholdKt ? "text-amber font-semibold num" : "num"}>
              {max ? `${max.sustainedKt} kt max · ${fmtUtc(max.t)}` : "no report yet"}
            </span>
          </div>
        ))}
        <p className="mt-1 text-[11px] text-dim">Only the reported 2-minute sustained wind at an approved station counts. Modeled wind and storm proximity never trigger a payout.</p>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted mb-2">Exposure factors <Tag kind="modeled" /></h3>
        {(Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((k) => (
          <div key={k} className="flex items-center gap-2 py-0.5 text-xs">
            <span className="w-28 text-muted">{{ windHazard: "Wind hazard", surgeProxy: "Surge proxy", industry: "Industry", proximity: "Proximity" }[k]}</span>
            <div className="flex-1 h-1.5 rounded bg-line"><div className="h-1.5 rounded bg-violet" style={{ width: `${e.factors[k] * 100}%` }} /></div>
            <span className="w-16 text-right num text-dim">{(e.factors[k] * 100).toFixed(0)}% ×{WEIGHTS[k]}</span>
          </div>
        ))}
        <p className="mt-1 text-[11px] text-dim">Modeled peak wind {e.modeledPeakWindKt} kt (Rankine vortex on NHC best track) · closest approach {Number.isFinite(e.closestApproachKm) ? `${Math.round(e.closestApproachKm)} km` : "—"} · uncertainty {e.uncertainty}. Exposure ranks attention; it never decides payouts.</p>
      </div>

      <AgentCard agent="coverage" businessId={b.id} compact />
    </div>
  );
}

function Stat({ label, value, sub, tag }: { label: string; value: React.ReactNode; sub?: string; tag?: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg/40 px-3 py-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-dim">{label}{tag && <Tag kind={tag} />}</div>
      <div className="mt-0.5 font-semibold num">{value}</div>
      {sub && <div className="text-[11px] text-dim truncate">{sub}</div>}
    </div>
  );
}
