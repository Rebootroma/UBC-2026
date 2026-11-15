# Research 02: DeFi and Onchain Applications track

Scope: the DeFi and Onchain Applications main track, how it stacks with the Solana and Arc chain awards, and the Gemini Prediction Markets and QuickNode Streams bounties. Researched on 2026-11-15 against live docs and live endpoints. Requirements come from `HACKATHON.md`.

Verification labels used below:

- **Probed** means I called the endpoint myself on 2026-11-15 and saw the stated result.
- **Docs** means the claim comes from an official doc page that I fetched.
- **Secondary** means it comes from press, blogs, or search summaries and was not confirmed at the source.
- **Unverified** means I could not confirm it. Section 7 lists every such item.

## 0. Bottom line

1. The Gemini Prediction Markets API is public, live, and needs no key for market data. REST, the public WebSocket, and the sandbox all answered my probes. It lists strike ladders for BTC, ETH, SOL, XRP, and ZEC ("SOL price on November 30", 12 strikes), which together form a market-implied price distribution. Nobody appears to use that distribution for DeFi risk.
2. The largest stack available to one project is DeFi track ($2,000) + Best use of Solana ($1,500) + Gemini bounty (up to $2,500) + QuickNode Streams ($500) + Official Winner (up to $2,500), a ceiling of $9,000. The Arc route caps $500 lower and has weaker oracle and DeFi building blocks on testnet.
3. Gemini's markets are offchain (a CFTC-regulated central exchange). The DeFi track requires smart-contract interaction. Every viable idea therefore needs a real onchain half, and the bridge between Gemini data and that onchain half is where the innovation lives.

**Top pick: a liquidation-odds guard on Solana.** It turns Gemini price-ladder contracts into a market-implied probability that a user's leveraged position gets liquidated, posts that probability onchain, lets an Anchor program act on it automatically, and offers a one-click binary hedge on Gemini. Details are in section 6.

## 1. Requirements restated

### 1.1 DeFi and Onchain Applications track ($2,000)

| Item | What it demands |
| --- | --- |
| Hard requirement | Interact with smart contracts on any chain. Deploying your own is optional. |
| Hard requirement | README explains the economic design and the risk assumptions. |
| Hard requirement | README includes the address of every program or contract deployed or used. |
| Objective | New DeFi primitive, or a meaningful improvement in capital efficiency, risk management, or liquidity. |
| Objective | Compose with existing protocols rather than rebuild them. |
| Objective | Make DeFi safer and more accessible: risk dashboards, simpler UX, onboarding. |
| Objective | Cross-chain flows, for example USDC over CCTP. |

A UBC representative picks the Track Winner. Devnet or testnet is acceptable.

### 1.2 Stackable awards

| Award | Hard requirements | Who judges | What they will likely reward |
| --- | --- | --- | --- |
| Best use of Solana, $1,500 | Core onchain functionality on Solana (devnet fine). Program IDs in the README. README explains how Solana is used. | Solana representative | Anchor or native Rust, SPL or Token Extensions, integration with existing Solana protocols, a smooth wallet flow, and a design that needs Solana's speed and low fees. |
| Best use of Arc, $1,000 | Core onchain functionality on Arc (testnet fine). Contract addresses in the README. README explains how Arc is used. | Arc (Circle) representative | Payment, treasury, or FX apps, USDC as gas, Foundry or Hardhat, and Circle tools (Wallets, CCTP, Gateway, Paymaster). |
| Gemini Prediction Markets, $2,500 / $1,000 / $500 | Use the Gemini Prediction Markets API (market data and/or trading). Must also be a valid main-track submission. | Gemini plus a UBC representative | Odds-over-time analytics, trading tools or bots, prediction data inside other apps (the brief names "onchain"), and better discovery. The first-place team also gets a finalist pitch slot. |
| QuickNode Streams, $500 | Streams is a core data source. At least one Stream with a filter and a destination (webhook or database). README explains network, dataset, filter logic, destination, and why. | QuickNode plus a UBC representative | A filter that does real work, a live reaction to onchain events, and an automated action triggered by the Stream. |

Solana and Arc cannot both be claimed. Every prize requires the team to attend in person on Nov 21.

