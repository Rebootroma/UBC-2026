"use client";

import { ShieldCheck } from "lucide-react";
import { useApp } from "../state";
import { AgentCard } from "../AgentCard";
import { Panel, fmtUtc } from "../ui";

export function Intelligence() {
  const { t, selected } = useApp();
  return (
    <div className="h-full overflow-y-auto scroll-thin p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">AI intelligence</h1>
        <span className="text-xs text-muted">Five analysts reading the same verified state at replay time <b className="text-text">{fmtUtc(t)}</b>. Move the replay to change what they see.</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
        <AgentCard agent="intel" />
        <AgentCard agent="exposure" />
        <AgentCard agent="coverage" businessId={selected ?? undefined} />
        <AgentCard agent="integrity" />
        <AgentCard agent="financial" />
        <Panel title="Why the agents can't move money">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2"><ShieldCheck size={15} className="text-green shrink-0 mt-0.5" />Agents receive a server-computed fact sheet. They have no tools, no wallet, no keys and no network access.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="text-green shrink-0 mt-0.5" />Output must match a strict schema. Each finding has to cite fact IDs; findings citing unknown IDs are dropped and counted.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="text-green shrink-0 mt-0.5" />Station text such as METAR strings is passed as data. The system prompt tells the model to ignore any instructions inside it.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="text-green shrink-0 mt-0.5" />Payouts come from a deterministic evaluator and the contract&apos;s own checks. Turn the LLM off (AGENTS_MODE=deterministic) and every payout is identical.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
