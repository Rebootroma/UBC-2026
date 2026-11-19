# Hackathon strategy

Rules and prizes are from [`HACKATHON.md`](../HACKATHON.md), captured from Devpost and the official guide on 2026-11-15. Re-check the Devpost rules page before submitting.

## Deadline and eligibility

- **Submission:** Fri Nov 20, 12:00 PM CST. **Finalist judging:** Sat Nov 21. The team must attend in person in Austin to receive any prize.
- **Code originality:** work created before Nov 13 is not allowed. All ResilienceOS code was written on the `feat/resilienceos` branch on Nov 19. The repository's earlier commits contain only planning documents. The raw public datasets in `data-raw/` are third-party data, not code.
- **Repository:** must be public at submission. `Rebootroma/UBC-2026` is currently **private**. Making it public is the team's decision.

## Track: DeFi & Onchain Applications

| Option | Fit |
| --- | --- |
| **DeFi & Onchain Apps (chosen)** | A new financial primitive: a USDC reserve that settles parametric cover on verified observations, with risk management (reserve vs correlated exposure, deferred claims, solvency stress tests). The track requires smart contracts, an economic and risk design in the README, and contract addresses. We meet all three. |
| Agentic Payments & AI | That track wants agents that *hold and send* stablecoins. ResilienceOS deliberately keeps agents out of the money path, so entering there would contradict the product's safety story. |
| Consumer Apps | The primary user is a fund or insurer operations team, not an everyday consumer. |

## Chain award: Best use of Arc

| Requirement | How we meet it |
| --- | --- |
| Core on-chain functionality on Arc (testnet fine) | `ParametricReserve` holds the USDC reserve and settles every payout on Arc testnet |
| USDC as gas, predictable fees | All gas is paid in USDC. A settlement of four policies costs a few hundred thousand gas at about 20 gwei, i.e. fractions of a cent. |
| Standard EVM tooling | Foundry (contracts and tests), viem (app) |
| Contract address and explanation in the README | README § Blockchain (filled in at deployment) |

## Bounties

| Bounty | Decision | Reason |
| --- | --- | --- |
| QuickNode Streams ($500) | **Not claimed yet.** | It needs a QuickNode account and a Stream configured with a filter and destination. The design is ready: filter `ParametricReserve` logs (PayoutExecuted, PayoutDeferred, ObservationAccepted) and send them by webhook to an `/api/stream` route that replaces polling. Worth about 2 hours if a teammate creates the account. |
| ElevenLabs | Not claimed | A voice assistant is possible ("Which businesses were paid?") but it is not built. The bounty requires it to be core, not an add-on. |
| Grok Bot | Not claimed | No meaningful role |
| Gemini Prediction Markets | Not claimed | Forcing prediction markets into disaster relief would weaken the product |

We claim only what is built.

## Judging criteria → what to show

| Criterion | Evidence |
| --- | --- |
| Technical execution | Real NOAA data pipeline with cross-validation; contract with 30 tests including fuzz and reentrancy; a parity test proving the off-chain evaluator equals the contract on 240 pairs; real Arc transactions; E2E test |
| Product & UX | Command center map, replay with settlement gates, payout explanations, provenance tags on every number |
| Innovation | Verified-observation oracle with an on-chain trigger, transparent solvency (deferred claims rather than hidden failures), AI that explains but cannot pay |
| Impact & potential | Small businesses have 27 days of cash buffer and wait weeks for aid. Clear buyers: municipal resilience funds, CDFIs, MGAs |
| Demo | Under 3 minutes: storm → trigger → real USDC payout → forged-oracle and duplicate attacks bounce off the contract |

## Submission checklist

- [ ] Arc testnet deployment: `ParametricReserve` address + cohort + funding txs in README and BUILD_STATUS
- [ ] At least one real payout tx hash, verified on explorer.testnet.arc.io
- [ ] Repo public (team decision), README complete
- [ ] Devpost form: track DeFi & Onchain Apps, chain award Arc, no bounties unless QuickNode is built
- [ ] Written answers (docs/DEVPOST_SUBMISSION.md)
- [ ] 2–3 minute demo video on YouTube/Drive with audio (docs/DEMO_SCRIPT.md)
- [ ] All team members listed on Devpost
- [ ] Working demo: public deployment or local run instructions