### 1.3 Reading the judging criteria for this track

- **Technical Execution** rewards a working onchain program plus working sponsor integrations. A dashboard that only reads an API will score low here.
- **Product & UX** rewards one clear user and one clear problem. Retail risk tools fit the "safer and more accessible" objective directly.
- **Innovation** is the hardest criterion in DeFi, because most primitives exist. Using prediction-market odds as a DeFi risk input is still open ground (section 4).
- **Impact & Potential** rewards a believable path to real users. Liquidations are a large, documented pain (section 3).
- **Demo** rewards one visible cause-and-effect moment inside a 2–3 minute video and a 5-minute pitch.

## 2. Tools and resources available now

### 2.1 Gemini Prediction Markets API

Gemini Titan is a CFTC Designated Contract Market. Contracts are USD-collateralized and centrally cleared, so nothing settles onchain. Source: https://www.gemini.com/blog/gemini-receives-us-license-for-prediction-markets

| Topic | Finding | Status |
| --- | --- | --- |
| Docs hub | https://developer.gemini.com/products/prediction-markets | Docs |
| Production base URL | `https://api.gemini.com` | Probed |
| Sandbox base URL | `https://api.sandbox.gemini.com`, separate account from https://exchange.sandbox.gemini.com/ | Probed (public events returned, 96 active) |
| List events | `GET /v1/prediction-markets/events?status=active&category=...&limit=...&offset=...&search=...` returns `data` and `pagination.total`. No key needed. | Probed |
| One event | `GET /v1/prediction-markets/events/{ticker}` | Probed |
| Other discovery | `/v1/prediction-markets/categories`, `/events/newly-listed`, `/events/recently-settled`, `/events/upcoming` | Probed (HTTP 200) |
| Daily volume | `GET /v1/prediction-markets/volume/{YYYY-MM-DD}` and `.../hourly`. Completed UTC days only, from 2025-12-15. Source: https://developer.gemini.com/rest-api/prediction-markets/volume/get-volume | Probed |
| Reference price candles | `GET /v2/klines?agency=lukka&index=LS-LRRR-XBTUSD&interval=1hr&startTime=..&endTime=..`. `startTime` and `endTime` are required (HTTP 400 without them). Indices exist for BTC, ETH, SOL, XRP, HYPE, ZEC. Source: https://developer.gemini.com/prediction-markets/market-data | Probed |
| Public WebSocket | `wss://ws.gemini.com`. A subscribe message `{"id":"1","method":"subscribe","params":["<instrumentSymbol>@bookTicker"]}` worked with no key. Streams: `@bookTicker`, `@depth5/10/20`, `@depth`, `@trade`. Server drops the socket after 60 s without a pong. | Probed |
| Trading | `POST /v1/prediction-markets/order` with `symbol`, `orderType: limit`, `side`, `outcome: yes/no`, `quantity`, `price` (0–1), `timeInForce`. Also `/orders/active`, `/orders/history`, positions, and `terms/accept`. Source: https://developer.gemini.com/prediction-markets/trading-quickstart | Docs |
| Auth | API key with the `Trader` role. Payload goes base64-encoded in `X-GEMINI-PAYLOAD`, signed, with an empty body. Terms must be accepted first via `POST /v1/prediction-markets/terms/accept`. | Docs |
| Rate limits | Public REST 120 requests/minute (1/s recommended). Private REST 600/minute (5/s recommended). HTTP 429 above that. Source: https://developer.gemini.com/rate-limit | Docs |
| SDK | `@gemini-markets/sdk` on npm, latest 0.1.1 (2026-09-25), with `/server` and `/browser` entry points. Source: https://developer.gemini.com/tools | Probed on the npm registry |
| MCP server, CLI, Go SDK | Public repo https://github.com/gemini/developer-platform, pushed 2026-11-12, with `mcp-server`, `gemini-markets-cli`, `sdk-go`, `sdk-typescript` packages. | Probed |
| Fees | Maker fee is $0.00 from 2026-09-02 through 2026-12-31. Source: https://developer.gemini.com/prediction-markets/maker-fee-free-trading-promo. Taker fee not found. | Docs / Unverified |

