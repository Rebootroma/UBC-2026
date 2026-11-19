# Build status

Last updated: 2026-11-19. Branch: `feat/resilienceos`. Only results we actually ran are recorded here.

## Summary

| Area | Status |
| --- | --- |
| Contract `ParametricReserve` | ✅ Built; 30/30 Foundry tests pass |
| Data pipeline (HURDAT2 + IEM ASOS) | ✅ 16 track fixes, 20 stations, 1,360 reports (1,312 verifiable, 48 withheld) |
| Settlement service + oracle | ✅ **Live on Arc testnet**: real USDC payouts (see Deployment record). Also verified on a local Anvil fork with a mock token |
| Attack console | ✅ Verified on Arc testnet by `eth_call` against the live contract: `UnauthorizedOracle(0x5A73…)`, `NotEligible(AlreadySettledForEvent)`, `ObservationAlreadySubmitted`. Also verified on fork: `UnauthorizedOracle(0x5A73…)`, `NotEligible(AlreadySettledForEvent)`, `ObservationAlreadySubmitted`; broadcast transactions mined with status `reverted` |
| UI (command center, portfolio, contracts, payouts, intelligence, analytics) | ✅ Screenshot-reviewed in Chromium |
| AI agents | ✅ Deterministic mode verified. LLM mode is implemented (claude-opus-5-5, structured outputs) but **not exercised**: no `ANTHROPIC_API_KEY` in this environment |
| **Arc testnet deployment** | ✅ `0x630080c9840cac6ff94d5d3f1681a89dcf5c4510`, funded with 18 testnet USDC (faucet) |
| Public web deployment | ❌ Not done (no hosting credentials). It runs locally per the README. |
| QuickNode Streams, ElevenLabs | ❌ Not built |

## Test results (run 2026-11-19)

| Suite | Command | Result |
| --- | --- | --- |
| Foundry | `cd contracts && forge test` | **30 passed, 0 failed** (incl. 512-run fuzz, reentrancy, deferral) |
| Vitest unit | `cd web && npm test` | **33 passed** |
| Contract parity (Anvil) | part of `npm test` | **passed**: 240 policy×observation pairs, evaluator == `checkEligibility` |
| Playwright E2E | `BASE_URL=http://localhost:3100 npx playwright test` | **1 passed**, against a local fork, and again on Nov 19 against **live Arc testnet** |
| Types / lint | `npm run typecheck`, `npx eslint src --quiet` | clean |

## Deployment record

| Item | Value |
| --- | --- |
| Network | Arc testnet (5042002) |
| ParametricReserve | [`0x630080c9840cac6ff94d5d3f1681a89dcf5c4510`](https://explorer.testnet.arc.io/address/0x630080c9840cac6ff94d5d3f1681a89dcf5c4510), block 73,088,774, deploy tx `0x1052cd44074166d6687dec367d1f16a577224ca9b1a301ac92d16c2e4e0e1386` |
| Reserve funding | `0x3630c6982e7998d7b7912002c03a0050d6125c9665d6e534e3e4caffa6e08f62` (18 USDC) |
| Token | Circle USDC `0x3600000000000000000000000000000000000000` |
| Oracle | `0x613D761cE2E38287C4dF8Cc402884a60B63a450a` |
| Admin / relayer | `0x183bBe4c2f5050d58055B6c6A4890927b6F67C6e` |
| Payout tx example | [`0xf593411a8c2afe7467b00d6cd71a880caace68e24308357d42b4aed4cf3ed998`](https://explorer.testnet.arc.io/tx/0xf593411a8c2afe7467b00d6cd71a880caace68e24308357d42b4aed4cf3ed998): KPSX 47 kt observation, 4 policies paid (RSL-0001 0.50, RSL-0004 0.35, RSL-0005 0.40, RSL-0076 2.50 USDC), status success |

Current demo cohort and its registration txs: `web/src/data/deployment.json`. How to run the demo: README › Running the demo.

## Handoff (for a teammate continuing)

1. Clone, check out `feat/resilienceos`, and follow README › Quick start.
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

- Reserve holds about 14 USDC, so a full replay defers some claims (needs about 44 to pay all). Top up via faucet + `npm run chain -- fund`.
- Attacks were not broadcast on testnet (`ALLOW_BROADCAST_ATTACKS` unset); the rejections shown are `eth_call` against the live contract.
- Fixed during deploy: the explorer API field is `transaction_hash`; tx links were blank on live testnet before that.
- The repo is private and must be made public for submission (team decision).
- Demo video not recorded.
- At demo scale, Beryl's 30 triggered policies need about 44.1 USDC. If the reserve holds less, later payouts show as deferred, which is correct behaviour.
- Agents in LLM mode are untested without an API key.
