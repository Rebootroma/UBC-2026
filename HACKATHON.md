# UBC 26 Hackathon — Brief

University Blockchain Conference Hackathon 2026, hosted by college.xyz at UT Austin.
Prize pool: $22,000+ in cash, plus sponsor perks.

Captured from the Devpost page and the official guide on 2026-11-15. The sources below win if anything here disagrees with them.

- Devpost: https://ubc-hackathon-2026.devpost.com/
- Rules: https://ubc-hackathon-2026.devpost.com/rules
- Official guide: https://docs.google.com/document/d/1QaySCo7u3VxMVNdk3C5Ab3ewc2E46AuLntti-Uzx5EY/edit
- Workshop schedule: https://docs.google.com/document/d/1eI8S0gBu6xI36DFqgqGZlO1qX6YYzFTEXBx9L5ve_zA/edit

Telegram, Discord, and meeting links are in the guide and the workshop schedule.

## Timeline (all times CST)

| When | What |
| --- | --- |
| Thu Nov 12, 6:00 PM | Kickoff, hacking starts |
| Mon Nov 16 – Thu Nov 19, 6:00–8:00 PM | Sponsor office hours |
| **Fri Nov 20, 12:00 PM** | **Submission deadline** |
| Fri Nov 20, by 11:59 PM | Finalists notified |
| Sat Nov 21 | In-person judging and final pitches, UBC closing ceremony |
| Sat Nov 21, 5:00 PM | Winners announced |

Venue: AT&T Executive Education & Conference Center, 1900 University Ave, Austin, TX.

### Office hours

Drop-in, no appointment. Keep questions to 10–15 minutes per team. Bring code and specific questions.

| Day | 6:00–7:00 PM | 7:00–8:00 PM |
| --- | --- | --- |
| Mon Nov 16 | Solana, Circle | Gemini |
| Tue Nov 17 | Cursor (6:00–6:30) | Gemini |
| Wed Nov 18 | Solana, Circle | QuickNode |
| Thu Nov 19 | — | Solana, Gemini |

## Rules

- The team must be present in person at the closing ceremony on Nov 21 to qualify for any prize, including bounties.
- All code must be created during the event. Work created before Nov 13 is not allowed. No pre-existing projects or old codebases.
- AI tools are allowed and encouraged. Builders must remain the primary creators, and the project must be a working, substantive build.
- Teams of 1–4. Solo builders are welcome.
- Participants keep full ownership of their code and IP.
- Judges' decisions are final.

## How prizes stack

1. **Main track** (required, exactly one): $2,000 Track Winner per track.
2. **Chain award** (optional, one): Best use of Solana ($1,500) or Best use of Arc ($1,000), judged within the main track. Never both.
3. **Bounties** (optional, any number): stack with everything, including each other.
4. **Official UBC 2026 Hackathon Winner** (automatic): 1st $2,500 + 3 months ElevenLabs Pro per member, 2nd $1,000, 3rd $500.

All prizes stack except Best use of Solana with Best use of Arc.

Example from the guide: a DeFi project on Solana using QuickNode Streams could win DeFi Track Winner ($2,000), Best use of Solana ($1,500), the QuickNode bounty ($500), and an Official Winner place.

On the Devpost form: select the main track, the chain award (Solana, Arc, or None), and the bounties, then opt in to the matching prizes.

## Main tracks

Main tracks are chain-agnostic. Devnet or testnet is fine.

### Agentic Payments and AI

AI agents that safely hold, send, and receive stablecoins to pay for APIs, data, and compute.

Recommended: x402, Circle Agent Wallets or Nanopayments, Solana Agent Kit.

Objectives:
- Agents that pay for APIs, data, or compute per request (for example with x402).
- Spending controls and guardrails: budgets, allowlists, human approval for large transactions.
- Marketplaces or services that agents can discover and pay for in USDC.
- Tools that let LLMs read from and act on the blockchain safely.

Requirements:
- Agents execute onchain transactions or read the blockchain on any chain.
- Document the agent's decision loop and the safety limits in place.

### DeFi and Onchain Applications

New financial primitives and smart-contract apps: exchanges, lending, yield, derivatives, payment rails.

Objectives:
- Design new DeFi primitives or meaningfully improve existing ones (capital efficiency, risk management, liquidity).
- Compose with existing protocols rather than rebuilding them.
- Make DeFi safer and more accessible: risk dashboards, simplified UX, better onboarding.
- Enable cross-chain flows, for example moving USDC between chains with CCTP.

Requirements:
- Interact with smart contracts on any chain. Deploying your own is optional.
- Explain the economic design and risk assumptions in the README.
- Include the address of any program or contract the project deploys or uses.

### Consumer Applications

Everyday apps (payments, social, gaming, creator tools, loyalty) where the crypto is invisible to the user.

Objectives:
- Onboard and retain retail users by abstracting bridging, gas fees, and seed phrases.
- Build something people would use every day, not once.
- Intentional, thoughtful design and UX.

Requirements:
- Interact with the blockchain in some way.
- Provide a working, user-facing frontend (web or mobile).

## Chain awards

One winner per main track for each chain. You compete only against projects on the same chain in your own main track.

### Best use of Solana — $1,500

Objectives:
- Anchor or native Rust for any programs written; use Solana's speed and low fees.
- Solana-native primitives: SPL tokens, Token Extensions, Solana Pay.
- Integrate with existing Solana protocols and tooling.
- Smooth end-user experience with Solana wallets.