What the market data looks like (probed 2026-11-15):

- Categories: Sports, Crypto, Commodities, Economics, Politics, Weather, Tech, Culture, and others.
- Active event counts: Sports 912, Crypto 98, Weather 98, Politics 21, Commodities 18, Economics 11, Tech 3.
- Each contract carries `instrumentSymbol`, `prices.bestBid`, `prices.bestAsk`, `prices.lastTradePrice`, `priceIncrement` 0.01, and `quantityMinimum` 0.01. Events carry `volume`, `volume24h`, and `volumeDelta24hPct`.
- Crypto templates: `crypto-up-down` (5-minute and 15-minute BTC, ETH, SOL, XRP) and `prices-ladder`. Ladders exist hourly (8 strikes) and to month-end: "BTC price on November 30" (12 strikes), ETH (8), SOL (12), XRP (9), ZEC (62).
- Volume on 2026-11-14: Sports $1,665,644, Crypto $198,848, Weather $888, Politics $718, Commodities $291, Economics $266.

Gotchas:

- **Liquidity outside sports is thin.** The SOL month-end ladder traded about $1,044 in 24 hours. Many weather and economics events showed zero. Treat the odds as a signal and size any hedge small.
- **No REST history of contract prices.** `/v2/klines` covers the reference index only. To chart odds over time, the team must start recording `@bookTicker` or polling on day one. Five days of self-collected history is all the demo will have.
- **Responses are large.** One 100-event page exceeded 400 KB and contained characters that broke a strict JSON parser. Page at 50 and parse leniently.
- **Use `instrumentSymbol` exactly as returned.** The docs say not to construct it.
- **Trading on production needs a verified, funded US account.** State availability is disputed: New York sued in April 2026 and Connecticut ordered sports contracts stopped (Secondary: https://www.covers.com/industry/new-york-ag-sues-coinbase-gemini-titan-event-contracts-april-21-2026). Texas status is unverified.
- **Sandbox trading of prediction markets is unverified.** The sandbox serves prediction events and gives new accounts $100,000 in test USD (https://developer.gemini.com/get-started/sandbox), but the docs say to confirm product support. Ask Gemini at office hours on Monday.

Setup time: 15 minutes for market data, 1–2 hours for signed sandbox trading.

### 2.2 QuickNode Streams

| Topic | Finding | Source |
| --- | --- | --- |
| What it is | Push pipeline: chain data runs through a server-side filter, then goes to a destination. | https://www.quicknode.com/docs/streams |
| Solana networks | Mainnet, Devnet, Testnet. Datasets: Block, and Programs + Logs. | https://www.quicknode.com/docs/streams/supported-chains |
| Arc networks | Mainnet and Testnet, with the full EVM dataset list (Block, Transactions, Logs, Receipts, traces). | Same page |
| Filters | JavaScript `function main(stream)` reading `stream.data` and `stream.metadata`, or Go `Filter`. No network, no imports. Return `null` to skip a block. `decodeEVMReceipts(receipts, [abi])` decodes EVM logs. A key-value store is available through `qnLib.*`. | https://www.quicknode.com/docs/streams/filters |
| Destinations | Webhook, S3, PostgreSQL, Azure Blob, Kafka. | https://www.quicknode.com/docs/streams |
| Free trial | 1 month, 10M API credits, 15 requests/second, 1 active stream (1 Solana stream), 1 webhook. | https://www.quicknode.com/pricing.md |
| Build plan | $49/month, 80M credits, 10 streams (5 Solana). | Same page |
| Backfill | Paid plans only for Solana. Free trial streams follow the chain tip. | https://www.quicknode.com/guides/quicknode-products/streams/how-to-stream-solana-program-data |

Gotchas:

- **One stream on the free trial.** Design for a single stream, or redeem the sponsor credits listed at the end of the official guide.
- **Credits burn per block processed, even when the filter returns null** (billing docs: https://www.quicknode.com/docs/streams/billing). A Solana guide says billing follows data delivered. The two pages disagree, so pause the stream when nobody is testing. The Solana credit multiplier is unverified.
- **The Solana sample filter only inspects top-level instructions.** Calls made through CPI need inner-instruction or log matching.
- **The webhook needs a public URL.** Use a deployed endpoint or a tunnel.
- Streams is near real time, not lowest latency. That is fine for a demo.

Setup time: 1–2 hours to a first filtered webhook.

### 2.3 Solana building blocks

| Tool | What it gives | Devnet | Notes |
| --- | --- | --- | --- |
| Anchor | Program framework, IDL, TypeScript client. https://www.anchor-lang.com/ | Yes (probed `api.devnet.solana.com`, healthy) | The Solana award explicitly names Anchor or native Rust. |
| SPL Token and Token Extensions | Fungible tokens, transfer hooks, non-transferable receipts. https://solana.com/docs | Yes | A hedge receipt or vault share as a Token-2022 mint is cheap credibility for the Solana award. |
| Pyth pull oracle | `pyth-solana-receiver-sdk` (Rust) and `@pythnetwork/pyth-solana-receiver` (JS). | Reported as deployed on devnet (Secondary) | Use the receiver SDK, not the old `pyth-sdk-solana`: https://dev-forum.pyth.network/t/using-supported-price-feed-on-devnet/331 |
| Circle USDC | Devnet USDC from https://faucet.circle.com | Yes | Circle Gateway has a Solana Devnet quickstart: https://developers.circle.com/gateway/quickstarts/unified-balance-solana |
| DFlow prediction markets API | Kalshi positions minted as SPL tokens on Solana. https://pond.dflow.net/prediction-markets/introduction | Mainnet (devnet unverified) | Proves tokenized event positions exist on Solana. It is Kalshi, not Gemini, so it does not count for the Gemini bounty. |
| Kamino, Jupiter, Drift, marginfi | Lending, swaps, perps. | Unverified, and I expect mostly mainnet-only | Plan to read mainnet positions read-only and deploy the team's own program on devnet. Do not plan to write to these protocols on devnet. |
| Switchboard On-Demand | Custom oracle feeds. | Unverified | A fallback if the team wants a decentralized feed for the odds. |

### 2.4 Arc and Circle

| Topic | Finding | Status |
| --- | --- | --- |
| Arc testnet | Chain ID 5042002, RPC `https://rpc.testnet.arc.io`, explorer https://explorer.testnet.arc.io. Source: https://docs.arc.io/integrate/connect-to-arc | Probed (`eth_chainId` returned `0x4cef52`, blocks advancing) |
| Arc mainnet | Chain ID 5042, RPC `https://rpc.mainnet.arc.io`. Reported live since 2026-09-16. | Docs for IDs, Secondary for the date |
| Gas | USDC is the native gas token with 18 decimals as gas. The ERC-20 view at `0x3600000000000000000000000000000000000000` has 6 decimals. Both are one balance. | Docs |
| Faucet | https://faucet.circle.com gives testnet USDC and EURC. | Docs |
| Tooling | Foundry, Hardhat, viem (`arcTestnet` in `viem/chains`), Circle Wallets identifier `ARC-TESTNET`. | Docs |
| Testnet addresses | EURC `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`, CCTP TokenMessengerV2 `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` (domain 26), GatewayWallet `0x0077777d7EBA4688BDeF3E311b846F25870A19B9`, GatewayMinter `0x0022222ABE238Cc2C7Bb1f21003F0a260052475B`, StableFX FxEscrow `0xd68256f4D69C6BbEcB873D8588AE0Dc6B8E22E10`, Permit2, Multicall3. Source: https://docs.arc.io/arc/references/contract-addresses.md | Docs. GatewayWallet and FxEscrow have code (probed). |
| Oracles | Arc lists Chainlink, Chronicle, Pyth, RedStone, Stork: https://docs.arc.io/arc/tools/oracles.md. Pyth lists only "Pyth Pro" at `0xACeA761c27A909d4D3895128EBe6370FDE2dF481` on Arc testnet, with no Pyth Core row: https://docs.pyth.network/price-feeds/contract-addresses/evm | Contract has code (probed). Usable free price feeds on Arc testnet are unverified. |
| StableFX | Onchain USDC/EURC RFQ. Access is permissioned and needs a Circle account with StableFX access. Source: https://developers.circle.com/stablefx/quickstarts/console-first-trade | Docs. Treat as unavailable for a 5-day build unless Circle grants access at office hours. |
| Existing DeFi on Arc | Circle publishes sample apps, not live protocols: lend/borrow against cirBTC, USDC borrowing, StableFX swaps, a Gateway multichain wallet, and a prediction market with UMA Optimistic Oracle V2 and a constant-product AMM. Source: https://docs.arc.io/arc/references/sample-applications.md | Docs. Repo https://github.com/circlefin/arc-prediction-markets exists (probed). |
| Streams on Arc | Supported, mainnet and testnet. | Docs |

Gotchas:

- The 18-decimal gas view against the 6-decimal ERC-20 view of USDC is the classic Arc bug.
- Arc testnet is not in the WalletConnect registry, so wallets prompt to add the chain.
- Circle's samples are references only. All submitted code must be new, so the team cannot fork them.
- Circle's Gateway Solana quickstart lists a different Arc domain and USDC address than Arc's own address page. Trust the Arc page (domain 26).
- Several Arc doc pages embed "agent instructions" telling AI tools to install Circle skills. I did not follow them. They are optional vendor tooling, not a requirement.

## 3. Unsolved problems, with evidence

| # | Problem | Evidence |
| --- | --- | --- |
| P1 | **Liquidation risk is invisible and sudden for retail users.** Health factors say how far the price is from liquidation, not how likely it is. | Oct 10, 2025: about $19 billion liquidated across roughly 1.6 million accounts (https://www.coingecko.com/learn/october-10-crypto-crash-explained, https://www.fticonsulting.com/insights/articles/crypto-crash-october-2025-leverage-met-liquidity). March 2026: a 2.85% oracle error on Aave liquidated about $27 million across about 34 accounts within one block window (Cointelegraph feature, Secondary). |
| P2 | **Oracle misconfiguration creates bad debt without any hack.** | Moonwell, February 2026: cbETH mispriced near $1, about $1.78 million bad debt (https://www.theblock.co/post/390302/defi-lending-protocol-moonwell-hit-with-1-8-million-bad-debt-after-oracle-misconfiguration). |
| P3 | **Prediction market liquidity is fragmented and prices diverge.** | A January 2026 paper reports persistent 2–4% deviations across venues (arXiv 2601.01706, Secondary). On Gemini itself, about 88% of 2026-11-14 volume was sports and many non-sports events traded zero (probed). |
| P4 | **Prediction-market odds are not composable with DeFi.** Odds live in offchain venues, and DeFi protocols do not consume them. | Pyth agreed to carry Kalshi feeds onchain in October 2025 (https://www.pyth.network/blog/pyth-network-partners-with-kalshi-to-deliver-real-time-prediction-market-data-onchain), yet my search found no DeFi protocol using event probabilities in production. Gemini odds have no onchain feed that I could find. |
| P5 | **Hedging real risks with event contracts is possible but impractical for normal people.** | Small businesses already hedge weather on Kalshi (https://www.businessinsurance.com/prediction-markets-gain-role-in-risk-transfer/). Galaxy stresses remaining basis and liquidity risk (https://www.galaxy.com/insights/perspectives/risk-managing-prediction-markets). No tool maps "my exposure" to "these contracts, this size". |
| P6 | **Capital locked in prediction positions is idle.** | Gondor raised funds to lend against Polymarket portfolios (https://www.theblock.co/post/408129/gondor-v1-let-users-borrow-against-entire-polymarket-portfolio). Messari and Blockworks both published on leverage in prediction markets. |
| P7 | **Non-USD stablecoin FX is shallow.** | Non-USD stablecoin supply was about $1.2 billion in February 2026, roughly 80% euro, and DeFi depth is mostly EURC (Dune and Visa report, https://dune.com/stablecoin-report). |
| P8 | **Cross-chain USDC is operationally fragmented.** | Circle built Gateway specifically to unify balances across chains (https://developers.circle.com/gateway/howtos/create-unified-usdc-balance), which is itself evidence of the pain. |

## 4. Existing solutions, and what is already covered

| Problem | Who already built it | Verdict |
| --- | --- | --- |
| P1 risk dashboards | DeFi Saver, protocol-native health factors, liquidation alert bots, DefiLlama. | Health-factor dashboards and alerts are well covered. A **probability** of liquidation taken from traded markets is not. |
| P1 automation | DeFi Saver automation, protocol stop-loss features. | Triggered by price thresholds. None triggers on market-implied odds. |
| P2 oracle monitoring | Chaos Labs, Gauntlet, LlamaRisk. | Institutional and protocol-facing. Hard to out-build in 5 days. Skip. |
| P3 cross-venue terminals | Kairos, Verso, Vezta, Predictu, Stand, Converge, PodComet, a Kalshi pro terminal (https://blocmates.com/articles/30-prediction-market-tools-analytics-bots-terminals-and-platforms). | Crowded for Polymarket and Kalshi. None of the listed tools names Gemini, though I did not confirm that for each one. |
| P4 odds onchain | Pyth and Kalshi feeds, DFlow tokenized Kalshi positions on Solana, Polymarket onchain natively. | Infrastructure exists for Kalshi and Polymarket. Nothing for Gemini, and few consumers of the odds. |
| P5 hedging tools | Venue UIs only. | Open. No "exposure in, hedge out" product found. |
| P6 lending on positions | Gondor, Sonder, Positions Finance, PredMart, ylop, Lattica (all Polymarket). Colosseum Frontier winners Senthos and Bench cover structured prediction exposure (https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/). | Covered, and impossible on Gemini anyway because Gemini positions are custodial and not tokenized. Do not build. |
| P7 stablecoin FX | Circle StableFX, App Kit Swap, Circle's `arc-stablecoin-fx` sample. | Circle already ships the reference app. A hackathon clone adds little. |
| P8 cross-chain USDC | CCTP, Gateway, Bridge Kit, Circle's `multichain-wallet` and `fintech-starter` samples. | Covered by Circle's own samples. Useful as a feature, weak as a whole project. |
| Onchain prediction market itself | Polymarket, Circle's Arc sample, many hackathon entries. | Do not build another market. It also would not use the Gemini API. |

## 5. Gaps worth building into

1. **Gemini price ladders as a risk oracle.** The ladders give a traded probability that an asset finishes above each strike. No DeFi tool reads them.
2. **Binary contracts as liquidation insurance.** A "NO" on "SOL at or above $X" pays $1 when SOL finishes below $X. That payoff shape matches a liquidation loss far better than a stop-loss does.
3. **Gemini odds onchain.** There is no Gemini feed on Solana or Arc. A small attested oracle program fills that and gives the Gemini judges the "onchain" objective.
4. **Odds-triggered automation.** Onchain actions that fire when a probability crosses a line, with QuickNode Streams as the trigger path.
5. **Exposure-to-hedge translation.** Plain-language exposure in, contract list and size out.

## 6. Project ideas, ranked

### Rank 1 (top pick): Liquidation-odds guard on Solana

- **Problem:** A borrower sees a health factor, not a probability, and has no cheap way to insure against being liquidated (P1, P4, P5).
- **User:** A retail borrower with a leveraged SOL, BTC, or ETH position.
- **How it works:**
  1. A service reads Gemini ladder contracts (`prices-ladder` events for the user's collateral asset) over REST and `@bookTicker`, cleans the bid/ask mids into a monotone curve, and derives the probability that price finishes below the user's liquidation price by expiry.
  2. A relayer posts that probability and the ladder snapshot to an Anchor oracle account on Solana devnet.
  3. An Anchor guard vault holds the user's USDC buffer and a rule such as "if liquidation probability exceeds 20%, top up collateral". Anyone can crank the rule once the oracle account shows the threshold crossed.
  4. A QuickNode Stream on Solana devnet (Programs + Logs dataset, filtered to the guard program ID) pushes oracle updates and guard executions to a webhook, which drives the live UI and the keeper.
  5. A hedge button sizes and places a Gemini order for the matching "NO" contract, in the sandbox if supported.
- **Core demo moment:** The user drags a price slider or a real ladder moves. The screen changes from "liquidation at $118" to "the market prices a 23% chance of that by Nov 30". The guard fires onchain within seconds, the Stream event appears live, and the app shows "hedge: $41 buys $500 of cover".
- **Stack:** Anchor, SPL Token or Token-2022 for the vault receipt, Pyth for spot, `@gemini-markets/sdk` or raw REST and WebSocket, QuickNode Streams with a webhook, Next.js, a Solana wallet adapter.
- **Prizes:** DeFi track + Best use of Solana + Gemini bounty + QuickNode bounty + Official Winner. Ceiling $9,000.
- **Feasibility (5 days, 2–4 people):** Good. Day 1 data ingestion, ladder math, and start recording odds. Day 2 Anchor oracle and vault. Day 3 Stream, webhook, keeper. Day 4 UI and hedge flow. Day 5 README, video, deploy. One person can cut the hedge order and still ship.
- **Main risks:**
  - Ladder liquidity is thin (about $1,000 a day on SOL month-end), so quotes are wide. Show the bid/ask band and say so.
  - A contract that settles at expiry does not cover a mid-period wick. The README must state this basis risk. A standard approximation is that the chance of touching a level is up to about twice the chance of finishing beyond it.
  - The relayer is a trusted party. Disclose it and sign every update.
  - The hedge pays out in a Gemini USD account, not onchain.
  - Sandbox trading for prediction markets is unverified. Fallback: show the exact signed order payload and keep trading as a stretch goal.
  - Existing lending protocols may not be on devnet. Fallback: read a real mainnet position read-only and run the guard against the team's own devnet vault.
- **Scoring:** Technical Execution is strong (own program, oracle, keeper, Stream, exchange API). Product & UX is strong (one number a borrower understands). Innovation is strong (market-implied liquidation odds and binary cover are new). Impact is believable given the liquidation evidence. Demo has a clear cause and effect.

### Rank 2: Odds-triggered onchain automation ("if the odds cross X, do Y")

- **Problem:** Prediction odds cannot drive onchain actions (P4).
- **User:** A DeFi user or DAO treasurer who wants rules such as "if the chance of a December Fed cut exceeds 70%, move 30% of USDC into staked SOL".
- **Demo moment:** A Gemini odds line crosses a threshold on a live chart and a Solana transaction executes with no click.
- **Stack:** Same oracle and keeper as Rank 1, plus an escrow program with conditional intents. Streams triggers the keeper.
- **Prizes:** Same stack as Rank 1.
- **Feasibility:** Good, and it shares about 70% of its code with Rank 1.
- **Risks:** Macro markets are illiquid (Economics traded $266 on 2026-11-14), so thresholds are easy to move. The use case is less concrete than liquidation.
- **Scoring:** Strong on execution and innovation. Weaker on a clear user problem. It works best as a stretch feature inside Rank 1.

### Rank 3: Parametric cover vault on Arc, priced by Gemini odds

- **Problem:** Small businesses cannot easily hedge weather or macro events (P5).
- **User:** A food truck or event operator who loses money on a hot or cold day.
- **Demo moment:** The user types "I lose $800 if Austin tops 90°F on Saturday", gets a quote in USDC, pays with USDC gas, and receives a payout after settlement.
- **Stack:** Foundry on Arc testnet, a USDC underwriting vault, Gemini weather ladders for pricing, the Gemini settled-events endpoint for resolution, Circle Wallets, and optionally Gateway to fund from another chain. Streams on Arc testnet (Logs dataset).
- **Prizes:** DeFi track + Best use of Arc + Gemini + QuickNode + Official Winner. Ceiling $8,500.
- **Feasibility:** Moderate. Gemini lists daily high-temperature ladders for many cities, including Austin (probed).
- **Risks:** Weather volume was $888 for the whole category, so prices are weak signals and the vault cannot actually lay off risk. Resolution depends on a trusted relayer. Insurance-like products raise regulatory questions a judge may ask about. Markets are daily, so the demo timing is tight.
- **Scoring:** Strong on story and UX. Weaker on economic soundness.

### Rank 4: Implied-distribution explorer for crypto ladders

- **Problem:** Traders cannot see the probability distribution that Gemini ladders imply, or how it moves (Gemini objectives 1 and 4).
- **User:** A crypto trader or analyst.
- **Demo moment:** An animated distribution curve for SOL at month-end shifts as trades arrive, next to spot and the user's position.
- **Stack:** Gemini REST and WebSocket, charts, a thin onchain piece (posting snapshots to Solana).
- **Prizes:** Strong for Gemini. Weak for the DeFi track, because the onchain part is decorative.
- **Feasibility:** Very good. This is also the first two days of Rank 1.
- **Risks:** Only five days of history. Low innovation score as a standalone DeFi entry.

### Rank 5: Gemini cross-venue divergence scanner

- **Problem:** The same event trades at different prices across venues (P3).
- **Demo moment:** A live table of Gemini against Kalshi and Polymarket gaps, with alerts.
- **Prizes:** Gemini bounty mainly. DeFi fit is weak.
- **Feasibility:** Moderate. Matching events across venues is the hard part, and rule differences make false matches likely.
- **Risks:** The terminal category is crowded and the track fit is poor.

### Rank 6: USDC and EURC treasury router on Arc

- **Problem:** Cross-chain and cross-currency stablecoin treasury is fragmented (P7, P8).
- **Prizes:** DeFi track + Best use of Arc + QuickNode.
- **Feasibility:** Moderate. StableFX is permissioned, and Circle's samples already cover this ground.
- **Risks:** Low innovation, and no natural Gemini angle, which forfeits the largest bounty.

### Ranking summary

| Rank | Idea | Prize ceiling | Feasibility | Innovation | Track fit |
| --- | --- | --- | --- | --- | --- |
| 1 | Liquidation-odds guard (Solana) | $9,000 | Good | High | High |
| 2 | Odds-triggered automation (Solana) | $9,000 | Good | High | Medium |
| 3 | Parametric cover vault (Arc) | $8,500 | Moderate | Medium-high | Medium |
| 4 | Implied-distribution explorer | $5,000–$9,000 | Very good | Medium | Low |
| 5 | Cross-venue divergence scanner | About $5,000 | Moderate | Low | Low |
| 6 | Arc treasury router | $6,000 | Moderate | Low | Medium |

**Recommendation:** Build Rank 1, fold in Rank 4's distribution chart as the main visual, and add Rank 2's generic rule as a stretch goal. Start recording Gemini odds today, because history cannot be backfilled.

Questions to bring to office hours:

- Gemini (Mon and Tue, 7 PM): Does the sandbox support prediction market orders? Is there any historical price endpoint for contracts? Are WebSocket connections limited?
- QuickNode (Wed, 7 PM): What is the Solana devnet credit multiplier, and do hackathon credits lift the one-stream limit?
- Solana (Mon, 6 PM): Which lending protocols are usable on devnet today?

## 7. Could not verify

- Whether the Gemini sandbox accepts prediction market orders. It serves prediction events publicly, but I had no account to test trading.
- Gemini Predictions eligibility by state, including Texas, and the taker fee.
- Gemini WebSocket connection and subscription limits.
- The QuickNode Streams credit multiplier for Solana, and which billing description is correct (blocks processed or data delivered).
- Devnet availability of Kamino, Jupiter, Drift, marginfi, Switchboard On-Demand, and DFlow. Pyth on Solana devnet rests on a secondary source.
- Free, usable price feeds on Arc testnet. Pyth lists only Pyth Pro there. Stork, Chainlink, and Band deployments were not confirmed.
- The StableFX FxEscrow testnet address. Arc's page and Circle's interface docs reportedly differ. The Arc-listed address has code.
- CCTP transfers specifically between Solana devnet and Arc testnet.
- The Arc mainnet launch date (2026-09-16), which comes from secondary sources.
- Winners of the March 2026 Solana Prediction Markets Hack, and prior UBC hackathon winners.
- The cross-venue divergence figures (2–4%, 6% overlap), which come from search summaries of papers I did not open.
- Whether any existing terminal already integrates Gemini's prediction API.
- Whether any live lending market accepts DFlow Kalshi tokens as collateral.
