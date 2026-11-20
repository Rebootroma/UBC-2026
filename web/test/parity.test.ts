/**
 * Off-chain evaluator ↔ on-chain checkEligibility parity, against the real compiled contract on a throwaway Anvil.
 * Skipped automatically when Anvil or the Foundry build output is unavailable.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { parametricReserveAbi, parametricReserveBytecode } from "@/lib/chain/abi";
import { eventKey, stationKey } from "@/lib/chain/config";
import { evaluatePolicy } from "@/lib/policy";
import { BUSINESSES, OBSERVATIONS } from "@/lib/data";
import { ELIGIBILITY_CODES } from "@/lib/types";

// foundryup installs to ~/.foundry/bin; Homebrew and Linux packages put anvil elsewhere.
const ANVIL =
  [path.join(os.homedir(), ".foundry", "bin", "anvil"), "/opt/homebrew/bin/anvil", "/usr/local/bin/anvil", "/usr/bin/anvil"].find((p) => fs.existsSync(p)) ??
  path.join(os.homedir(), ".foundry", "bin", "anvil");
const ART = path.resolve(__dirname, "../../contracts/out/ParametricReserve.t.sol/TestUSD.json");
const enabled = fs.existsSync(ANVIL) && fs.existsSync(ART);
const PORT = 8611;
// Anvil's well-known dev keys (public, test-only)
const ADMIN = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
const ORACLE = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");

describe.skipIf(!enabled)("evaluator ↔ contract parity (Anvil)", () => {
  let anvil: ChildProcess;
  const chain = { ...foundry, rpcUrls: { default: { http: [`http://127.0.0.1:${PORT}`] } } };
  const pub = createPublicClient({ chain, transport: http() });
  const wallet = createWalletClient({ account: ADMIN, chain, transport: http() });
  let reserve: Hex;

  beforeAll(async () => {
    anvil = spawn(ANVIL, ["--port", String(PORT), "--silent", "--timestamp", "1763500000"]);
    for (let i = 0; i < 50; i++) {
      try { await pub.getChainId(); break; } catch { await new Promise((r) => setTimeout(r, 200)); }
    }
    const art = JSON.parse(fs.readFileSync(ART, "utf8"));
    const th = await wallet.deployContract({ abi: art.abi, bytecode: art.bytecode.object, args: [] });
    const token = (await pub.waitForTransactionReceipt({ hash: th })).contractAddress!;
    const rh = await wallet.deployContract({ abi: parametricReserveAbi, bytecode: parametricReserveBytecode, args: [token, ADMIN.address] });
    reserve = (await pub.waitForTransactionReceipt({ hash: rh })).contractAddress!;
    const role = await pub.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "ORACLE_ROLE" });
    await pub.waitForTransactionReceipt({ hash: await wallet.writeContract({ address: reserve, abi: parametricReserveAbi, functionName: "grantRole", args: [role, ORACLE.address] }) });
    const inputs = BUSINESSES.slice(0, 20).map((b) => ({
      policyId: stationKey(`P:${b.id}`),
      holder: b.wallet,
      businessRef: stationKey(b.id),
      payoutAmount: BigInt(b.policy.payoutUnits),
      thresholdDeciKnots: b.policy.thresholdKt * 10,
      coverageStart: BigInt(Date.parse(b.policy.coverageStart) / 1000),
      coverageEnd: BigInt(Date.parse(b.policy.coverageEnd) / 1000),
      stations: b.policy.stations.map(stationKey),
    }));
    await pub.waitForTransactionReceipt({ hash: await wallet.writeContract({ address: reserve, abi: parametricReserveAbi, functionName: "registerPolicies", args: [inputs] }) });
  }, 60_000);

  afterAll(() => anvil?.kill());

  it("agrees on every (policy, observation) pair for a sample of real Beryl reports", async () => {
    const sample = OBSERVATIONS.filter((o) => o.verifiable && o.sustainedKt !== null && ["KPSX", "KBYY", "KLBX", "KGLS", "KARM"].includes(o.stationId)).filter((_, i) => i % 6 === 0).slice(0, 12);
    expect(sample.length).toBeGreaterThanOrEqual(10);
    let compared = 0;
    for (const o of sample) {
      const obs = { eventId: eventKey("AL022024"), stationId: stationKey(o.stationId), observedAt: BigInt(o.t), sustainedDeciKnots: o.sustainedKt! * 10, gustDeciKnots: o.gustKt ? o.gustKt * 10 : 0, sourceHash: o.sourceHash };
      const digest = await pub.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "hashObservation", args: [obs] });
      const sig = await ORACLE.signTypedData({
        domain: { name: "ResilienceOS ParametricReserve", version: "1", chainId: chain.id, verifyingContract: reserve },
        types: { Observation: [{ name: "eventId", type: "bytes32" }, { name: "stationId", type: "bytes32" }, { name: "observedAt", type: "uint64" }, { name: "sustainedDeciKnots", type: "uint32" }, { name: "gustDeciKnots", type: "uint32" }, { name: "sourceHash", type: "bytes32" }] },
        primaryType: "Observation",
        message: obs,
      });
      await pub.waitForTransactionReceipt({ hash: await wallet.writeContract({ address: reserve, abi: parametricReserveAbi, functionName: "submitObservation", args: [obs, sig] }) });
      for (const b of BUSINESSES.slice(0, 20)) {
        const onchain = await pub.readContract({ address: reserve, abi: parametricReserveAbi, functionName: "checkEligibility", args: [stationKey(`P:${b.id}`), digest] });
        const off = evaluatePolicy({ policy: b.policy, status: "Active", settledEvents: new Set(), observation: o, eventId: "NHC:AL022024" }).result;
        expect(`${b.id}@${o.id}:${off}`).toBe(`${b.id}@${o.id}:${ELIGIBILITY_CODES[onchain]}`);
        compared++;
      }
    }
    expect(compared).toBe(sample.length * 20);
    console.log(`parity: ${compared} policy×observation pairs compared`);
  }, 120_000);
});
