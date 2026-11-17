# Research

Three track-by-track research reports for the UBC 26 Hackathon, written on 2026-11-15. Requirements come from [`../HACKATHON.md`](../HACKATHON.md).

Each report covers the track requirements, the tools and resources available, key unsolved problems, existing solutions, gaps, and ranked project ideas with prize stacking.

| Report | Track | Top pick |
| --- | --- | --- |
| [01-agentic-payments-and-ai.md](01-agentic-payments-and-ai.md) | Agentic Payments and AI | Prediction-market research agent on Arc that buys x402 signals only when expected value exceeds price, behind an out-of-model policy guard |
| [02-defi-and-onchain-applications.md](02-defi-and-onchain-applications.md) | DeFi and Onchain Applications | Liquidation-odds guard on Solana: Gemini strike ladders become a liquidation probability that drives an Anchor oracle and an auto-protecting vault |
| [03-consumer-applications.md](03-consumer-applications.md) | Consumer Applications | Voice-first USDC wallet on Solana with spoken read-back and a guardian hold |

## Second round: new ideas (2026-11-16)

Written after the team judged the guardian voice wallet too simple. Each report looks for technically deeper ideas from one angle, with the tools checked against current docs. Where these reports disagree with the three above, the newer ones are more recent.

| Report | Angle | Top pick | Max cash | Effort (person-hours) |
| --- | --- | --- | --- | --- |
| [04-gemini-centred-ideas.md](04-gemini-centred-ideas.md) | Built around the Gemini bounty | Liquidation Odds Autopilot (DeFi, Arc): Gemini BTC strike ladders become the odds that a real Arc testnet loan is liquidated, and an agent repays from a capped onchain reserve | $6,000 | 45–55 |
| [05-arc-circle-deep-ideas.md](05-arc-circle-deep-ideas.md) | Arc and Circle, no Gemini | Multilateral invoice clearing (DeFi, Arc): a solver nets debt loops and one transaction discharges them | $3,500 | about 60 |
| [06-solana-ideas.md](06-solana-ideas.md) | Solana, no Gemini | Sealed (Consumer, Solana): private payouts on Token-2022 Confidential Balances with an auditor view and a per-payment proof, no Rust | $4,000 | 60–65 |

Max cash excludes an Official Winner place (up to $2,500). No idea has been chosen yet.

**Check before committing to one:**

- Liquidation Odds Autopilot: live Arc Borrow testnet markets were documented but not run. Run `exploreMarkets({ chain: "Arc_Testnet" })` from `@circle-fin/borrow-kit` first, and confirm the data terms with Gemini at office hours.
- Sealed: a confidential transfer from our own code on devnet was not tested, because the RPC faucet was closed.
- Multilateral invoice clearing: its novelty on Arc was checked by web search only, and the gas for a clearing round is an estimate.

## Cross-cutting findings

- Circle Agent Wallets and Nanopayments work on Arc testnet and do not support Solana, so the Circle agent stack pairs with Best use of Arc.
- The Gemini Prediction Markets API serves market data without a key. It has no contract price history endpoint, so odds must be recorded from now on.
- Gemini is offchain. Any project using it still needs real onchain functionality to meet a main track.
- QuickNode Streams supports Solana devnet and Arc testnet. The free trial allows one stream.
- "Grok Bot" is a separate agent product, not the `@grok` reply account on X. No official chat-export feature was found, and the bounty requires an export.
- Embedded wallets and gas sponsorship are solved problems on both chains. They will not score on Innovation alone.

## Open questions for office hours

- Gemini: is sandbox trading available for prediction markets, and are there eligibility limits by state?
- Cursor / xAI: what counts as a Grok Bot chat export, and which access tier is needed?
- Circle: the Arc testnet USDC address and free oracle options on Arc testnet.
- QuickNode: Streams free-tier coverage and credit cost on Solana and Arc testnet.

Each report lists its own unverified items. Check those before building on them.
