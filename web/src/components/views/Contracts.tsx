"use client";

import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { BUSINESSES } from "@/lib/data";
import { addrUrl, txUrl, ARC_USDC } from "@/lib/chain/config";
import { SETTLEMENT_POINTS, useApp } from "../state";
import { Button, Panel, Tag, TxLink } from "../ui";

export function Contracts() {
  const { deployment, chain, runAttack, attacks, attackBusy, bizStatus } = useApp();
  const paid = BUSINESSES.find((b) => bizStatus(b).status === "paid" || chain?.policies.find((p) => p.businessId === b.id)?.status === "Paid");
  const paidPoint = paid ? SETTLEMENT_POINTS.find((p) => p.policies.some((x) => x.id === paid.id)) : undefined;

  return (
    <div className="h-full overflow-y-auto scroll-thin p-3">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel title="ParametricReserve on Arc testnet" right={<Tag kind="onchain" />}>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
            <dt className="text-muted">Network</dt><dd>Arc testnet · chain 5042002 · gas paid in USDC</dd>
            <dt className="text-muted">Contract</dt><dd>{deployment?.reserve ? <a href={addrUrl(deployment.reserve)} target="_blank" rel="noreferrer" className="font-mono text-cyan text-xs break-all">{deployment.reserve}</a> : "not deployed"}</dd>
            <dt className="text-muted">Settlement token</dt><dd><a href={addrUrl(deployment?.token ?? ARC_USDC)} target="_blank" rel="noreferrer" className="font-mono text-cyan text-xs">{deployment?.token}</a> <span className="text-xs text-dim">{deployment?.token?.toLowerCase() === ARC_USDC.toLowerCase() ? "Circle USDC (ERC-20 interface, 6 dp)" : "local test token"}</span></dd>
            <dt className="text-muted">Oracle signer</dt><dd className="font-mono text-xs">{deployment?.oracle}</dd>
            <dt className="text-muted">Admin / relayer</dt><dd className="font-mono text-xs">{deployment?.admin}</dd>
            <dt className="text-muted">Policy cohort</dt><dd className="text-xs">{deployment?.cohort ?? "—"} · {chain?.policyCount ?? "?"} policies registered</dd>
            <dt className="text-muted">Deploy tx</dt><dd>{deployment?.deployTx ? <TxLink hash={deployment.deployTx} url={txUrl(deployment.deployTx)} /> : "—"}</dd>
            <dt className="text-muted">Registration txs</dt><dd className="flex flex-wrap gap-2">{deployment?.cohortRegistrationTxs.map((h) => <TxLink key={h} hash={h} url={txUrl(h)} />)}</dd>
            <dt className="text-muted">Observations</dt><dd className="text-xs">{chain?.observationCount ?? "?"} accepted on chain · paused: {String(chain?.paused ?? false)}</dd>
          </dl>
        </Panel>

        <Panel title="Trigger semantics (predefined, deterministic)">
          <ol className="list-decimal ml-4 space-y-1.5 text-[13px] text-muted">
            <li><span className="text-text">Observation</span> = one NOAA ASOS report: 2-minute sustained wind (knots ×10), gust, station, UTC time, keccak256 of the raw METAR. Signed off-chain by the oracle with EIP-712.</li>
            <li><span className="text-text">Accepted</span> only if the signer holds <code className="text-cyan">ORACLE_ROLE</code>, it was never accepted before, it is not in the future, and values are physically plausible.</li>
            <li><span className="text-text">Eligible</span> only if: observation known · policy not yet settled for this storm · policy Active · station approved for the policy · time inside the coverage window · sustained ≥ threshold.</li>
            <li><span className="text-text">Paid</span> to the holder fixed at registration — the caller cannot choose the recipient. If the free reserve is short, the claim is recorded as owed (<code className="text-cyan">PayoutDeferred</code>), never hidden.</li>
            <li>AI agents have no keys and no write access. Removing the LLM changes no payout.</li>
          </ol>
        </Panel>

        <Panel title="Security console — attacks against the live contract" className="xl:col-span-2" right={attackBusy ? <Loader2 size={14} className="animate-spin text-cyan" /> : null}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-red/30 bg-red/5 p-3 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-red"><ShieldAlert size={15} /> Forged observation from an unauthorized key</div>
              <p className="text-xs text-muted">An attacker signs a fake 95 kt Galveston reading with a key that has no oracle role and relays it straight to the contract, bypassing ResilienceOS entirely.</p>
              <div className="flex gap-2">
                <Button variant="danger" disabled={attackBusy || !deployment?.reserve} onClick={() => runAttack({ type: "unauthorized-oracle", broadcast: false })}>Simulate against Arc</Button>
                <Button variant="ghost" disabled={attackBusy || !deployment?.reserve} onClick={() => runAttack({ type: "unauthorized-oracle", broadcast: true })} title="Sends a real transaction that reverts on chain (costs a little testnet gas)">Broadcast (reverts on chain)</Button>
              </div>
            </div>
            <div className="rounded-lg border border-amber/30 bg-amber/5 p-3 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber"><ShieldAlert size={15} /> Duplicate payout</div>
              <p className="text-xs text-muted">{paid ? <>Try to pay <b className="text-text">{paid.name}</b> a second time for Beryl, and resubmit the exact signed observation that paid it.</> : "Run the replay until at least one policy is paid, then try to get it paid twice."}</p>
              <div className="flex gap-2">
                <Button variant="danger" disabled={attackBusy || !paid || !paidPoint} onClick={() => runAttack({ type: "duplicate-payout", businessId: paid!.id, observationId: paidPoint!.observation.id, broadcast: false })}>Simulate against Arc</Button>
                <Button variant="ghost" disabled={attackBusy || !paid || !paidPoint} onClick={() => runAttack({ type: "duplicate-payout", businessId: paid!.id, observationId: paidPoint!.observation.id, broadcast: true })}>Broadcast (reverts on chain)</Button>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {attacks.length === 0 && <div className="text-xs text-dim">Results appear here. Every rejection below comes from the deployed contract&apos;s own revert, not from the UI.</div>}
            {attacks.map((a, i) => (
              <div key={i} className="rounded-lg border border-line bg-bg/50 p-3 text-sm space-y-1.5">
                <div className="flex items-center gap-2">{a.revertReason ? <ShieldCheck size={15} className="text-green" /> : <ShieldAlert size={15} className="text-red" />}<b>{a.message}</b></div>
                <div className="text-xs text-muted">{a.description}</div>
                <ul className="text-xs space-y-0.5">
                  {a.layers.map((l, j) => (
                    <li key={j} className="flex gap-2"><span className={l.outcome === "rejected" ? "text-green w-16 shrink-0" : "text-red w-16 shrink-0"}>{l.outcome.toUpperCase()}</span><span className="text-muted">{l.layer}: <span className="font-mono text-text">{l.detail}</span></span></li>
                  ))}
                </ul>
                {a.failedTxHash && a.explorerUrl && <div className="text-xs text-muted flex items-center gap-2">Reverted transaction <TxLink hash={a.failedTxHash} url={a.explorerUrl} /></div>}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Roles and controls" className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
            {[
              ["DEFAULT_ADMIN / POLICY_ADMIN", "Registers and cancels policies, grants roles. Cannot pay anyone directly."],
              ["ORACLE_ROLE", "Signs observations off-chain. Signature is verified on-chain via EIP-712 + ECDSA. Revocable."],
              ["PAUSER_ROLE", "Emergency stop for observation intake and settlement."],
              ["TREASURER_ROLE", "Withdraws only free reserve — never funds owed to deferred claims."],
              ["Anyone", "Can relay a signed observation or call settle(); funds still go only to the registered holder."],
              ["ReentrancyGuard + SafeERC20", "Settlement follows checks-effects-interactions; tested against a malicious re-entrant token."],
            ].map(([h, d]) => (
              <div key={h} className="rounded-lg border border-line p-3"><div className="font-mono text-xs text-cyan">{h}</div><div className="mt-1 text-muted">{d}</div></div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
