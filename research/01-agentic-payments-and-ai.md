# Agentic Payments and AI track: research report

Researched on 2026-11-15 for the UBC 26 Hackathon (deadline Fri Nov 20, 12:00 PM CST). Requirements come from `HACKATHON.md` and the official guide. Everything else comes from the live web, with a source beside each claim.

How to read the confidence labels:

- **Verified** means I read the official page or queried the npm registry myself today.
- **Secondary** means the claim comes from a third-party article or a search summary, and I did not open the official source.
- **Unverified** means I could not confirm it. Check it before you rely on it.

## Summary

1. **The Circle stack only works on EVM chains, and it fits Arc best.** Circle Agent Wallets and Gateway Nanopayments do not support Solana. On Arc testnet they work today with a keyless hosted facilitator. A team that wants the recommended Circle tools should compete for Best use of Arc, not Best use of Solana.
2. **Circle's built-in spending policies do not apply on testnet.** The docs say "Policies apply to mainnet agent wallets only." A testnet project must build its own guardrails. That is the second objective of this track, so the gap is also the opportunity.
3. **Basic "agent pays for an API with x402" is no longer novel.** At ETHGlobal Cannes, 98% of Arc submissions were agentic and 40% used Nanopayments. Spend-limit wrappers, escrow refunds, and discovery catalogs all have several existing projects. The open ground is narrower: guardrails that sit outside the model and survive prompt injection, human approval that is pleasant to use, and an agent that can explain why each payment was worth it.
4. **The Gemini bounty is the largest stackable prize ($2,500) and gives an extra finalist slot.** Its market data API needs no key. A prediction-market agent that pays for information is the best prize stack in this track.

**Top pick:** a prediction-market research agent on Arc that buys data per request with Nanopayments, only when the expected value of the information exceeds its price, behind a policy guard that the model cannot bypass, with a voice call for human approval. Details are in section 5.

## 1. Requirements

### 1.1 The track

Source: `HACKATHON.md` and the official guide.

| Item | What it demands |
| --- | --- |
| Theme | AI agents that safely hold, send, and receive stablecoins to pay for APIs, data, and compute. |
| Hard requirement 1 | The agent executes onchain transactions or reads the blockchain, on any chain. Testnet or devnet is fine. |
| Hard requirement 2 | The README documents the agent's decision loop and the safety limits in place. |
| Objectives (any) | Pay per request (for example x402). Spending controls: budgets, allowlists, human approval for large transactions. Marketplaces agents can discover and pay in USDC. Tools that let LLMs read and act on the chain safely. |
| Recommended tools | x402, Circle Agent Wallets or Nanopayments, Solana Agent Kit. |
| Prize | $2,000 Track Winner, picked by a UBC representative. |

The word "safely" appears in the theme, in an objective, and in a requirement. A project that pays but has no credible safety story misses the point of the track.

### 1.2 Stackable awards

| Award | Requirements | Who judges |
| --- | --- | --- |
| Best use of Solana, $1,500 | Core onchain functionality on Solana. Program IDs in the README, plus an explanation of how Solana is used. Objectives favor Anchor or native Rust, SPL tokens, Token Extensions, Solana Pay, existing protocols, and smooth wallet UX. | Solana representative |
| Best use of Arc, $1,000 | Core onchain functionality on Arc. Contract addresses in the README, plus an explanation of how Arc is used. Objectives favor USDC as gas, Hardhat or Foundry, and combining Arc with Circle Wallets, CCTP, Gateway, and Paymaster. | Arc (Circle) representative |
| Gemini Prediction Markets, $2,500 / $1,000 / $500 | Use the Gemini Prediction Markets API, market data or trading. | Gemini and a UBC representative |
| QuickNode Streams, $500 | Streams as a core data source. At least one Stream with a filter and a destination. README explains network, dataset, filter logic, destination, and why. | QuickNode and a UBC representative |
| ElevenLabs, 3 months Scale per member | ElevenLabs API or SDK as a core feature. Demo video shows it with audio. README lists the products used. | ElevenLabs and a UBC representative |
| Grok Bot, keyboard per member | Grok Bot as a core part. A chat export. A 3 to 4 sentence README section. Working and sound. | Sponsor and a UBC representative |

Solana and Arc cannot both be chosen. All bounties stack with everything. The team must attend the closing ceremony in person on Nov 21 to receive any prize.

### 1.3 What the judges are likely to reward

This is my reading of the criteria, not a published rubric.

- **The UBC representative** picks the Track Winner on the five criteria. No weights are published. A clear problem and a demo that works on stage count as much as depth.
- **The Arc representative** has already seen many agents that pay with Nanopayments. The Arc blog on ETHGlobal Cannes praised projects with a real social or economic purpose and resilient design, not payment plumbing alone ([arc.io blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned)). Using several Circle products together matches the stated objectives.
- **The Solana representative** will look for real Solana primitives: a deployed Anchor program, SPL or Token Extensions, Solana Pay.
- **Finalist slots.** Up to 13 teams pitch. Each track gets three slots: the top contender for Track Winner, for Best use of Solana, and for Best use of Arc. The first-place Gemini team also gets a slot. Choosing a chain award and entering Gemini each add a path to the stage.
- **Demo format.** Finalists get 5 minutes plus 2 minutes of Q&A. The submission also needs a 2 to 3 minute video. The project needs one moment that is easy to see and remember.