Requirements:
- Core onchain functionality on Solana (devnet is fine). Deploying new programs is optional; using existing ones counts.
- Include program ID(s) and explain in the README how the project uses Solana.

### Best use of Arc — $1,000

Arc is Circle's EVM-compatible Layer-1 for stablecoin finance, with USDC as the native gas token.

Objectives:
- Payment, treasury, or FX apps that use USDC as gas for predictable fees.
- Standard EVM tooling such as Hardhat or Foundry.
- Combine Arc with Circle tools: Wallets, CCTP, Gateway, Paymaster.
- User experiences where fees and balances are simple and stable.

Requirements:
- Core onchain functionality on Arc (testnet is fine). Deploying new contracts is optional; using existing ones counts.
- Include contract address(es) and explain in the README how the project uses Arc.

## Bounties

Judged by the sponsor and a UBC team representative. Each also requires a main-track submission that meets that track's requirements.

### Gemini Prediction Markets — $2,500 / $1,000 / $500

Objectives:
- Analytics and visualizations of how market odds move over time.
- Trading tools, bots, or AI agents that act on prediction market data.
- Bring prediction market data into other apps: news, social, onchain.
- Improve how users discover and understand markets.

Requirement: use the Gemini Prediction Markets API (market data and/or trading endpoints).

### QuickNode Streams — $500

Objectives:
- Real-time apps that react to onchain events: wallet alerts, whale or trade trackers, live dashboards.
- Streams filters that turn raw chain data into exactly what the app needs.
- Backfill historical data for analytics, indexers, leaderboards, risk monitoring.
- Trigger automated actions from onchain activity.

Requirements:
- QuickNode Streams as a core data source.
- At least one Stream configured with a filter and a destination (webhook or database).
- README explains the Stream configuration (network, dataset, filter logic, destination) and why.

### ElevenLabs — 3 months of Scale tier per member

Objectives:
- Voice interfaces for crypto, such as a wallet or trading assistant you can talk to.
- ElevenLabs Agents that take onchain actions.
- Accessibility: apps fully usable by voice.
- Generated narration, music, or sound effects.

Requirements:
- ElevenLabs API or SDK as a core feature, not an add-on.
- Demo video shows the integration in action, with audio.
- README describes which ElevenLabs products were used and how.

### Grok Bot — mechanical keyboard per member + swag

Objectives:
- Grok Bot does real work: automating a workflow or running agent tasks.
- Grok Bot watches onchain activity and surfaces or acts on what it finds.
- Helps users take action, not only get answers.
- Central to the experience, not a novelty.

Requirements:
- Grok Bot as a core part of the project.
- A Grok Bot chat export showing how it was built or used.
- A short README section (3–4 sentences) explaining Grok Bot's role.
- Working and technically sound.

### Participation prize

1 month of ElevenLabs Creator, a $49/mo QuickNode plan, and X Premium (QuickNode and X Premium limited to 300 participants). Only for complete, working submissions that meet every item under "What to submit".

## What to submit

- [ ] Project name, short description, all team members
- [ ] Main track (one), chain award (Solana, Arc, or None), bounties, and prize opt-ins on the Devpost form
- [ ] Written answers: What did you build? What problem does it solve? How does it work? What makes it unique? What would you build next?
- [ ] Technologies and sponsor tools used
- [ ] Public GitHub repo with source code and setup instructions, created during the hackathon
- [ ] Working demo or deployed application
- [ ] 2–3 minute demo video on YouTube or Google Drive, accessible to the judges
- [ ] README with technical documentation and an architecture overview
- [ ] Track-specific items: contract or program addresses, decision loop and safety limits, economic design and risk assumptions, and so on

## Judging

| Criterion | Meaning |
| --- | --- |
| Technical Execution | Functionality, technical depth, effective use of blockchain infrastructure |
| Product & UX | Clear problem, intuitive experience, quality of the product |
| Innovation | Originality and creativity of the idea |
| Impact & Potential | Real-world usefulness, adoption potential, ability to become a viable product |
| Demo | Quality of the live product demonstration and clear communication |

No weights are published.

Process:
1. Initial screening of all submissions.
2. Up to 13 finalists: 3 per main track (top contender for Track Winner, Best use of Solana, Best use of Arc), the top 3 Official Winner contenders, and the 1st place Gemini bounty team.
3. Bounty winners chosen by each sponsor and a UBC representative from the submissions.
4. Finalists pitch on stage: 5 minutes plus 2 minutes of Q&A.
5. A UBC representative picks each Track Winner, a Solana representative picks Best use of Solana, an Arc representative picks Best use of Arc. The UBC team picks the Official Winners.

Judges: Solana, Circle, ElevenLabs, Gemini, QuickNode, Cursor teams.

## Resources

- Solana: https://solana.com/docs · https://solanacookbook.com/ · https://www.anchor-lang.com/
- Circle and Arc: https://developers.circle.com/ (Arc docs, CCTP, Wallets, USDC addresses, and the testnet faucet are linked from the guide)
- EVM tooling: Hardhat, Foundry
- Gemini Prediction Markets, ElevenLabs, QuickNode Streams: doc links are in the official guide
- Sponsor perks (ElevenLabs coupon, QuickNode credits, Cursor / Grok): redemption steps are at the end of the official guide
