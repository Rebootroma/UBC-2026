"use client";

import { useMemo, useState } from "react";
import { BUSINESSES } from "@/lib/data";
import { formatUsd } from "@/lib/config";
import { txUrl } from "@/lib/chain/config";
import { useApp } from "../state";
import { Panel, StatusPill, Tag, TxLink, scoreColor, usdc } from "../ui";

type SortKey = "exposure" | "coverage" | "name" | "status";

export function Portfolio() {
  const { exposures, bizStatus, select, setView } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("exposure");
  const rows = useMemo(() => {
    const r = BUSINESSES.filter((b) => `${b.name} ${b.town} ${b.industry} ${b.id}`.toLowerCase().includes(q.toLowerCase())).map((b) => ({ b, e: exposures.get(b.id)!, s: bizStatus(b) }));
    const order = { paid: 0, deferred: 1, failed: 2, settling: 3, triggered: 4, covered: 5 };
    r.sort((x, y) =>
      sort === "exposure" ? y.e.score - x.e.score : sort === "coverage" ? y.b.policy.coverageUsd - x.b.policy.coverageUsd : sort === "status" ? order[x.s.status] - order[y.s.status] : x.b.name.localeCompare(y.b.name),
    );
    return r;
  }, [q, sort, exposures, bizStatus]);
  const total = BUSINESSES.reduce((a, b) => a + b.policy.coverageUsd, 0);

  return (
    <div className="h-full p-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">Business portfolio</h1>
        <Tag kind="synthetic">80 fictional businesses</Tag>
        <span className="text-xs text-muted">Total modeled coverage {formatUsd(total)} · on-chain limits {usdc(BUSINESSES.reduce((a, b) => a + Number(b.policy.payoutUnits), 0))} testnet USDC</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, town, industry…" className="ml-auto h-8 w-64 rounded-lg border border-line-2 bg-panel-2 px-3 text-sm outline-none focus:border-cyan" />
      </div>
      <Panel className="flex-1" bodyClass="flex-1 overflow-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-panel text-[11px] uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              {[["name", "Business"], ["", "Town"], ["exposure", "Exposure"], ["coverage", "Coverage"], ["", "Trigger"], ["status", "Status"], ["", "Payout"]].map(([k, l]) => (
                <th key={l} className="px-3 py-2 text-left font-medium">
                  {k ? <button className={sort === k ? "text-cyan" : ""} onClick={() => setSort(k as SortKey)}>{l}</button> : l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ b, e, s }) => (
              <tr key={b.id} className="border-b border-line hover:bg-panel-2 cursor-pointer" onClick={() => { select(b.id); setView("command"); }}>
                <td className="px-3 py-2"><div className="font-medium">{b.name}</div><div className="text-[11px] text-dim">{b.id} · {b.industry}</div></td>
                <td className="px-3 py-2 text-muted">{b.town}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded bg-line"><div className="h-1.5 rounded" style={{ width: `${e.score}%`, background: scoreColor(e.score) }} /></div><span className="num text-xs">{e.score}</span></div></td>
                <td className="px-3 py-2 num">{formatUsd(b.policy.coverageUsd)}<div className="text-[11px] text-dim">{usdc(b.policy.payoutUnits)} USDC</div></td>
                <td className="px-3 py-2 text-xs">≥{b.policy.thresholdKt} kt<div className="text-dim">{b.policy.stations.join(", ")}</div></td>
                <td className="px-3 py-2"><StatusPill status={s.status} /></td>
                <td className="px-3 py-2">{s.txHash ? <TxLink hash={s.txHash} url={txUrl(s.txHash)} /> : <span className="text-dim text-xs">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
