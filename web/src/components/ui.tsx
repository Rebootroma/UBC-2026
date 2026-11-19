"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { BizStatus } from "./state";

export function Panel({ title, right, children, className, bodyClass }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={clsx("rounded-xl border border-line bg-panel/90 backdrop-blur flex flex-col min-h-0", className)}>
      {title !== undefined && (
        <header className="flex items-center justify-between gap-2 px-4 h-10 border-b border-line shrink-0">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
          {right}
        </header>
      )}
      <div className={clsx("min-h-0", bodyClass ?? "p-4")}>{children}</div>
    </section>
  );
}

export function Kpi({ label, value, sub, tone = "text", tag }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "text" | "cyan" | "amber" | "red" | "green"; tag?: ReactNode }) {
  const color = { text: "text-text", cyan: "text-cyan", amber: "text-amber", red: "text-red", green: "text-green" }[tone];
  return (
    <div className="rounded-xl border border-line bg-panel/90 px-4 py-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.1em] text-muted truncate">{label}</span>
        {tag}
      </div>
      <div className={clsx("mt-1 text-2xl font-semibold num leading-tight", color)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-dim truncate">{sub}</div>}
    </div>
  );
}

const PROV: Record<string, string> = {
  observed: "text-cyan border-cyan/30 bg-cyan/5",
  "best-track": "text-blue border-blue/30 bg-blue/5",
  interpolated: "text-muted border-line-2",
  modeled: "text-violet border-violet/30 bg-violet/5",
  synthetic: "text-amber border-amber/30 bg-amber/5",
  onchain: "text-green border-green/30 bg-green/5",
  derived: "text-muted border-line-2",
  llm: "text-violet border-violet/30 bg-violet/5",
};
export function Tag({ kind, children }: { kind: keyof typeof PROV | string; children?: ReactNode }) {
  return <span className={clsx("inline-flex items-center rounded border px-1.5 py-px text-[10px] font-medium uppercase tracking-wide whitespace-nowrap", PROV[kind] ?? PROV.derived)}>{children ?? kind}</span>;
}

export const STATUS_STYLE: Record<BizStatus, { label: string; cls: string; dot: string }> = {
  covered: { label: "Covered", cls: "text-muted border-line-2", dot: "#5a6a8a" },
  triggered: { label: "Trigger met", cls: "text-amber border-amber/40 bg-amber/10", dot: "#f5b13d" },
  settling: { label: "Settling…", cls: "text-cyan border-cyan/40 bg-cyan/10", dot: "#38d6f5" },
  paid: { label: "Paid", cls: "text-green border-green/40 bg-green/10", dot: "#34d399" },
  deferred: { label: "Deferred", cls: "text-red border-red/40 bg-red/10", dot: "#ff5a64" },
  failed: { label: "Failed", cls: "text-red border-red/40 bg-red/10", dot: "#ff5a64" },
};
export function StatusPill({ status }: { status: BizStatus }) {
  const s = STATUS_STYLE[status];
  return <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", s.cls)}><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />{s.label}</span>;
}

export function TxLink({ hash, url, short = true }: { hash: string; url: string; short?: boolean }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan hover:underline">
      {short ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash}
      <ExternalLink size={11} />
    </a>
  );
}

export function Button({ children, onClick, disabled, variant = "default", className, title }: { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: "default" | "primary" | "danger" | "ghost"; className?: string; title?: string }) {
  const v = {
    default: "border-line-2 bg-panel-2 hover:bg-line text-text",
    primary: "border-cyan/50 bg-cyan/15 hover:bg-cyan/25 text-cyan",
    danger: "border-red/50 bg-red/10 hover:bg-red/20 text-red",
    ghost: "border-transparent hover:bg-panel-2 text-muted",
  }[variant];
  return (
    <button title={title} onClick={onClick} disabled={disabled} className={clsx("inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 h-8 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed", v, className)}>
      {children}
    </button>
  );
}

export function scoreColor(score: number) {
  if (score >= 70) return "#ff5a64";
  if (score >= 50) return "#f5b13d";
  if (score >= 30) return "#4f8cff";
  return "#5a6a8a";
}

export function fmtUtc(t: number) {
  const d = new Date(t * 1000);
  return `${d.toISOString().slice(5, 10).replace("-", "/")} ${d.toISOString().slice(11, 16)}Z`;
}

/** Testnet USDC from 6-decimal base units. */
export function usdc(units: string | number | bigint | undefined, digits = 2) {
  if (units === undefined) return "—";
  return (Number(units) / 1e6).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
