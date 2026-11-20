import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, CircleHelp, ExternalLink, ShieldCheck } from "lucide-react";
import type { Hex } from "viem";
import { addrUrl, txUrl } from "@/lib/chain/config";
import { formatUsd } from "@/lib/config";
import { verifyTransaction, type VerifyCheck } from "@/lib/verify";
import { Recompute } from "./Recompute";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify a payout — ResilienceOS" };

function Check({ c }: { c: VerifyCheck }) {
  const Icon = c.passed === null ? CircleHelp : c.passed ? CheckCircle2 : CircleAlert;
  const tone = c.passed === null ? "text-amber" : c.passed ? "text-green" : "text-red";
  return (
    <li className="flex items-start gap-2.5 py-2">
      <Icon size={16} className={`${tone} mt-0.5 shrink-0`} />
      <div className="min-w-0">
        <div className="text-sm text-text">{c.label}</div>
        <div className="text-xs text-muted break-words">{c.detail}</div>
      </div>
    </li>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel/90">
      <header className="px-4 h-10 flex items-center border-b border-line">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ tx: string }> }) {
  const { tx } = await params;
  const valid = /^0x[0-9a-fA-F]{64}$/.test(tx);
  const v = valid ? await verifyTransaction(tx as Hex) : null;
  const all = v ? [...v.shared, ...v.payouts.flatMap((p) => p.checks)] : [];
  const failed = all.filter((c) => c.passed === false).length;
  const unknown = all.filter((c) => c.passed === null).length;
  const o = v?.observation;
  return (
    <main className="h-dvh overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> ResilienceOS</Link>
          <span className="rounded-full border border-amber/30 bg-amber/5 px-2.5 py-1 text-xs text-amber">Prototype · testnet funds · fictional businesses</span>
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><ShieldCheck className="text-cyan" size={24} /> Payout verification</h1>
          <p className="mt-1 text-sm text-muted">Why this payment happened, re-derived from the Arc testnet chain and the public NOAA weather archive. Nothing on this page comes from our database.</p>
        </div>

        {!valid || !v?.found ? (
          <Card title="Not found">
            <p className="text-sm text-red">{!valid ? "That is not a transaction hash." : v?.error}</p>
          </Card>
        ) : (
          <>
            <div className={`rounded-xl border p-4 ${failed ? "border-red/40 bg-red/5" : "border-green/40 bg-green/5"}`}>
              <div className={`flex items-center gap-2 text-lg font-semibold ${failed ? "text-red" : "text-green"}`}>
                {failed ? <CircleAlert size={20} /> : <CheckCircle2 size={20} />}
                {failed ? `${failed} of ${all.length} checks failed` : `${all.length - unknown} of ${all.length} checks passed`}
                {!failed && unknown ? <span className="text-sm font-normal text-amber">· {unknown} could not be checked</span> : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <a href={txUrl(v.txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-cyan hover:underline">{v.txHash.slice(0, 14)}…{v.txHash.slice(-8)} <ExternalLink size={11} /></a>
                <span>Block {Number(v.blockNumber).toLocaleString()}</span>
                {v.blockTime ? <span>{new Date(v.blockTime * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC</span> : null}
                {v.reserve ? <a href={addrUrl(v.reserve)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">Reserve contract <ExternalLink size={11} /></a> : null}
              </div>
            </div>

            {v.payouts.map((p, i) => (
              <Card key={i} title={p.deferred ? "Claim recorded as owed" : "Payment"}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{p.business?.name ?? "Unknown policyholder"}</div>
                    <div className="text-xs text-muted">{p.business ? `${p.business.industry} · ${p.business.town}, TX · policy ${p.business.policyNumber}` : p.holder}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-semibold num ${p.deferred ? "text-red" : "text-green"}`}>{(Number(p.amountUnits) / 1e6).toFixed(2)} USDC</div>
                    {p.business ? <div className="text-xs text-dim">represents {formatUsd(p.business.coverageUsd)} at demo scale</div> : null}
                  </div>
                </div>
                {p.business ? <p className="mt-3 rounded-lg border border-line bg-bg/50 p-3 text-sm text-muted">Rule: pay if a sustained wind of at least <b className="text-text">{p.business.thresholdKt} kt</b> is reported at <b className="text-text">{p.business.stations.join(" or ")}</b> during the coverage window. At most once per storm.</p> : null}
                <ul className="mt-2 divide-y divide-line">{p.checks.map((c) => <Check key={c.label} c={c} />)}</ul>
              </Card>
            ))}

            <Card title="Weather evidence">
              {o ? (
                <div className="mb-2 space-y-2">
                  <div className="text-sm">
                    <b>{o.stationName}</b> ({o.stationId}) reported <b className="text-cyan">{o.sustainedKt} kt sustained</b>{o.gustKt ? `, gusting ${o.gustKt} kt` : ""} at {new Date(o.t * 1000).toISOString().replace("T", " ").slice(0, 16)} UTC.
                  </div>
                  <pre className="overflow-x-auto rounded-lg border border-line bg-bg/60 p-3 font-mono text-xs text-text">{o.metar}</pre>
                  <a href={o.archiveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan hover:underline">Download this station&apos;s reports from the Iowa Environmental Mesonet archive <ExternalLink size={11} /></a>
                </div>
              ) : null}
              <ul className="divide-y divide-line">{v.shared.map((c) => <Check key={c.label} c={c} />)}</ul>
            </Card>

            {o && v.reserve ? (
              <Card title="Check it yourself">
                <Recompute observation={{ stationId: o.stationId, t: o.t, sustainedKt: o.sustainedKt, gustKt: o.gustKt, metar: o.metar }} reserve={v.reserve} onchainDigest={o.digest} />
              </Card>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