## 2. Tools and resources available now

### 2.1 x402

| Aspect | Finding | Confidence |
| --- | --- | --- |
| What it is | An HTTP payment protocol. The server answers `402 Payment Required` with payment requirements. The client signs a payment and retries. A facilitator verifies and settles. | Verified, [docs.x402.org](https://docs.x402.org/core-concepts/network-and-token-support.md) |
| Version | V2 launched December 2025. It uses CAIP-2 network IDs and splits spec, SDKs, and facilitators. V1 fields such as `X-PAYMENT` and names such as `solana-devnet` should not be used in new code. | Secondary, [x402.org V2 post](https://www.x402.org/writing/x402-v2-launch), Solana docs summary |
| Packages | `@x402/core`, `@x402/fetch`, `@x402/express`, `@x402/next`, `@x402/evm`, `@x402/svm`, `@x402/mcp`, `@x402/extensions`. All are at version 2.31.0, published 2026-11-12. | Verified on the npm registry |
| Chains | Any EVM chain (`eip155:<id>`), Solana, Stellar, Aptos, Hedera, NEAR, Sui, XRPL, Algorand, TON, Cardano, and others. | Verified, [docs.x402.org](https://docs.x402.org/core-concepts/network-and-token-support.md) |
| Tokens | EVM: EIP-3009 tokens such as USDC, or any ERC-20 through Permit2. Solana: any SPL or Token-2022 token. | Verified, same page |
| Schemes | `exact` settles each request. `batch-settlement` uses a deposit plus signed vouchers on EVM and Solana. `upto` is mentioned only in passing. | Verified, same page |
| Free testnet facilitator | The x402.org facilitator supports Base Sepolia (`eip155:84532`) and Solana devnet (`solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`) with no setup. The URL `https://x402.org/facilitator` comes from a search summary. | Chains verified. URL secondary. |
| Arc testnet | The x402.org facilitator does not list Arc. Use Circle's Gateway facilitator (section 2.2) or self-host a facilitator. | Verified by absence from the list |
| Governance | x402 moved to a Linux Foundation body in 2026. Sources disagree on the date (April or July). | Secondary, conflicting |
| Setup time | About 1 to 2 hours for a paid Express endpoint and a paying client on Base Sepolia or Solana devnet. | My estimate |

Gotchas:

- The resource server and the facilitator must both support the exact scheme and network pair that the server advertises.
- A May 2026 paper, "Five Attacks on x402 Agentic Payment Protocol," audited three open-source SDKs and reports practical attacks on authorization, binding, replay protection, and web-layer handling. Outcomes include unpaid service and paid-but-denied ([arXiv 2605.11781](https://arxiv.org/abs/2605.11781)). I did not check which issues are fixed in 2.31.0.
- Many tutorials still show V1 code.

### 2.2 Circle and Arc

| Tool | What it does | Status and facts | Confidence |
| --- | --- | --- | --- |
| Arc testnet | Circle's EVM Layer-1. USDC is the gas token. | Chain ID `5042002`. RPC `https://rpc.testnet.arc.io`. WebSocket `wss://rpc.testnet.arc.io`. Explorer `https://explorer.testnet.arc.io`. Faucet `https://faucet.circle.com`. viem ships `arcTestnet` built in. | Verified, [docs.arc.io](https://docs.arc.io/integrate/connect-to-arc) |
| Arc mainnet | Same, production. | Chain ID `5042`. News outlets report launch on 2026-09-16. Not needed for the hackathon. | Chain ID verified. Launch date secondary. |
| Circle Agent Wallets | A USDC wallet the agent operates through Circle CLI. Custody is 2-of-2 MPC, and the agent never sees key shares. | Install with `npm install -g @circle-fin/cli` (version 1.3.0, published 2026-11-10, Node 20.18.2 or later). Log in with `circle wallet login <email> --testnet`. Fund on testnet with `circle wallet fund --address <addr> --chain ARC-TESTNET`, which sends 20 USDC. Supported chains: Arbitrum, Arc, Avalanche, Base, Ethereum, Monad, Optimism, Polygon PoS, Unichain. **Solana is not supported.** | Verified, [quickstart](https://developers.circle.com/agent-stack/agent-wallets/quickstart.md), [supported blockchains](https://developers.circle.com/agent-stack/agent-wallets/supported-blockchains.md) |
| Agent Wallet policies | Per-transaction, daily, weekly, and monthly USDC caps. Recipient and contract allowlists and blocklists. Changes need an email OTP. | **"Policies apply to mainnet agent wallets only."** There is no human-approval-per-transaction feature on the page. Limits do not cover token allowances (`approve` and later `transferFrom`). Default is 100 USDC per month if no policy is set. | Verified, [custom policies](https://developers.circle.com/agent-stack/agent-wallets/wallet-operations/custom-policies.md) |
| Gateway Nanopayments | Gas-free USDC payments down to $0.000001. The buyer deposits once into a Gateway Wallet contract, then signs EIP-3009 authorizations offchain. Gateway settles in batches. It implements x402. | Works on Arc testnet (`arcTestnet`) and 11 other EVM chains. **Not on Solana.** **EOA signatures only, no ERC-1271**, so smart contract wallets cannot pay this way. Seller balance rises only after the batch settles. No batch interval is published. | Verified, [overview](https://developers.circle.com/gateway/nanopayments.md), [supported blockchains](https://developers.circle.com/gateway/references/supported-blockchains.md), [batched settlement](https://developers.circle.com/gateway/nanopayments/concepts/batched-settlement.md) |
| Nanopayments SDK | Buyer and seller helpers for x402. | `@circle-fin/x402-batching` version 4.0.0, published 2026-10-22. Seller side: `BatchFacilitatorClient`, `GatewayEvmScheme`, `createGatewayMiddleware`. Client side: `GatewayClient({ chain: "arcTestnet", privateKey })`. The 402 response should include an entry with `extra.name` equal to `"GatewayWalletBatched"`. | Verified, [seller how-to](https://developers.circle.com/gateway/nanopayments/howtos/x402-seller.md) and npm |
| Gateway testnet facilitator | Hosted facilitator for Nanopayments. | `https://gateway-api-testnet.circle.com`, network `eip155:5042002`. The Circle walkthrough shows no API key. | Verified, [Circle blog, May 2026](https://www.circle.com/blog/turn-your-api-into-a-storefront-for-agents) |
| Circle x402 Facilitator Service | Hosted facilitator for the standard `exact` scheme on Arc, Base, and Polygon PoS. | Reported live in September 2026, with keyless testing on Arc testnet. I did not find the official docs page. | Secondary, [Crypto Briefing](https://cryptobriefing.com/circle-x402-facilitator-service-arc-launch/) |
| Circle Agent Marketplace | A catalog of services that agents can find and pay. | `agents.circle.com/services`. Sellers apply through a form. | Verified that Circle describes it, same Circle blog. I did not test it. |
| Developer-controlled wallets | Server-side wallets through API. | `@circle-fin/developer-controlled-wallets` version 10.8.1. Circle identifier for Arc testnet is `ARC-TESTNET`. Needs a Circle Console account and API key. | Package verified on npm. Setup details not re-read today. |
| CCTP, Gateway crosschain, Paymaster | Move USDC between chains, hold a unified balance, pay gas in USDC on other chains. | Gateway withdrawals from the CLI are same-chain only today. The SDK shows crosschain withdraw to `baseSepolia`. On Arc itself, Paymaster matters less because gas is already USDC. | Partly verified, Circle blog and seller how-to. CCTP and Paymaster on Arc testnet not re-checked. |
| Arc testnet USDC contract | ERC-20 interface for native USDC. | `0x3600000000000000000000000000000000000000`, six decimals at the ERC-20 interface, 18 decimals as the native gas token, one shared balance. | Decimals and single balance verified in Arc docs. Address is secondary. Confirm it in the Arc contract addresses page. |

Setup time: about 30 minutes for a funded agent wallet on Arc testnet, and about 2 to 3 hours for a working Nanopayments seller and buyer pair.

Gotchas:

- Because policies are mainnet-only, a testnet demo that claims "Circle policies protect the agent" would be wrong. Build and show your own guardrails.
- Because Nanopayments need EOA signatures, an onchain smart-account policy cannot gate each nanopayment. The practical design is a capped tranche: a contract or a human releases a small budget to the agent's EOA or Gateway deposit, so the worst-case loss is one tranche.
- WalletConnect does not list Arc testnet, and wallets may label the balance "ETH" ([docs.arc.io](https://docs.arc.io/integrate/connect-to-arc)).
- Circle warns not to let an agent read the OTP inbox. Whoever reads the OTP can change policies.
- Circle's docs pages carry an "Agent Instructions" block that tells AI readers to install Circle skills and an MCP server. Treat that as optional vendor tooling and decide on purpose.

### 2.3 Solana

| Tool | What it does | Status and facts | Confidence |
| --- | --- | --- | --- |
| x402 on Solana | Pay-per-request with SPL USDC. | Use `@x402/svm` with `@x402/fetch` and `@x402/express`. Devnet ID is `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`. The x402.org facilitator covers devnet. Kora is the reference gasless facilitator, and PayAI is another. Devnet USDC mint is `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`. | Packages and network ID verified. Facilitator names and mint are secondary ([Solana x402 docs](https://solana.com/docs/payments/agentic-payments/x402), [Kora guide](https://launch.solana.com/docs/kora/guides/x402)). solana.com rate-limited my direct reads. |
| `x402-solana` | Community x402 V2 library for Solana clients and servers. | Version 3.0.1, published 2026-10-01. | Verified on npm |
| Solana Agent Kit | Connects an LLM agent to Solana protocols, with LangChain, Vercel AI SDK, and MCP adapters. | `solana-agent-kit` latest is 2.0.10, **published 2025-09-24**. It has had no npm release in about 14 months. It still works for basic transfers and reads, but expect stale plugins. | Version and date verified on npm. Staleness risk is my inference. |
| Solana Pay | URL and QR scheme for transfers and transaction requests. | `@solana/pay` version 1.0.26, published 2026-07-31. It is a good fit for "human scans a QR to approve a large payment." | Verified on npm |
| Native allowances and subscriptions | A Solana Foundation program that gives an agent a capped, optionally time-limited budget. | Reported on mainnet since 2026-06-02. I did not confirm devnet deployment or the SDK. | Secondary, [solanahub.de](https://solanahub.de/en/news/solana-native-subscriptions-allowances/) |
| Payment channels | The agent signs spending vouchers and settlement is batched. It is the program behind x402 `batch-settlement` on Solana. | Page exists at [solana.com/payment-channels](https://solana.com/payment-channels). I could not read it today. | Secondary |
| Solana Agent Registry | Identity, reputation, and validation registries, interoperable with ERC-8004. | Page exists at [solana.com/agent-registry](https://solana.com/agent-registry). Mainnet status unclear. | Secondary |
| Faucets | Devnet SOL and devnet USDC. | `faucet.circle.com` serves testnet USDC. Per-request limits not checked. | Faucet URL verified in Arc docs. Solana devnet option on that faucet is unverified today. |

### 2.4 Bounty tools

| Tool | Facts | Confidence |
| --- | --- | --- |
| Gemini Prediction Markets API | Public market data needs **no API key**. `GET https://api.gemini.com/v1/prediction-markets/events?status=active` lists events with `limit`, `offset`, `category`, `search`. `GET /v1/prediction-markets/events/{ticker}` returns contracts and may include prices and order books. Candles come from `GET /v2/klines`. WebSocket is `wss://ws.gemini.com` with streams such as `{instrumentSymbol}@bookTicker`, `@depth10`, `@trade`. Trading needs a Gemini account, an API key, and accepted prediction-market terms. | Verified, [market data docs](https://developer.gemini.com/prediction-markets/market-data). Trading setup is secondary. |
| Gemini gotchas | Use the returned `instrumentSymbol` exactly. Prices are strings. Depth is in YES space. State eligibility lists conflict across sources. Whether the sandbox supports prediction-market trading is **unverified**. Rate limits were not found. | Gotchas verified. Rest unverified. |
| QuickNode Streams | Datasets: blocks, receipts, traces, logs, and chain-specific sets. Filters are server-side JavaScript or Go functions. Destinations: webhook, S3, PostgreSQL, Azure Blob, Kafka. | Verified, [Streams docs](https://www.quicknode.com/docs/streams) |
| QuickNode chain coverage | The Arc chain page lists Streams for Arc blocks, logs, and traces. The changelog reportedly added Arc testnet. Solana devnet is listed in the REST API table. On free plans, Solana Streams follow the chain tip only, with no backfill. | Arc page verified, [quicknode.com/chains/arc](https://www.quicknode.com/chains/arc). Testnet detail and Solana limits are secondary. Confirm in the dashboard. |
| QuickNode credits | The guide points to a "QuickNode Credits Guide" without a link. | Verified that the link is missing from the guide |
| ElevenLabs Agents | Voice agents with client tools, webhook tools, MCP tools, and system tools. Webhook tools call external APIs. JS SDK `@elevenlabs/client` is at 1.36.1. | Tool types secondary ([tools docs](https://elevenlabs.io/docs/eleven-agents/customization/tools)). Package verified on npm. |
| ElevenLabs coupon | Join the Discord at `https://discord.com/invite/VnBvbbcdEC`, open the coupon-codes channel, start redemption, pick the UBC event, and use the registration email. | Verified in the official guide |
| Grok Bot | A third-party guide describes a persistent agent product launched 2026-08-11, with a desktop app, a shared cloud computer, connectors, MCP servers, scheduled routines, and approval gates. The official guide describes it more loosely as an assistant that runs tasks and automates workflows. The guide does not explain how to export a chat. The Cursor and Grok perk has 250 redemptions and needs an account with no prior subscription. | Product description is secondary ([Composio guide](https://composio.dev/blog/guide-to-frok-bot)). **How to export a chat, and whether a Bot can call a custom HTTP API or MCP server, are unverified.** Ask the organizers. |

### 2.5 Other agent wallets and frameworks

| Tool | Note | Confidence |
| --- | --- | --- |
| Coinbase AgentKit | `@coinbase/agentkit` 0.10.4, last published 2025-12-19. | Verified on npm |
| Privy, Turnkey, Crossmint | Embedded and server wallets with policy engines evaluated in a secure enclave before signing. Comparisons come mostly from vendors. | Secondary, [Crossmint comparison](https://crossmint.com/learn/agent-wallets-compared) |
| `@x402/mcp` | Lets an MCP client pay for paid MCP tools. | Package verified on npm. Behavior not tested. |
| MPP (Stripe and Tempo) | A second HTTP 402 protocol, launched March 2026, with streaming "sessions" on Tempo. It is not a sponsor tool here. | Secondary, [4pillars](https://4pillars.io/en/issues/one-402-two-protocols-x402-and-mpp) |

## 3. Unsolved problems, with evidence

| # | Problem | Evidence |
| --- | --- | --- |
| 1 | **Prompt injection moves money.** The model can be talked into a valid, signed, wrong payment. | In May 2026 attackers used a gifted NFT and a Morse-coded instruction to make an AI agent's wallet send about $150,000 to $200,000 of tokens. No key was stolen and no contract was exploited ([OECD AI incident record](https://oecd.ai/en/incidents/2026-05-04-4a73), [Giskard analysis](https://giskard.ai/knowledge/how-grok-got-prompt-injected-an-x-user-drained-150-000-from-an-ai-wallet)). Zscaler found web pages that push browsing agents into crypto payments ([SecurityWeek](https://www.securityweek.com/prompt-injection-attacks-trick-ai-agents-into-making-crypto-payments/amp/)). |
| 2 | **Spend controls live in the wrong place or miss cases.** | Circle policies are mainnet-only and skip token allowances ([Circle docs](https://developers.circle.com/agent-stack/agent-wallets/wallet-operations/custom-policies.md)). Nanopayments cannot be gated by smart-account rules because they need EOA signatures ([Circle docs](https://developers.circle.com/gateway/nanopayments.md)). Session keys check each transaction alone, so chains of agents can exceed a principal's limit ([Ethernal post](https://tryethernal.com/blog/valid-signature-wrong-intent)). |
| 3 | **Paid but not served, and no refund path.** | x402 has no refund mechanism in the protocol, and a settled stablecoin payment has no chargeback ([Stablecoin Insider](https://stablecoininsider.org/refunds-when-an-agent-initiated-the-payment/)). The x402 attack paper demonstrates paid-but-denied outcomes ([arXiv 2605.11781](https://arxiv.org/abs/2605.11781)). |
| 4 | **Discovery has no quality or trust signal.** | The Bazaar catalog lists over 13,000 resource servers, and the same paper says discovery can steer agents to adversarial servers ([arXiv HTML](https://arxiv.org/html/2605.11781v1)). A developer scan found about 14% of 402 endpoints fail strict V2 compliance ([dev.to](https://dev.to/poteshniy/dont-let-your-ai-agent-pay-blindly-how-to-verify-x402-endpoints-before-spending-usdc-295o)). |
| 5 | **Agent identity and reputation are weak.** | ERC-8004 is still a draft. One analysis found about 15,000 of 165,000 registered agents dead or uncallable by April 2026, and the spec admits Sybil attacks ([arXiv 2606.26028](https://arxiv.org/abs/2606.26028), secondary summary). |
| 6 | **Real demand is small, and agents do not reason about price.** | Visa and Artemis put adjusted x402 volume at about $19M as of April 2026 ([The Defiant](https://thedefiant.io/converge/infrastructure/visa-s-sheffield-pegs-adjusted-x402-volume-at-19m)). TRM Labs classed 89% of dollar volume as wash, test, or internal, and estimated real agent spend at $5,000 to $11,000 per month (secondary, [spotedcrypto summary](https://www.spotedcrypto.com/trm-labs-x402-ai-agent-payments-report-2026/)). Agents today buy because a tool exists, not because the purchase is worth it. |
| 7 | **Key custody.** | Developers still paste private keys into agent environments ([Alchemy](https://www.alchemy.com/overviews/stop-pasting-private-keys-into-cursor)). Circle's own SDK example uses a raw `privateKey` and warns it is for local testing only ([Circle docs](https://developers.circle.com/gateway/nanopayments/howtos/x402-seller.md)). |
| 8 | **Auditability.** | Batched settlement hides individual payments inside one onchain transaction ([Circle docs](https://developers.circle.com/gateway/nanopayments/concepts/batched-settlement.md)). Nothing standard links a payment to the reasoning that caused it. This is my inference from the docs. I found no incident report for it. |
| 9 | **Human approval is clumsy.** | The track asks for "human approval for large transactions." Circle's policies page has no such feature. I found no project that combines an agent wallet with a voice-call approval. |

## 4. Existing solutions

Do not rebuild these. Most entries are vendor claims that I did not test.

| Problem | Already built | How covered |
| --- | --- | --- |
| Spend limits and allowlists | Circle Agent Wallet policies (mainnet). Privy, Turnkey, Crossmint policy engines. PolicyLayer ([policylayer.com](https://policylayer.com/blog/securing-x402-protocol-agent-spending-controls)). On Solana: the native allowances program, AgentGuard Protocol, Cloaked (both open source, secondary). Virtuals wallet policies with kill switches ([Crypto Briefing](https://cryptobriefing.com/virtuals-protocol-agent-wallet-prompt-injection/)). | **Well covered.** A plain budget-and-allowlist wrapper will not look new. |
| Payment firewalls against injection | TollWarden and wormhole-x402 (npm packages that check a payment against the quote), Pipelock (open-source egress firewall), NVIDIA NemoClaw x402 payment gate recipe, IntentGuard (hackathon project). All secondary. | **Partly covered** on Base. Little on Arc with Nanopayments. None with a voice approval step. |
| Refunds and disputes | x402r, x402resolve (Solana, oracle-scored refunds), Pact Network (automatic SLA refunds), a Circle refund protocol arbiter. All secondary ([Product Hunt x402r](https://www.producthunt.com/products/x402r-refund-protocol), [HackQuest Pact](https://hackquest.io/en/projects/Pact-Network-JRZrcA)). | **Crowded.** The hard part, deciding what counts as failed service, is still open. |
| Discovery | x402 Bazaar, Circle Agent Marketplace, third-party discovery MCP servers and endpoint graders. | **Catalogs are covered.** Trust and quality ranking are thin. |
| Identity and reputation | ERC-8004 registries on several EVM chains, Solana Agent Registry. | **Standards exist, adoption is thin.** Too big for five days. |
| Micropayment economics | Circle Nanopayments, x402 `batch-settlement`, Solana payment channels, MPP sessions. | **Covered.** Use them. |
| Custody | Circle MPC agent wallets, Privy, Turnkey. | **Covered.** Use them. |
| Prediction-market agents that pay for data | BlockRun Polymarket agent ([GitHub](https://github.com/BlockRunAI/polymarket-agent)), OilShock Arbitrageur, AgentBet, Predict Oracle. All secondary. | **Several exist on other venues.** I found none on Gemini's API, and none that gate purchases on expected value. |
| Voice approval for agent payments | Bridge ACE gates phone calls with human approval. ElevenLabs has a Stripe integration. | **Not covered** for agent wallets. |

Prior winners in this category, for calibration:

- ETHGlobal Cannes, Arc tracks: NanoCrawl (agents pay publishers per page), VEIL VPN (pay-per-use VPN with attested no-logs), PayMate (credit pool with four agents paying each other), C.E.S.T.A Agent (voice-first group travel funds), Onda (one-cent artist micropayments) ([arc.io blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned)).
- SF Agentic Commerce x402 Hackathon, February 2026: RequestTap, an open-source x402 router, won Best Agentic App ([SKALE recap](https://skale.space/blog/san-francisco-agentic-commerce-x402-hackathon-recap-winners)).

The pattern: winners attach payments to a concrete user and purpose. Pure infrastructure wins less often.

## 5. Gaps, opportunities, and project ideas

### 5.1 Where the gaps are

1. No good tool makes an agent justify a purchase before it pays. Budgets cap the damage, but they do not make spending sensible.
2. Guardrails for Nanopayments on Arc testnet do not exist out of the box, because Circle policies are mainnet-only and smart-account rules cannot gate EOA signatures.
3. Human approval for large payments has no good experience. A voice call is natural and nobody has shipped it for agent wallets.
4. Batched payments lack an independent audit trail that ties each payment to a reason.
5. No prediction-market agent is built on the Gemini API with paid data.

### 5.2 Chain choice

| Factor | Arc | Solana |
| --- | --- | --- |
| Award | $1,000 | $1,500 |
| Fit with recommended Circle tools | Full: Agent Wallets, Nanopayments, Gateway, keyless facilitator | None: Agent Wallets and Nanopayments do not support Solana |
| x402 on testnet | Through Circle Gateway facilitator | Through x402.org facilitator on devnet |
| Agent toolkit | Circle CLI, viem, Foundry | Solana Agent Kit, stale since September 2025 |
| Onchain code | Solidity with Foundry, fast to write | Anchor, slower if the team is new to Rust |
| Likely field | Smaller, in my estimate. Unverified. | Larger, in my estimate. Unverified. |

I recommend Arc for this track unless the team already writes Anchor comfortably. The $500 difference is smaller than the risk of a weaker build.

### 5.3 Project ideas

#### Idea 1 (top pick): a prediction-market research agent that pays only for information worth buying

- **Problem.** Agents buy data because a tool is available. Nobody can tell whether a payment was worth it, and one injected instruction can redirect the money.
- **User.** A prediction-market trader who wants an agent to research markets around the clock without handing it an open wallet.
- **How it works.** The agent reads live Gemini prediction markets. For a market it is unsure about, it sees a menu of paid signals served over x402 (the team runs two or three small seller endpoints, for example a news digest, an odds-history analysis, and a base-rate lookup). Before each purchase it estimates how much the signal could move its forecast and what that is worth at the current price and position size. It buys only when that value exceeds the price. Each purchase is a Nanopayment on Arc testnet. A policy guard outside the model checks every payment: budget, seller allowlist, price equals the quoted price. Anything above a threshold, or anything off the allowlist, triggers an ElevenLabs voice call where the owner hears the request and says yes or no. Budget is released to the agent's EOA in small tranches from a Foundry contract on Arc, so the worst-case loss is one tranche. A QuickNode Stream on Arc testnet watches the tranche contract and USDC transfers, and writes an independent ledger that the dashboard compares with the agent's own log. Trades are paper trades by default.
- **Core demo moment.** On screen the agent reasons: "This signal costs $0.004. Expected value is $0.03. Buy." The forecast updates. Then a paid response contains a hidden instruction to send 50 USDC to an unknown address. The guard blocks it, a phone rings, a voice explains the request, and the owner says "deny."
- **Stack.** Arc testnet, `@circle-fin/x402-batching`, `@x402/express`, Circle CLI agent wallet or a viem EOA, a Foundry tranche-and-allowlist contract, Gemini market data REST and WebSocket, ElevenLabs Agents with a webhook tool, QuickNode Streams to a webhook, a Next.js dashboard.
- **Prize stack.** Track ($2,000) + Best use of Arc ($1,000) + Gemini (up to $2,500) + QuickNode ($500) + ElevenLabs perk + Official Winner place. Grok Bot is optional and only if a Bot can do real work, for example a scheduled routine that reviews the audit ledger.
- **Feasibility.** High for the core (agent, sellers, guard, dashboard). Medium for all four integrations. Suggested order: day 1 Nanopayments seller and buyer on Arc testnet plus Gemini data; day 2 decision loop and guard; day 3 tranche contract and QuickNode Stream; day 4 voice approval and dashboard; day 5 video, README, buffer. Cut the Stream or the voice call first if time runs short.
- **Risks.** Too many integrations. The value-of-information estimate may look hand-waved, so keep the formula simple and show it. Gemini judges may prefer real trading, and trading needs an eligible account. Settlement lag may make the live demo slow, so show the signed authorization at once and the settlement after.
- **Scoring.** Technical Execution: real onchain contract, real Nanopayments, a Stream, a guard outside the model. Product and UX: one user, one dashboard, approval by voice. Innovation: purchases gated on expected value, plus voice approval, which I did not find elsewhere. Impact: answers the main criticism of agent payments, that spending is neither safe nor justified. Demo: the blocked injection and the phone call are easy to remember.

#### Idea 2: the same guarded agent on Solana, with Solana Pay as the approval step

- **Problem and user.** Same as idea 1, or any agent that buys APIs.
- **How it works.** The agent pays x402 endpoints with devnet USDC through `@x402/svm`. An Anchor program holds the budget and enforces per-payment cap, daily cap, and a seller allowlist. A large payment produces a Solana Pay transaction request. The owner scans the QR with a phone wallet to co-sign.
- **Core demo moment.** A QR appears on screen for a large payment, and the owner approves it from a phone in two seconds.
- **Stack.** Anchor, `@x402/svm`, `@x402/express`, `@solana/pay`, x402.org devnet facilitator, QuickNode Streams on Solana devnet.
- **Prize stack.** Track + Best use of Solana ($1,500) + QuickNode + optional Gemini and ElevenLabs.
- **Feasibility.** Medium. The Anchor program and the facilitator pairing on devnet are the slow parts.
- **Risks.** AgentGuard and Cloaked already do onchain agent limits on Solana, and the native allowances program exists. No Circle Nanopayments. Solana Agent Kit is stale.
- **Scoring.** Strong on Technical Execution and Solana fit. Weaker on Innovation because of the prior art.

#### Idea 3: a payment firewall with voice escalation, with no vertical

- **Problem.** Prompt injection drains agent wallets. **User.** Developers who give agents a wallet.
- **How it works.** A proxy or MCP server that every payment passes through. It binds each payment to the quoted price and the stated task, enforces budgets and allowlists, and calls the owner by voice for exceptions. It ships with a red-team page that fires known injection attacks at a protected and an unprotected agent.
- **Core demo moment.** Two agents side by side receive the same attack. One loses its funds and the other's owner gets a call.
- **Stack.** Arc testnet, Nanopayments, Foundry tranche contract, ElevenLabs, QuickNode Streams.
- **Prize stack.** Track + Arc + ElevenLabs + QuickNode. No Gemini.
- **Feasibility.** High.
- **Risks.** TollWarden, wormhole-x402, PolicyLayer, and Circle's mainnet policies are close. It is infrastructure without a user story, which wins less often.
- **Scoring.** Strong Demo and Technical Execution. Middle on Innovation and Impact.

#### Idea 4: receipts and automatic refunds for paid-but-failed calls

- **Problem.** An agent pays and gets an error, junk, or nothing. **User.** Agent builders and API sellers who want to prove reliability.
- **How it works.** Payment goes into a short escrow. The seller returns a signed receipt with a response hash. A verifier checks status, schema, and latency. The contract releases or refunds without a human.
- **Core demo moment.** A seller is switched to fail, and the refund lands on the dashboard seconds later.
- **Stack.** Anchor on Solana or Foundry on Arc, x402 `exact`, QuickNode Streams for events.
- **Prize stack.** Track + one chain award + QuickNode.
- **Feasibility.** Medium.
- **Risks.** x402r, x402resolve, and Pact Network already exist. Escrow per call fights the micropayment economics. Who judges quality remains unsolved.
- **Scoring.** Solid Technical Execution. Low Innovation.

#### Idea 5: a marketplace where agents pay only for endpoints that pass live probes

- **Problem.** Catalogs list endpoints with no quality signal. **User.** Agents choosing among sellers.
- **How it works.** A registry where each listing posts a small USDC bond. A prober buys from each endpoint on a schedule and records price, latency, and correctness onchain. Agents query by measured quality. Bad sellers lose their bond.
- **Core demo moment.** A seller starts returning junk, its score drops, and the agent switches seller on the next call.
- **Stack.** Arc or Solana registry contract, x402, a prober service, QuickNode Streams for a live leaderboard.
- **Prize stack.** Track + one chain award + QuickNode.
- **Feasibility.** Medium.
- **Risks.** A marketplace with three fake sellers looks empty. Bazaar, Circle Agent Marketplace, and endpoint graders are adjacent.
- **Scoring.** Middle on everything. Weak Demo unless the failover is staged well.

#### Idea 6: an audit recorder for agent payments

- **Problem.** Batched payments are hard to audit. **User.** Finance or compliance staff at a company that runs agents.
- **How it works.** Each payment carries a hash of the agent's reasoning. A QuickNode Stream reconciles onchain settlement with the agent's log and flags any mismatch.
- **Prize stack.** Track + one chain award + QuickNode.
- **Feasibility.** High.
- **Risks.** It is a feature, not a product. It is better as part of idea 1 or 3.
- **Scoring.** Good QuickNode bounty fit. Weak alone on Innovation and Demo.

### 5.4 Ranking

| Rank | Idea | Prize ceiling in cash | 5-day feasibility | Novelty against prior art | Demo strength |
| --- | --- | --- | --- | --- | --- |
| 1 | Prediction-market research agent with value-gated purchases (Arc) | $6,000 plus Official Winner | Medium to high | High | High |
| 2 | Guarded agent on Solana with Solana Pay approval | $4,000 plus Official Winner, more with Gemini | Medium | Medium | High |
| 3 | Payment firewall with voice escalation | $3,500 plus Official Winner | High | Medium | High |
| 4 | Receipts and automatic refunds | $4,000 with Solana | Medium | Low | Medium |
| 5 | Probe-verified marketplace | $4,000 with Solana | Medium | Medium | Low to medium |
| 6 | Audit recorder | $4,000 with Solana | High | Low | Low |

**Top pick: idea 1.** It meets both track requirements directly, covers three of the four track objectives, uses the recommended Circle tools on the chain where they work, and adds the largest bounty and an extra finalist path. Idea 3 is its core without the vertical, so the team can fall back to idea 3 if the Gemini part slips.

## 6. Questions to settle at office hours

| Sponsor | When | Question |
| --- | --- | --- |
| Circle | Mon Nov 16 or Wed Nov 18, 6:00 PM | Do Agent Wallet policies really not apply on Arc testnet? Is the keyless Facilitator Service for the `exact` scheme live on Arc testnet, and what is its URL? How often do Nanopayment batches settle on testnet? What is the canonical USDC address on Arc testnet? |
| Solana | Mon, Wed, or Thu | Is the allowances program deployed on devnet? Which devnet x402 facilitator do they recommend? |
| Gemini | Mon, Tue, or Thu, 7:00 PM | Does the bounty favor trading over market data? Does the sandbox support prediction-market orders? What are the rate limits? Is paper trading acceptable? |
| QuickNode | Wed Nov 18, 7:00 PM | Are Streams on Arc testnet available on the hackathon credits? Is backfill included? Where is the credits guide? |
| Organizers | Telegram | What exactly counts as "Grok Bot," how is a chat exported, and where is the Cursor and Grok referral link? |

## 7. What I could not verify

- The Circle x402 Facilitator Service docs, endpoints, and keyless Arc testnet claim. Only news coverage was found.
- The Arc testnet USDC contract address, from the official Arc page.
- Solana's x402 facilitator URL, the devnet USDC mint, the payment-channels page, and the allowances program on devnet. solana.com returned rate-limit errors.
- Whether Gemini's sandbox supports prediction-market trading, the rate limits, and the current list of eligible states.
- Whether QuickNode Streams on Arc testnet and backfill are included in the free tier or hackathon credits.
- What Grok Bot can call (custom HTTP or MCP), how to export a chat, and how the product in the guide maps to the product in third-party reviews.
- ElevenLabs free-tier agent minutes.
- Whether the x402 SDK attacks from arXiv 2605.11781 are fixed in version 2.31.0.
- The size of the field for each chain award. My estimate that Arc is less crowded is a guess.
- Every prior-art project marked secondary. I read listings and summaries, not the code.
