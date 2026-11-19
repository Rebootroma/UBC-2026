# Build status

Last updated: 2026-11-19. Branch: `feat/resilienceos`. Only results we actually ran are recorded here.

## Summary

| Area | Status |
| --- | --- |
| Contract `ParametricReserve` | ✅ Built; 30/30 Foundry tests pass |
| Data pipeline (HURDAT2 + IEM ASOS) | ✅ 16 track fixes, 20 stations, 1,360 reports (1,312 verifiable, 48 withheld) |
| Settlement service + oracle | ✅ Verified end to end on a local Anvil fork of Arc testnet (mock 6-dp token) |
| Attack console | ✅ Verified on fork: `UnauthorizedOracle(0x5A73…)`, `NotEligible(AlreadySettledForEvent)`, `ObservationAlreadySubmitted`; broadcast transactions mined with status `reverted` |
| UI (command center, portfolio, contracts, payouts, intelligence, analytics) | ✅ Screenshot-reviewed in Chromium |
| AI agents | ✅ Deterministic mode verified. LLM mode is implemented (claude-opus-5-5, structured outputs) but **not exercised**: no `ANTHROPIC_API_KEY` in this environment |
| **Arc testnet deployment** | ⛔ **Blocked**: deployer `0x183bBe4c2f5050d58055B6c6A4890927b6F67C6e` has 0 USDC. It needs funding at https://faucet.circle.com (Arc Testnet). |
| Public web deployment | ❌ Not done (no hosting credentials). It runs locally per the README. |
| QuickNode Streams, ElevenLabs | ❌ Not built |

## Test results (run 2026-11-19)

| Suite | Command | Result |
| --- | --- | --- |
| Foundry | `cd contracts && forge test` | **30 passed, 0 failed** (incl. 512-run fuzz, reentrancy, deferral) |
| Vitest unit | `cd web && npm test` | **33 passed** |
| Contract parity (Anvil) | part of `npm test` | **passed**: 240 policy×observation pairs, evaluator == `checkEligibility` |
| Playwright E2E | `BASE_URL=http://localhost:3100 npx playwright test` | **1 passed**, against the dev server wired to a local Arc fork |
| Types / lint | `npm run typecheck`, `npx eslint src --quiet` | clean |

## Deployment record

| Item | Value |
| --- | --- |
| Network | Arc testnet (5042002) |
| ParametricReserve | _pending funding_ |
| Token | Circle USDC `0x3600000000000000000000000000000000000000` |
| Oracle | `0x613D761cE2E38287C4dF8Cc402884a60B63a450a` |
| Admin / relayer | `0x183bBe4c2f5050d58055B6c6A4890927b6F67C6e` |
| Payout tx examples | _pending_ |

To unblock: fund the admin, then `cd web && npm run chain -- deploy && npm run chain -- fund <amount> && npm run chain -- cohort`, run the replay, and record the hashes here.

## Commits

| SHA | Milestone |
| --- | --- |
| `ee103c8` | Contract, raw data, fixtures, domain library |
| `ae2dc83` | Settlement service, oracle, attack demos, agents, research docs |
| `f9bab2c` | Command center UI |
| `b5f70d4` | Unit, parity and E2E tests; analytics fixes |

## Known issues and remaining work

- Arc testnet deployment and real payouts (blocked on faucet funding; everything else is ready).
- The repo is private and must be made public for submission (team decision).
- Demo video not recorded.
- At demo scale, Beryl's 30 triggered policies need about 44.1 USDC. If the reserve holds less, later payouts show as deferred, which is correct behaviour.
- Agents in LLM mode are untested without an API key.
