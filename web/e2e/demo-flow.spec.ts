import { expect, test } from "@playwright/test";

/**
 * The judged demo flow, end to end, against a running server (BASE_URL) wired to a deployed ParametricReserve.
 * Settlement can be "Settled" (first run) or "already settled" (later runs) — both prove on-chain state.
 */
test("hurricane replay → verified trigger → on-chain payout → attacks rejected", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");

  // 1. Map renders, chain connected
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Arc testnet · block/)).toBeVisible({ timeout: 20_000 });

  // 2. Scrub to just before Gulf Coast Hardware's trigger (07:51Z) and play
  const scrub = page.locator("input[type=range].scrub");
  await scrub.evaluate((el: HTMLInputElement) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(el, String(Date.parse("2024-07-08T07:45:00Z") / 1000));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Play", exact: true }).click();

  // 3. Verification checks run and settlement resolves against the contract
  await expect(page.getByText("Independent METAR parse").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/Settled \d+ polic|already been settled/).first()).toBeVisible({ timeout: 90_000 });
  await page.getByRole("button", { name: "Pause" }).click().catch(() => {});

  // 4. Business detail explains the payout
  await page.getByRole("button", { name: /Business/ }).first().click();
  await expect(page.getByText("Why this business was paid")).toBeVisible({ timeout: 30_000 });

  // 5. Security console: forged oracle and duplicate payout are rejected by the contract
  await page.getByRole("button", { name: /Contracts/ }).click();
  await page.getByRole("button", { name: "Simulate against Arc" }).first().click();
  await expect(page.getByText(/UnauthorizedOracle\(0x/).first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Simulate against Arc" }).nth(1).click();
  await expect(page.getByText(/NotEligible\(AlreadySettledForEvent\)/).first()).toBeVisible({ timeout: 30_000 });

  // 6. Payout explorer lists decoded on-chain payouts (needs an indexer that sees this chain)
  await page.getByRole("button", { name: /Payout Explorer/ }).click();
  await expect(page.getByText("Accounting (live contract reads)")).toBeVisible();

  expect(errors).toEqual([]);
});
