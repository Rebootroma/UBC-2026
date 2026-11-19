/**
 * Arc testnet operations for ResilienceOS. Keys are read from web/.env.local (never committed).
 *
 *   npm run chain -- status
 *   npm run chain -- deploy                 deploy ParametricReserve with Arc USDC, grant ORACLE_ROLE
 *   npm run chain -- cohort                 register all 80 synthetic policies under a fresh cohort id
 *   npm run chain -- fund <usdc>            approve + fundReserve
 */
import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, erc20Abi, formatUnits, http, parseUnits, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet as viemArc } from "viem/chains";
import { parametricReserveAbi, parametricReserveBytecode } from "../src/lib/chain/abi";
import { businessKey, policyKey, stationKey } from "../src/lib/chain/config";
import businesses from "../src/data/businesses.json";
import type { Business } from "../src/lib/types";

const DEPLOY_FILE = path.join(__dirname, "..", "src", "data", "deployment.json");
const dep = JSON.parse(fs.readFileSync(DEPLOY_FILE, "utf8"));
const save = () => fs.writeFileSync(DEPLOY_FILE, JSON.stringify(dep, null, 2) + "\n");

const rpc = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const chain = { ...viemArc, rpcUrls: { default: { http: [rpc] } } };
const pub = createPublicClient({ chain, transport: http() });
const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} missing from web/.env.local`);
  return v as Hex;
};
const admin = privateKeyToAccount(need("ADMIN_PRIVATE_KEY"));
const oracle = privateKeyToAccount(need("ORACLE_PRIVATE_KEY"));
const wallet = createWalletClient({ account: admin, chain, transport: http() });
let USDC = dep.token as Hex;

async function status() {
  const [bal, native] = await Promise.all([
    pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [admin.address] }),
    pub.getBalance({ address: admin.address }),
  ]);
  console.log({ admin: admin.address, oracle: oracle.address, adminUsdc: formatUnits(bal, 6), adminNative18: formatUnits(native, 18), reserve: dep.reserve, cohort: dep.cohort });
  if (dep.reserve) {
    const r = { address: dep.reserve as Hex, abi: parametricReserveAbi } as const;
    const [rb, pc, ex, paid, owed] = await Promise.all([
      pub.readContract({ ...r, functionName: "reserveBalance" }),
      pub.readContract({ ...r, functionName: "policyCount" }),
      pub.readContract({ ...r, functionName: "activeExposure" }),
      pub.readContract({ ...r, functionName: "totalPaid" }),
      pub.readContract({ ...r, functionName: "totalOwed" }),
    ]);
    console.log({ reserveBalance: formatUnits(rb, 6), policies: pc, activeExposure: formatUnits(ex, 6), totalPaid: formatUnits(paid, 6), totalOwed: formatUnits(owed, 6) });
  }
}

async function deploy(localMock = false) {
  let token = USDC;
  if (localMock) {
    // LOCAL TESTING ONLY: Anvil cannot emulate Arc's native-backed USDC, so deploy a 6-decimal test token.
    if (!/127\.0\.0\.1|localhost/.test(rpc)) throw new Error("--local-mock is only allowed against a local node");
    const art = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "contracts", "out", "ParametricReserve.t.sol", "TestUSD.json"), "utf8"));
    const th = await wallet.deployContract({ abi: art.abi, bytecode: art.bytecode.object, args: [] });
    token = (await pub.waitForTransactionReceipt({ hash: th })).contractAddress!;
    const m = await wallet.writeContract({ address: token, abi: art.abi, functionName: "mint", args: [admin.address, BigInt(1_000_000_000)] });
    await pub.waitForTransactionReceipt({ hash: m });
    console.log("LOCAL mock token", token);
    dep.token = token;
    USDC = token;
  }
  const hash = await wallet.deployContract({ abi: parametricReserveAbi, bytecode: parametricReserveBytecode, args: [token, admin.address] });
  console.log("deploy tx", hash);
  const rcpt = await pub.waitForTransactionReceipt({ hash });
  if (!rcpt.contractAddress || rcpt.status !== "success") throw new Error("deploy failed");
  console.log("ParametricReserve at", rcpt.contractAddress, "block", rcpt.blockNumber);
  const role = await pub.readContract({ address: rcpt.contractAddress, abi: parametricReserveAbi, functionName: "ORACLE_ROLE" });
  const g = await wallet.writeContract({ address: rcpt.contractAddress, abi: parametricReserveAbi, functionName: "grantRole", args: [role, oracle.address] });
  await pub.waitForTransactionReceipt({ hash: g });
  console.log("granted ORACLE_ROLE to", oracle.address, g);
  Object.assign(dep, {
    reserve: rcpt.contractAddress,
    deployBlock: Number(rcpt.blockNumber),
    deployTx: hash,
    admin: admin.address,
    oracle: oracle.address,
    oracleGrantTx: g,
    cohort: null,
    cohortRegistrationTxs: [],
    fundingTxs: [],
  });
  save();
}

async function cohort() {
  if (!dep.reserve) throw new Error("deploy first");
  const id = `C${new Date().toISOString().replace(/[-:T]/g, "").slice(2, 12)}`;
  const list = businesses as Business[];
  const inputs = list.map((b) => ({
    policyId: policyKey(id, b.policy.policyNumber),
    holder: b.wallet,
    businessRef: businessKey(b.id),
    payoutAmount: BigInt(b.policy.payoutUnits),
    thresholdDeciKnots: b.policy.thresholdKt * 10,
    coverageStart: BigInt(Date.parse(b.policy.coverageStart) / 1000),
    coverageEnd: BigInt(Date.parse(b.policy.coverageEnd) / 1000),
    stations: b.policy.stations.map(stationKey),
  }));
  const txs: Hex[] = [];
  for (let i = 0; i < inputs.length; i += 20) {
    const batch = inputs.slice(i, i + 20);
    const { request } = await pub.simulateContract({ account: admin, address: dep.reserve, abi: parametricReserveAbi, functionName: "registerPolicies", args: [batch] });
    const h = await wallet.writeContract(request);
    const r = await pub.waitForTransactionReceipt({ hash: h });
    console.log(`registered ${i + batch.length}/${inputs.length}`, h, r.status, "gas", r.gasUsed);
    txs.push(h);
  }
  dep.cohort = id;
  dep.cohortRegistrationTxs = txs;
  save();
}

async function fund(amount: string) {
  if (!dep.reserve) throw new Error("deploy first");
  const units = parseUnits(amount, 6);
  const a = await wallet.writeContract({ address: USDC, abi: erc20Abi, functionName: "approve", args: [dep.reserve, units] });
  await pub.waitForTransactionReceipt({ hash: a });
  const f = await wallet.writeContract({ address: dep.reserve, abi: parametricReserveAbi, functionName: "fundReserve", args: [units] });
  const r = await pub.waitForTransactionReceipt({ hash: f });
  console.log("funded", amount, "USDC", f, r.status);
  dep.fundingTxs = [...(dep.fundingTxs ?? []), f];
  save();
}

const [cmd, arg] = process.argv.slice(2);
const run = { status, deploy: () => deploy(arg === "--local-mock"), cohort, fund: () => fund(arg) }[cmd as "status"];
if (!run) {
  console.error("usage: chain status|deploy|cohort|fund <usdc>");
  process.exit(1);
}
run().catch((e) => {
  console.error(e.shortMessage ?? e.message);
  process.exit(1);
});
