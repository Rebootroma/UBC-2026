# Build status

Last updated: 2026-11-20. Branch: `main`. Only results we actually ran are recorded here.

## Summary

| Area | Status |
| --- | --- |
| Contract `ParametricReserve` | ✅ Built; 30/30 Foundry tests pass |
| Data pipeline (HURDAT2 + IEM ASOS) | ✅ 16 track fixes, 20 stations, 1,360 reports (1,312 verifiable, 48 withheld) |
| Settlement service + oracle | ✅ **Live on Arc testnet**: real USDC payouts (see Deployment record). Also verified on a local Anvil fork with a mock token |
| Attack console | ✅ Verified on Arc testnet by `eth_call` against the live contract: `UnauthorizedOracle(0x5A73…)`, `NotEligible(AlreadySettledForEvent)`, `ObservationAlreadySubmitted`. Also verified on fork: `UnauthorizedOracle(0x5A73…)`, `NotEligible(AlreadySettledForEvent)`, `ObservationAlreadySubmitted`; broadcast transactions mined with status `reverted` |
| UI (command center, portfolio, contracts, payouts, intelligence, analytics) | ✅ Screenshot-reviewed in Chromium |
| AI agents | ✅ LLM mode exercised on 2026-11-20 with Google Gemini (`gemini-flash-lite-latest`): all five agents returned schema-valid, fully cited reports locally and on the hosted demo. Deterministic fallback verified (it took over when a model call timed out). The Claude path is implemented but not exercised: no `ANTHROPIC_API_KEY` |
| **Arc testnet deployment** | ✅ `0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6`, funded with 46 testnet USDC (faucet). Redeployed 2026-11-20 with fresh testnet keys; the first deployment was `0x630080c9840cac6ff94d5d3f1681a89dcf5c4510` |
| Public web deployment | ✅ https://resilienceos-six.vercel.app (Vercel, wired to the Arc testnet contract; `/api/state` verified) |
| QuickNode Streams | ✅ Stream `resilienceos-reserve-events` (Arc testnet, Logs, filtered to the reserve) delivers to `/api/stream`; a real `ReserveFunded` event arrived on 2026-11-20 |
| ElevenLabs voice briefings | ✅ `/api/voice` generates and caches a spoken briefing per settlement gate; all 11 clips generated on the hosted app on 2026-11-20 |

## Test results (run 2026-11-19)

| Suite | Command | Result |
| --- | --- | --- |
| Foundry | `cd contracts && forge test` | **30 passed, 0 failed** (incl. 512-run fuzz, reentrancy, deferral); re-run 2026-11-20 on Foundry 1.10.0 |
| Vitest unit | `cd web && npm test` | **34 passed** including parity (re-run 2026-11-20) |
| Contract parity (Anvil) | part of `npm test` | **passed**: 240 policy×observation pairs, evaluator == `checkEligibility` |
| Playwright E2E | `BASE_URL=http://localhost:3100 npx playwright test` | **1 passed**, against a local fork, and again on Nov 19 against **live Arc testnet** |
| Types / lint | `npm run typecheck`, `npx eslint src --quiet` | clean |

## Deployment record

| Item | Value |
| --- | --- |
| Network | Arc testnet (5042002) |
| ParametricReserve | [`0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6`](https://explorer.testnet.arc.io/address/0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6), block 73,125,314, deploy tx `0x6c4bd4dacc6b9cef9145ac051be93cd24da6608ed6055a874debcb07ef13c940` |
| Reserve funding | `0x018eb9cec661336d49f4d0ea7a607ecbce8fe0de82e407fcc48312083f2e55eb` (46 USDC) |
| Token | Circle USDC `0x3600000000000000000000000000000000000000` |
| Oracle | `0xca05D80Abd44697a9891cb9487eEdC007932038C` |
| Admin / relayer | `0xe4F777EA413bF9925be5351292e49aEd5C4fDF03` |
| Payout tx example | [`0xd2089f6663554dbec0a1e68be0af8bf0321c08a9e315941bb94eff95ce55f7a1`](https://explorer.testnet.arc.io/tx/0xd2089f6663554dbec0a1e68be0af8bf0321c08a9e315941bb94eff95ce55f7a1): KPSX 42 kt observation, 1 policy paid (RSL-0005 Starboard Kids Academy, 0.40 USDC), status success |

Current demo cohort and its registration txs: `web/src/data/deployment.json`. How to run the demo: README › Running the demo.

## Handoff (for a teammate continuing)

1. Clone `main` and follow README › Quick start.
2. Private keys are not in the repo by design. Either get `web/.env.local` from the original builder through a private channel, or make new keys with `cast wallet new`. With new keys, the admin and oracle addresses above will change. That's fine: `deploy` grants the roles to whichever keys are in `.env.local`.
3. Get free testnet USDC for the admin address at https://faucet.circle.com (Arc Testnet). No real money is involved.
4. `cd web && npm run chain -- deploy && npm run chain -- fund 45 && npm run chain -- cohort`, then `npm run dev` and play the replay.
5. Record the contract address and payout transaction hashes in this file and in the README, then commit.

## Commits

| SHA | Milestone |
| --- | --- |
| `ee103c8` | Contract, raw data, fixtures, domain library |
| `ae2dc83` | Settlement service, oracle, attack demos, agents, research docs |
| `f9bab2c` | Command center UI |
| `b5f70d4` | Unit, parity and E2E tests; analytics fixes |
| `415379b` | README, strategy, build status, submission docs |

## Known issues and remaining work

- Reserve holds 46.6 USDC, enough for one full replay (44.1). After a full replay, top up via faucet + `npm run chain -- fund` before the next one, or later claims defer.
- Attacks were not broadcast on testnet (`ALLOW_BROADCAST_ATTACKS` unset); the rejections shown are `eth_call` against the live contract.
- Fixed during deploy: the explorer API field is `transaction_hash`; tx links were blank on live testnet before that.
- The repo is private and must be made public for submission (team decision).
- Demo video not recorded.
- At demo scale, Beryl's 30 triggered policies need about 44.1 USDC. If the reserve holds less, later payouts show as deferred, which is correct behaviour.
