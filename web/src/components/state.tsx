"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BUSINESSES, OBSERVATIONS, settlementPoints } from "@/lib/data";
import { EVENT } from "@/lib/config";
import { computeExposure, type ExposureResult } from "@/lib/exposure";
import { TRACK } from "@/lib/data";
import type { Business, Observation } from "@/lib/types";
import type { ChainState } from "@/lib/chain/state";
import type { Deployment } from "@/lib/chain/config";
import type { SettlementResult, AttackResult } from "@/lib/settlement";

export const REPLAY_START = Date.parse(EVENT.replayStart) / 1000;
export const REPLAY_END = Date.parse(EVENT.replayEnd) / 1000;
export const SETTLEMENT_POINTS = settlementPoints();

export type View = "command" | "portfolio" | "contracts" | "payouts" | "intel" | "analytics";

export interface GateState {
  observationId: string;
  status: "pending" | "running" | "done" | "error";
  result?: SettlementResult;
  error?: string;
}

export type BizStatus = "covered" | "triggered" | "settling" | "paid" | "deferred" | "failed";

interface Ctx {
  view: View;
  setView: (v: View) => void;
  t: number;
  setT: (t: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  speed: number;
  setSpeed: (s: number) => void;
  autoSettle: boolean;
  setAutoSettle: (b: boolean) => void;
  /** Spoken briefings (ElevenLabs). `voiceAvailable` is false when the server has no key. */
  voice: boolean;
  setVoice: (b: boolean) => void;
  voiceAvailable: boolean;
  reset: () => void;
  selected: string | null;
  select: (id: string | null) => void;
  chain: ChainState | null;
  deployment: Deployment | null;
  chainError: string | null;
  refreshChain: () => Promise<void>;
  gates: Record<string, GateState>;
  runGate: (observationId: string) => Promise<void>;
  attacks: AttackResult[];
  runAttack: (body: Record<string, unknown>) => Promise<AttackResult | null>;
  attackBusy: boolean;
  exposures: Map<string, ExposureResult>;
  bizStatus: (b: Business) => { status: BizStatus; txHash?: string; amountUnits?: string; observation?: Observation };
  visibleObs: Observation[];
}

const C = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(C);
  if (!c) throw new Error("useApp outside provider");
  return c;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("command");
  const [t, setTRaw] = useState(REPLAY_START);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(45); // replay minutes per second
  const [autoSettle, setAutoSettle] = useState(true);
  const [voice, setVoice] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceRef = useRef(true);
  voiceRef.current = voice && voiceAvailable;
  // One clip at a time: briefings for gates that settle close together are queued, not overlapped.
  const voiceQueue = useRef<Promise<void>>(Promise.resolve());
  const speak = useCallback((observationId: string, variant: "paid" | "deferred") => {
    voiceQueue.current = voiceQueue.current.then(
      () =>
        new Promise<void>((resolve) => {
          if (!voiceRef.current) return resolve();
          const a = new Audio(`/api/voice?obs=${encodeURIComponent(observationId)}&v=${variant}`);
          a.onended = () => resolve();
          a.onerror = () => resolve();
          a.play().catch(() => resolve());
        }),
    );
  }, []);
  useEffect(() => {
    fetch("/api/voice").then((r) => r.json()).then((j) => setVoiceAvailable(!!j.configured)).catch(() => setVoiceAvailable(false));
  }, []);
  const [selected, select] = useState<string | null>("RSL-0001");
  const [chain, setChain] = useState<ChainState | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);
  const [gates, setGates] = useState<Record<string, GateState>>({});
  const [attacks, setAttacks] = useState<AttackResult[]>([]);
  const [attackBusy, setAttackBusy] = useState(false);
  const gateRef = useRef(gates);
  gateRef.current = gates;
  const tRef = useRef(t);
  tRef.current = t;

  const setT = useCallback((v: number) => setTRaw(Math.min(REPLAY_END, Math.max(REPLAY_START, Math.round(v)))), []);

  const refreshChain = useCallback(async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      const j = await r.json();
      setChain(j.state);
      setDeployment(j.deployment);
      setChainError(j.state?.error ?? null);
    } catch (e) {
      setChainError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    refreshChain();
    const id = setInterval(refreshChain, 8000);
    return () => clearInterval(id);
  }, [refreshChain]);

  const runGate = useCallback(
    async (observationId: string) => {
      const g = gateRef.current[observationId];
      if (g && (g.status === "running" || g.status === "done")) return;
      setGates((s) => ({ ...s, [observationId]: { observationId, status: "running" } }));
      try {
        const r = await fetch("/api/settle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ observationId }) });
        const result = (await r.json()) as SettlementResult;
        setGates((s) => ({ ...s, [observationId]: { observationId, status: result.status === "failed" ? "error" : "done", result, error: result.status === "failed" ? result.message : undefined } }));
        if (result.status === "settled" && result.payouts.length) speak(observationId, result.payouts.some((p) => p.outcome !== "paid") ? "deferred" : "paid");
        await refreshChain();
      } catch (e) {
        setGates((s) => ({ ...s, [observationId]: { observationId, status: "error", error: (e as Error).message } }));
      }
    },
    [refreshChain, speak],
  );

  // Replay clock
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = tRef.current + dt * speed * 60;
      // Settlement gate: pause at the first unprocessed trigger crossed
      const gate = autoSettle
        ? SETTLEMENT_POINTS.find((p) => p.observation.t > tRef.current && p.observation.t <= next && !gateRef.current[p.observation.id])
        : undefined;
      if (gate) {
        setT(gate.observation.t);
        setPlaying(false);
        runGate(gate.observation.id).then(() => setTimeout(() => setPlaying(true), 900));
        return;
      }
      if (next >= REPLAY_END) {
        setT(REPLAY_END);
        setPlaying(false);
        return;
      }
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, autoSettle, runGate, setT]);

  const reset = useCallback(() => {
    setPlaying(false);
    setT(REPLAY_START);
    setGates({});
  }, [setT]);

  const runAttack = useCallback(
    async (body: Record<string, unknown>) => {
      setAttackBusy(true);
      try {
        const r = await fetch("/api/attack", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "attack request failed");
        setAttacks((a) => [j as AttackResult, ...a]);
        return j as AttackResult;
      } catch (e) {
        setChainError((e as Error).message);
        return null;
      } finally {
        setAttackBusy(false);
      }
    },
    [],
  );

  // Exposure recomputed per 15-minute bucket of replay time
  const bucket = Math.floor(t / 900) * 900;
  const exposures = useMemo(() => new Map(BUSINESSES.map((b) => [b.id, computeExposure(b, TRACK, bucket)])), [bucket]);

  const visibleObs = useMemo(() => OBSERVATIONS.filter((o) => o.t <= t), [t]);

  const bizStatus = useCallback(
    (b: Business) => {
      const point = SETTLEMENT_POINTS.find((p) => p.policies.some((x) => x.id === b.id));
      const onchain = chain?.policies.find((p) => p.businessId === b.id);
      const payoutEvent = chain?.events.find((e) => (e.name === "PayoutExecuted" || e.name === "DeferredPayoutSettled") && e.args.policyId === onchain?.policyId);
      const gate = point ? gates[point.observation.id] : undefined;
      const fromGate = gate?.result?.payouts.find((p) => p.businessId === b.id);
      const reached = point && point.observation.t <= t;
      if (!reached) return { status: "covered" as BizStatus };
      if (onchain?.status === "Paid" || fromGate?.outcome === "paid")
        return { status: "paid" as BizStatus, txHash: payoutEvent?.txHash ?? gate?.result?.txHash, amountUnits: onchain?.paidUnits ?? fromGate?.amountUnits, observation: point.observation };
      if (onchain?.status === "Deferred" || fromGate?.outcome === "deferred") return { status: "deferred" as BizStatus, observation: point.observation, txHash: gate?.result?.txHash };
      if (gate?.status === "running") return { status: "settling" as BizStatus, observation: point.observation };
      if (gate?.status === "error") return { status: "failed" as BizStatus, observation: point.observation };
      return { status: "triggered" as BizStatus, observation: point.observation };
    },
    [chain, gates, t],
  );

  const value: Ctx = {
    view, setView, t, setT, playing, setPlaying, speed, setSpeed, autoSettle, setAutoSettle, voice, setVoice, voiceAvailable, reset, selected, select,
    chain, deployment, chainError, refreshChain, gates, runGate, attacks, runAttack, attackBusy, exposures, bizStatus, visibleObs,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
