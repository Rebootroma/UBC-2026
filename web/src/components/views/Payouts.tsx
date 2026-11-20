"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BUSINESSES, OBSERVATIONS, STATION_BY_ID } from "@/lib/data";
import { businessKey, policyKey, stationKey, txUrl } from "@/lib/chain/config";
import { formatUsd } from "@/lib/config";
import { useApp } from "../state";
import { Panel, Tag, TxLink, usdc } from "../ui";

const SERIES = "#1898ba";

export function Payouts() {
  const { chain, deployment } = useApp();
  const cohort = deployment?.cohort;
  const byPolicy = useMemo(() => new Map(cohort ? BUSINESSES.map((b) => [policyKey(cohort, b.policy.policyNumber).toLowerCase(), b]) : []), [cohort]);
  const stationByKey = useMemo(() => new Map([...STATION_BY_ID.keys()].map((id) => [stationKey(id).toLowerCase(), id])), []);
  const events = chain?.events ?? [];
  // Payouts from earlier cohorts are not derivable from the current cohort id, so also resolve
  // each policy through its on-chain PolicyRegistered log (policyId -> businessRef -> business).
  const byRegistration = useMemo(() => {
    const byRef = new Map(BUSINESSES.map((b) => [businessKey(b.id).toLowerCase(), b]));
    const m = new Map<string, (typeof BUSINESSES)[number]>();
    for (const e of chain?.events ?? []) {
      if (e.name !== "PolicyRegistered") continue;
      const biz = byRef.get(e.args.businessRef?.toLowerCase());
      if (biz && e.args.policyId) m.set(e.args.policyId.toLowerCase(), biz);
    }
    return m;
  }, [chain]);
  const accepted = new Map(events.filter((e) => e.name === "ObservationAccepted").map((e) => [e.args.digest?.toLowerCase(), e]));
  const payouts = events.filter((e) => ["PayoutExecuted", "PayoutDeferred", "DeferredPayoutSettled"].includes(e.name));

  // Reserve balance after each event, reconstructed backwards from the live balance (oldest → newest).
  const series = useMemo(() => {
    if (!chain) return [];
    let bal = Number(chain.reserveBalance) / 1e6;
    const pts: { i: number; label: string; reserve: number }[] = [];
    const moving = events.filter((e) => ["PayoutExecuted", "DeferredPayoutSettled", "ReserveFunded", "ReserveWithdrawn"].includes(e.name));
    for (const e of moving) {
      pts.push({ i: 0, label: e.name, reserve: +bal.toFixed(4) });
      const amt = Number(e.args.amount) / 1e6;
      bal += e.name === "ReserveFunded" ? -amt : amt;
    }
    return pts.reverse().map((p, i) => ({ ...p, i: i + 1 }));
  }, [chain, events]);

  return (
    <div className="h-full overflow-y-auto scroll-thin p-3 space-y-3">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-3">
        <Panel title="Payout explorer — every row is a decoded Arc testnet log" right={<Tag kind="onchain" />} bodyClass="overflow-x-auto">
          {payouts.length === 0 ? (
            <div className="p-4 text-sm text-muted">No payouts on chain yet. Run the Hurricane Beryl replay in the Command Center.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-muted">
                <tr className="border-b border-line">{["Business / policy", "Observation", "Rule", "Amount", "Result", "Transaction"].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {payouts.map((e) => {
                  const pid = e.args.policyId?.toLowerCase();
                  const b = byPolicy.get(pid) ?? byRegistration.get(pid);
                  const obsEv = e.args.observationDigest ? accepted.get(e.args.observationDigest.toLowerCase()) : undefined;
                  const station = obsEv ? stationByKey.get(obsEv.args.stationId?.toLowerCase()) : undefined;
                  const sus = obsEv ? Number(obsEv.args.sustainedDeciKnots) / 10 : undefined;
                  const at = obsEv ? Number(obsEv.args.observedAt) : undefined;
                  const raw = station && at ? OBSERVATIONS.find((o) => o.stationId === station && o.t === at) : undefined;
                  return (
                    <tr key={`${e.txHash}-${e.logIndex}`} className="border-b border-line align-top">
                      <td className="px-3 py-2"><div className="font-medium">{b?.name ?? "Unknown policy"}</div><div className="text-[11px] text-dim">{b ? `${b.policy.policyNumber} · ${b.town}` : `${pid?.slice(0, 10)}…`}</div></td>
                      <td className="px-3 py-2 text-xs">{station ? <>{station} · <b>{sus} kt</b><div className="text-dim">{at ? new Date(at * 1000).toISOString().slice(5, 16).replace("T", " ") : ""} UTC</div></> : "—"}{raw && <div className="font-mono text-[10px] text-dim max-w-[220px] truncate" title={raw.metar}>{raw.metar}</div>}</td>
                      <td className="px-3 py-2 text-xs">{b ? <>≥{b.policy.thresholdKt} kt at {b.policy.stations.join("/")}</> : "—"}{b && sus !== undefined && <div className={sus >= b.policy.thresholdKt ? "text-green" : "text-red"}>{sus} ≥ {b.policy.thresholdKt} ✓</div>}</td>
                      <td className="px-3 py-2 num">{usdc(e.args.amount)} USDC{b && <div className="text-[11px] text-dim">{formatUsd(b.policy.coverageUsd)} modeled</div>}</td>
                      <td className="px-3 py-2">{e.name === "PayoutDeferred" ? <span className="text-red text-xs">Deferred — shortfall {usdc(e.args.shortfall)}</span> : <span className="text-green text-xs">Paid to holder</span>}</td>
                      <td className="px-3 py-2"><TxLink hash={e.txHash} url={txUrl(e.txHash)} /><div className="text-[10px] text-dim">block {Number(e.blockNumber).toLocaleString()}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="space-y-3">
          <Panel title="Reserve balance after each money movement (USDC)" right={<Tag kind="onchain" />}>
            {series.length < 2 ? (
              <div className="text-sm text-muted">Appears after funding and the first payout.</div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid stroke="#1c2840" vertical={false} />
                    <XAxis dataKey="i" tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#101a2e", border: "1px solid #26365a", borderRadius: 8, fontSize: 12 }} labelFormatter={(i) => `Event #${i}`} formatter={(v: number, _n, p) => [`${v} USDC`, (p.payload as { label: string }).label]} />
                    <Area type="stepAfter" dataKey="reserve" stroke={SERIES} strokeWidth={2} fill={SERIES} fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
          <Panel title="Accounting (live contract reads)" right={<Tag kind="onchain" />}>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm num">
              <dt className="text-muted">Reserve balance</dt><dd className="text-right">{usdc(chain?.reserveBalance)} USDC</dd>
              <dt className="text-muted">Free reserve</dt><dd className="text-right">{usdc(chain?.freeReserve)} USDC</dd>
              <dt className="text-muted">Total paid</dt><dd className="text-right text-green">{usdc(chain?.totalPaid)} USDC</dd>
              <dt className="text-muted">Owed (deferred)</dt><dd className="text-right text-red">{usdc(chain?.totalOwed)} USDC</dd>
              <dt className="text-muted">Remaining exposure</dt><dd className="text-right">{usdc(chain?.activeExposure)} USDC</dd>
              <dt className="text-muted">Reserve / exposure</dt><dd className="text-right">{chain && Number(chain.activeExposure) > 0 ? `${((Number(chain.reserveBalance) / Number(chain.activeExposure)) * 100).toFixed(1)}%` : "—"}</dd>
            </dl>
            <p className="mt-2 text-[11px] text-dim">Read directly from ParametricReserve via multicall at block {chain ? Number(chain.blockNumber).toLocaleString() : "—"}. Demo scale: 1 testnet USDC represents $10,000 of modeled coverage.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
