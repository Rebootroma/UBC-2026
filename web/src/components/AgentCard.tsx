"use client";

import { useState } from "react";
import { Bot, Loader2, RefreshCw } from "lucide-react";
import type { AgentReport } from "@/lib/agents/run";
import type { AgentId } from "@/lib/agents/facts";
import { useApp } from "./state";
import { Button, Tag, fmtUtc } from "./ui";

export const AGENT_META: Record<AgentId, { name: string; blurb: string }> = {
  intel: { name: "Disaster Intelligence", blurb: "Storm progression and verified observations" },
  exposure: { name: "Business Exposure", blurb: "Who is most vulnerable, and why" },
  coverage: { name: "Coverage Analysis", blurb: "Policy terms, evidence, basis risk" },
  integrity: { name: "Fraud & Integrity", blurb: "Data quality, outages, attack controls" },
  financial: { name: "Financial Response", blurb: "Reserve, payouts, solvency" },
};

export function AgentCard({ agent, businessId, compact }: { agent: AgentId; businessId?: string; compact?: boolean }) {
  const { t } = useApp();
  const [report, setReport] = useState<AgentReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showFacts, setShowFacts] = useState(false);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agent, t: Math.round(t), businessId }) });
      if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
      setReport(await r.json());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-bg/40">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-line">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={14} className="text-violet shrink-0" />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{AGENT_META[agent].name} agent</div>
            {!compact && <div className="text-[11px] text-dim truncate">{AGENT_META[agent].blurb}</div>}
          </div>
        </div>
        <Button onClick={run} disabled={busy} variant={report ? "ghost" : "primary"}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : report ? <RefreshCw size={13} /> : null}
          {report ? "Re-run" : "Analyze"}
        </Button>
      </div>
      <div className="px-3 py-2.5 text-[13px] space-y-2">
        {err && <div className="text-red text-xs">{err}</div>}
        {!report && !busy && !err && <div className="text-xs text-dim">Runs on facts computed from verified data at {fmtUtc(t)}. Read-only: cannot move funds or change policies.</div>}
        {report && (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag kind={report.mode === "llm" ? "llm" : "derived"}>{report.mode === "llm" ? `LLM · ${report.model}` : "deterministic"}</Tag>
              <Tag kind="derived">{report.facts.length} facts</Tag>
              {report.droppedFindings > 0 && <Tag kind="synthetic">{report.droppedFindings} uncited finding(s) dropped</Tag>}
            </div>
            <p className="font-medium leading-snug">{report.headline}</p>
            <ul className="space-y-1.5">
              {report.findings.map((f, i) => (
                <li key={i} className="leading-snug text-[12.5px]">
                  {f.text} <span className="text-[10px] text-dim font-mono">[{f.evidence.join(", ")}]</span>
                </li>
              ))}
            </ul>
            {report.recommendedActions.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-dim">Suggested follow-up (advisory only)</div>
                <ul className="list-disc ml-4 text-[12px] text-muted">{report.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
            <div className="text-[11px] text-dim italic">{report.uncertainty}</div>
            <button className="text-[11px] text-cyan" onClick={() => setShowFacts(!showFacts)}>{showFacts ? "Hide" : "Show"} grounding facts</button>
            {showFacts && (
              <ul className="space-y-1 border-t border-line pt-2">
                {report.facts.map((f) => (
                  <li key={f.id} className="text-[11px] text-muted"><span className="font-mono text-dim">{f.id}</span> <Tag kind={f.provenance} /> {f.text}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
