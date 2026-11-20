"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Cpu } from "lucide-react";
import type { Address, Hex } from "viem";
import { observationDigest, sourceHashOf, type PublicObservation } from "@/lib/chain/digest";

/** Runs the same hashing in the visitor's browser, on text they can edit, so nothing has to be taken on trust. */
export function Recompute({ observation, reserve, onchainDigest }: { observation: PublicObservation; reserve: Address; onchainDigest: Hex }) {
  const [metar, setMetar] = useState(observation.metar);
  const [result, setResult] = useState<{ sourceHash: Hex; digest: Hex } | null>(null);
  const run = (text: string) => setResult({ sourceHash: sourceHashOf(text), digest: observationDigest({ ...observation, metar: text }, reserve) });
  const match = result && result.digest.toLowerCase() === onchainDigest.toLowerCase();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Don&apos;t trust this page. The hashing below runs in your browser. Edit a single character of the weather report and the result stops matching the chain.
      </p>
      <textarea
        value={metar}
        onChange={(e) => { setMetar(e.target.value); setResult(null); }}
        spellCheck={false}
        rows={3}
        className="w-full rounded-lg border border-line-2 bg-bg/60 p-3 font-mono text-xs text-text focus:border-cyan focus:outline-none"
        aria-label="Raw weather report"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => run(metar)} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/50 bg-cyan/15 px-3 h-9 text-sm font-medium text-cyan hover:bg-cyan/25">
          <Cpu size={14} /> Recompute in my browser
        </button>
        {metar !== observation.metar && (
          <button onClick={() => { setMetar(observation.metar); setResult(null); }} className="rounded-lg border border-line-2 px-3 h-9 text-sm text-muted hover:bg-panel-2">
            Restore original report
          </button>
        )}
      </div>
      {result && (
        <div className={`rounded-lg border p-3 text-xs space-y-1.5 ${match ? "border-green/40 bg-green/5" : "border-red/40 bg-red/5"}`}>
          <div className={`flex items-center gap-1.5 text-sm font-medium ${match ? "text-green" : "text-red"}`}>
            {match ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
            {match ? "Match: the contract recorded exactly this report." : "No match: this is not the report the contract recorded."}
          </div>
          <div className="font-mono break-all text-muted"><span className="text-dim">keccak256(report) </span>{result.sourceHash}</div>
          <div className="font-mono break-all text-muted"><span className="text-dim">your digest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>{result.digest}</div>
          <div className="font-mono break-all text-muted"><span className="text-dim">on-chain digest&nbsp;&nbsp;&nbsp; </span>{onchainDigest}</div>
        </div>
      )}
    </div>
  );
}
