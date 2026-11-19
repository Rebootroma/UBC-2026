/**
 * Demo scale. Policies represent modeled USD coverage; the contract pays real Arc testnet USDC.
 * Testnet faucet funds are limited, so on-chain payouts are the modeled coverage divided by DEMO_SCALE.
 * Example: a $5,000 policy pays 0.50 testnet USDC on chain. The UI always shows both numbers.
 */
export const DEMO_SCALE = 10_000;
export const USDC_DECIMALS = 6;

export const EVENT = {
  atcfId: "AL022024",
  name: "Hurricane Beryl",
  year: 2024,
  eventKey: "NHC:AL022024",
  landfall: "2024-07-08T08:40:00Z",
  landfallPlace: "near Matagorda, Texas",
  replayStart: "2024-07-07T12:00:00Z",
  replayEnd: "2024-07-08T23:00:00Z",
} as const;

export function usdToUnits(usd: number): bigint {
  return BigInt(Math.round((usd * 10 ** USDC_DECIMALS) / DEMO_SCALE));
}

export function formatUsdc(units: bigint | string | number, digits = 2): string {
  const v = Number(BigInt(units)) / 10 ** USDC_DECIMALS;
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 4) });
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
