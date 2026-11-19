import { defineChain, keccak256, toBytes, type Address, type Hex } from "viem";
import { arcTestnet as viemArc } from "viem/chains";
import deployment from "@/data/deployment.json";

export const ARC_RPC_URL = process.env.ARC_RPC_URL || process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";

export const arcTestnet = defineChain({
  ...viemArc,
  rpcUrls: { default: { http: [ARC_RPC_URL] } },
});

export const EXPLORER = "https://explorer.testnet.arc.io";
/** Circle USDC on Arc testnet, ERC-20 interface (6 decimals). Source: docs.arc.io contract addresses. */
export const ARC_USDC: Address = "0x3600000000000000000000000000000000000000";

export interface Deployment {
  network: string;
  chainId: number;
  reserve: Address | null;
  token: Address;
  deployBlock: number;
  deployTx: Hex | null;
  admin: Address | null;
  oracle: Address | null;
  cohort: string | null;
  cohortRegistrationTxs: Hex[];
  fundingTxs: Hex[];
}

export const DEPLOYMENT = deployment as Deployment;

export const txUrl = (h: string) => `${EXPLORER}/tx/${h}`;
export const addrUrl = (a: string) => `${EXPLORER}/address/${a}`;

export const eventKey = (atcf: string): Hex => keccak256(toBytes(`NHC:${atcf}`));
export const stationKey = (icao: string): Hex => keccak256(toBytes(`ASOS:${icao}`));
export const policyKey = (cohort: string, policyNumber: string): Hex => keccak256(toBytes(`RSL:${cohort}:${policyNumber}`));
export const businessKey = (id: string): Hex => keccak256(toBytes(id));
