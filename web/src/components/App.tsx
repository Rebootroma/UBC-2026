"use client";

import clsx from "clsx";
import { Activity, BarChart3, Brain, Building2, FileCode2, Map as MapIcon, Receipt, ShieldCheck } from "lucide-react";
import { AppProvider, useApp, type View } from "./state";
import { CommandCenter } from "./views/CommandCenter";
import { Portfolio } from "./views/Portfolio";
import { Contracts } from "./views/Contracts";
import { Payouts } from "./views/Payouts";
import { Intelligence } from "./views/Intelligence";
import { Analytics } from "./views/Analytics";
import { usdc } from "./ui";

const NAV: { id: View; label: string; icon: typeof MapIcon }[] = [
  { id: "command", label: "Command Center", icon: MapIcon },
  { id: "portfolio", label: "Portfolio", icon: Building2 },
  { id: "contracts", label: "Contracts & Security", icon: FileCode2 },
  { id: "payouts", label: "Payout Explorer", icon: Receipt },
  { id: "intel", label: "AI Intelligence", icon: Brain },
  { id: "analytics", label: "Risk Analytics", icon: BarChart3 },
];

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { view, setView, chain, deployment, chainError } = useApp();
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="h-12 shrink-0 border-b border-line bg-panel/80 backdrop-blur flex items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan to-blue grid place-items-center">
            <ShieldCheck size={14} className="text-bg" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight">ResilienceOS</span>
          <span className="hidden md:inline text-xs text-dim">Financial first responders for a changing climate</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/5 px-2.5 py-1 text-amber">
            Prototype · synthetic businesses · testnet funds
          </span>
          <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", chain?.deployed && !chainError ? "border-green/30 text-green" : "border-red/30 text-red")}>
            <Activity size={12} />
            {chain?.deployed ? `Arc testnet · block ${Number(chain.blockNumber).toLocaleString()}` : chainError ?? "Connecting to Arc…"}
          </span>
          {chain?.stream?.deliveries ? (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-cyan/30 px-2.5 py-1 text-cyan" title={`Last delivery ${chain.stream.lastDeliveryAt}`}>
              QuickNode Stream · {chain.stream.events} events
            </span>
          ) : null}
          {chain?.deployed && <span className="hidden sm:inline text-muted num">Reserve <b className="text-text">{usdc(chain.reserveBalance)}</b> USDC</span>}
          {deployment?.reserve && <span className="hidden xl:inline font-mono text-dim">{deployment.reserve.slice(0, 8)}…</span>}
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        <nav className="w-14 lg:w-52 shrink-0 border-r border-line bg-panel/60 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={clsx("mx-2 flex items-center gap-3 rounded-lg px-3 h-9 text-sm transition", view === n.id ? "bg-cyan/10 text-cyan" : "text-muted hover:bg-panel-2 hover:text-text")}
              title={n.label}
            >
              <n.icon size={16} className="shrink-0" />
              <span className="hidden lg:inline truncate">{n.label}</span>
            </button>
          ))}
          <div className="mt-auto hidden lg:block px-4 text-[10px] leading-relaxed text-dim">
            Data: NOAA NHC HURDAT2 · Iowa Environmental Mesonet ASOS. Businesses are fictional. Payouts are real Arc testnet USDC at demo scale 1:10,000.
          </div>
        </nav>
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {view === "command" && <CommandCenter />}
          {view === "portfolio" && <Portfolio />}
          {view === "contracts" && <Contracts />}
          {view === "payouts" && <Payouts />}
          {view === "intel" && <Intelligence />}
          {view === "analytics" && <Analytics />}
        </main>
      </div>
    </div>
  );
}
