# Ideas built around the Gemini Prediction Markets bounty

Researched Mon 2026-11-16 against live docs and live public endpoints. Requirements come from [`../HACKATHON.md`](../HACKATHON.md). This report does not repeat [`../IDEAS.md`](../IDEAS.md) or reports 01–03; it corrects them where a probe today showed something different.

Status words used below:

- **Probed**: I called the public endpoint or registry today and saw the result.
- **Docs**: stated in current official documentation, not exercised.
- **Secondary**: a third-party source says so.
- **(unverified)**: I could not confirm it against a primary source.

## 1. Summary

1. **The data terms leave one direction clearly open.** Reading Gemini data inside your own app and acting on it, and trading on the user's own account, are inside the licence. Selling the data, pricing or settling an onchain financial contract from it, and publishing it as a feed or index are outside it. Showing odds to other people from your own server and posting derived values onchain sit in between.
2. **The API is richer than the earlier research found.** Five-minute and fifteen-minute crypto contracts settle all day, public trade history exists per contract, settled events carry explicit resolution fields, and the sandbox mirrors the prediction markets with resting quotes.
3. **Arc testnet now has a real BTC-collateralised lending market reachable from TypeScript** (Circle's Borrow Kit, published Nov 12). That removes the two weakest points of the liquidation-odds guard: the mock position and the Anchor program.
4. **Top pick: Liquidation Odds Autopilot on Arc** (idea A). It is an evolution of the liquidation-odds guard, not a new idea, and section 5 says exactly what changed. It is the only idea here where every part sits clearly inside Gemini's terms and every tool has an official TypeScript path.
5. **The most original idea is Proof of Edge** (idea B), and it has a single test that decides it. Run that test before committing.
6. **I found no Consumer-track idea in this angle that beats the constraints.** Prediction-market data in a consumer app is either a picks game (saturated, and one already exists on Gemini's API) or has an onchain half too thin to win a track.

## 2. The Gemini data terms, read in full

Source: [Market Data Agreement](https://www.gemini.com/legal/market-data-agreement), dated October 12, 2025, full text read today. The [API Agreement](https://www.gemini.com/legal/api-agreement) was read through a summarising fetch only.

### What the text says

- **Licence:** "a non-exclusive, non-transferable, non-sublicensable, worldwide, revocable license to receive, download, store, and copy Gemini Market Data only for your Permitted Use".
- **Permitted Use:** "solely for: (i) personal and/or internal use; (ii) general informational purposes; or (iii) analysis of prices and markets and financial products relating thereto".
- **Prohibited Use**, the clauses that matter here:
  - (i) "develop, create, register, issue, price, list, modify, or cause to bring to market, whether directly or indirectly, any new or existing investment product, financial product, exchange-traded fund, or financial contract of any kind";
  - (ii) "create a financial benchmark, reference rate, or index, or use Gemini Market Data in any financial benchmark, reference rate, or index";
  - (iii) "manipulate, misrepresent, falsify, or otherwise modify Gemini Market Data";
  - (vi) "distribute, redistribute, disseminate (other than for the purposes of providing OEMS Services), sell, resell, license, or sublicense Gemini Market Data to any party for any reason".
- **Commercial use:** "If you would like to use Gemini Market Data for a commercial purpose, please email bizdev@gemini.com."
- **Scope:** Gemini Titan, LLC (the Designated Contract Market that runs the prediction markets) is in the entity table. "Gemini Market Data" is not defined in this document; it defers to the User Agreement. I assume prediction-market quotes, trades and settlements are covered.
- **Derived data** is mentioned once, in the indemnity ("any other Person that receives Gemini Market Data or derived data, directly or indirectly, from you"). Nothing grants or denies a right to publish derived values.
- **Your own account data** (orders, positions, payouts) is not addressed by either agreement. The API Agreement only says account data is reached with an API key and that keys must be kept confidential.

### Verdict by idea shape

| Shape | Verdict | Why |
| --- | --- | --- |
| Backend reads quotes, computes something, acts for the user (rebalance, repay, alert) | **Clearly fine** | Internal use and analysis, Permitted Use (i) and (iii) |
| Store and record quotes and trades for your own analysis and backtests | **Clearly fine** | The licence names "store, and copy" |
| Place, cancel and read orders on the user's own Gemini account | **Clearly fine** | Trading is governed by the API and User Agreements, not the data licence |
| Each viewer's browser fetches odds straight from Gemini | **Clearly fine in my reading** | Each viewer receives the data from Gemini under their own licence. The public API allows cross-origin requests (probed) |
| Onchain commitment that reveals no data (a hash) | **Clearly fine** | A hash is not the data |
| Prove or publish the user's own settled positions | **Fine by silence** | Account records are not market data; neither agreement restricts them. Not expressly granted either |
| Your server relays odds to other users in a public app | **Grey** | Literally "disseminate". The bounty objective "bring prediction market data into other apps" invites it, and every dashboard entry does it |
| Post a Gemini-derived number, flag or trigger onchain | **Grey** | Public dissemination of derived data; could be read as a reference rate under (ii) |
| Post settled outcomes onchain; public forecaster scoreboards | **Grey** | Dissemination; "benchmark" in (ii) is qualified by "financial", so a forecasting scoreboard is probably outside it |
| A zero-knowledge or attested proof of a public Gemini response, verified onchain | **Grey** | The proof carries the extracted value in clear |
| Any paid product that depends on the data | **Grey to prohibited** | "Commercial purpose" needs Gemini's consent |
| Sell or meter the data (a paid odds API, x402 odds endpoint) | **Prohibited** | (vi) |
| Price, issue or settle an onchain financial contract from the data: cover vaults, parametric insurance, mirror markets, synthetic odds tokens, loans priced by odds, bets settled by Gemini's resolution | **Prohibited** | (i) |
| An onchain oracle feed or index of Gemini odds for other contracts to consume | **Prohibited** | (ii) and (vi) |
| A pooled vault that takes outside deposits and is run on Gemini data | **Prohibited in my reading** | "develop ... any investment product" under (i) |
| Smooth or alter quotes and present the result as Gemini's price | **Prohibited** | (iii). Label any fitted curve as your own estimate |

The grey rows can only be settled by Gemini. Office hours are tonight (Mon), Tue and Thu, 7:00–8:00 PM CST. The top pick does not need an answer; ideas B's stretch goal and C do.

## 3. What the API offers today

| Item | Finding | Status |
| --- | --- | --- |
| Public REST base | `https://api.gemini.com`, no key | Probed |
| Rate limits | Public 120 requests/min, private 600/min, HTTP 429 above ([docs](https://developer.gemini.com/rate-limit)). No WebSocket limits published | Docs |
| Cross-origin | `access-control-allow-origin` echoes the caller's origin on public REST | Probed |
| Events | `GET /v1/prediction-markets/events` with `status`, `limit`, `offset`, `category`, `search`; `GET .../events/{ticker}`; `GET .../events/recently-settled` (last 24 hours); `GET /v1/prediction-markets/categories` | Probed, except recently-settled (Docs) |
| Active markets now | The list reports 1,000 active events (the total may be capped at 1,000): 783 Sports, 99 Weather, 90 Crypto, 18 Commodities, 6 Politics, 3 Culture, 1 Economics | Probed |
| Short-dated crypto | "Up" contracts on BTC, ETH, SOL and XRP that expire every 5 and 15 minutes (51 active 5-minute events at probe time), plus hourly and daily strike ladders | Probed |
| Strike ladders | BTC Nov 20 has 21 strikes, all two-sided; BTC Nov 30 has 12 strikes, 10 two-sided; SOL Nov 20 has 20, all two-sided. Gold, silver, copper, natural gas, Brent and WTI ladders also exist | Probed |
| Weather | Daily high-temperature ladders for about 30 cities including Austin, San Antonio, Dallas and Houston; mostly 2–5 two-sided strikes of 6 | Probed |
| Settlement fields | Settled contracts carry `resolutionSide`, `resolvedAt`, `settlementValue`, `strike`, `source` (for example `LS-LRRR-XBTUSD`) | Probed |
| Public trade history | `GET /v1/trades/{instrumentSymbol}?limit_trades=500` returns executed trades for a prediction contract. One BTC Nov 30 strike returned 29 trades going back to Nov 3 | Probed |
| Public order book | `GET /v1/book/{instrumentSymbol}` works for prediction contracts | Probed |
| Reference candles | `GET /v2/klines?agency=lukka&index=...` for BTC, ETH, SOL, XRP, HYPE, ZEC; intervals 1m to 1day ([docs](https://developer.gemini.com/prediction-markets/market-data)) | Docs |
| WebSocket | `wss://ws.gemini.com`; `{symbol}@bookTicker`, `@depth5/10/20`, `@depth`, `@trade`, and a `contractStatus` lifecycle feed (approved, active, strike set, settled). Private: `orders@account`, positions, balances, and `order.place` over the socket | Docs |
| Trading | `POST /v1/prediction-markets/order` (`symbol`, `orderType` limit or stop-limit, `side`, `outcome`, `quantity`, `price`, `timeInForce`), cancel, batch place and cancel, active orders, history. Positions: `POST /v1/prediction-markets/positions` and `.../positions/settled` (payout, cost basis, net profit, resolution side, past year) | Docs |
| Auth | HMAC API key with the `Trader` role (payload in `X-GEMINI-PAYLOAD`, signature in `X-GEMINI-SIGNATURE`), or OAuth with PKCE for browser clients. OAuth apps are self-created in API Settings. Terms must be accepted once through the terms endpoints | Docs |
| SDK | `@gemini-markets/sdk` 0.1.1, published 2026-09-25. Import `/server` (HMAC, OAuth, private streams) or `/browser` (public data, OAuth PKCE). `env: "sandbox"` or `"production"` must be set explicitly. Exposes `predictions.listEvents`, `placeOrder`, `getSettledPositions`, `acceptTerms` and others | Probed (registry), Docs (surface) |
| MCP server | `packages/mcp-server` in [gemini/developer-platform](https://github.com/gemini/developer-platform) (pushed 2026-11-12). 50+ tools; prediction tools cover symbols, contracts and prices, plus `gemini_get_book_ticker` and `gemini_get_contract_status`. `GEMINI_API_BASE_URL` selects sandbox. Built from source, not installed from npm | Docs |
| CLI | `packages/gemini-markets-cli` (Go). `prediction-markets list/get/terms`, `orders prediction place/list/cancel`, `--environment sandbox`, `--dry-run`. Must be built from a full checkout; `go install` is not supported yet | Docs |
| Sandbox data | `https://api.sandbox.gemini.com` serves prediction events (64 active crypto events, 48 of them 5-minute). The 5-minute books hold resting quotes; the daily ladders were empty | Probed |
| Sandbox orders | Not stated on the [sandbox page](https://developer.gemini.com/get-started/sandbox). Three signs it works: Gemini's changelog lists a "sandbox HMAC smoke workflow ... with guaranteed order-cancellation cleanup" for the predictions SDK; the SDK README's prediction order example uses `env: "sandbox"`; and a public hackathon project states it places sandbox limit buys through `placeOrder` ([Hunch](https://github.com/Vibhor0409/hunch), Secondary) | **(unverified)** until one of you places an order |
| Fees | Maker fee $0.00 through 2026-12-31 (Docs). Taker schedule is at gemini.com/fees/predictions, not read | Docs |
| Eligibility | Secondary sources list eight restricted states and do not name Texas ([DeFi Rate](https://defirate.com/prediction-markets/states/)). Not on Gemini's developer docs | **(unverified)** |

### Corrections to the earlier research

| Earlier claim | Finding today |
| --- | --- |
| "No contract price history, so odds must be recorded from now on" | Partly wrong. `GET /v1/trades/{instrumentSymbol}` returns public trade history per contract. It is sparse on thin strikes, so recording quotes is still worth starting, but a backtest is possible now |
| "The fields that report a settled outcome are unverified" | Verified: `resolutionSide`, `resolvedAt`, `settlementValue` |
| "Ladder liquidity is thin, so a live trigger needs a manual control" | Still true for most strikes, but the 5-minute and 15-minute contracts settle continuously and give a live, moving, real resolution during a 5-minute pitch |
| "The protected position is a mock because no devnet lending protocol was confirmed" | Arc testnet has cirBTC-collateralised USDC loans through Circle's Borrow Kit (Docs; see idea A) |

## 4. What has won and what is saturated

I could not confirm any Gemini bounty result from a primary source. Devpost blocks automated reads and searches returned no winners page.

- **Found:** [Hunch](https://github.com/Vibhor0409/hunch), built at "B@BHacks 2.0": a swipe game where you call a market blind and then see the price. Gemini SDK, sandbox orders, Supabase, no onchain part. Whether it placed is unknown.
- **From `IDEAS.md`, not re-confirmed:** a fantasy picks app and an order-book analytics terminal took Gemini's bounty at Penn in March 2026.
- **What Gemini asks for:** its [builder page](https://www.gemini.com/build-predictions) lists "interfaces, analytics, alerts, bots, strategies, research tools, and community products". Nothing onchain is mentioned, so an entry whose onchain half does real work is unusual by Gemini's own framing.

Gaps, as inferences from the above and not counts of this year's field:

1. **The ladders as a probability distribution.** Every example found treats a contract as a single price. Nobody found turns a ladder into a distribution and acts on it.
2. **The onchain-to-Gemini direction.** Entries bring odds to the chain, which is where the terms problem lives. Reading an onchain position and acting on Gemini, or acting onchain from privately held odds, is unexplored and clean.
3. **The account endpoints.** Settled positions, payouts and order streams are unused in everything found; all of it is public market data.
4. **The 5-minute contracts.** Useful mostly as a demo device: something real resolves while you are on stage.

## 5. Idea A: Liquidation Odds Autopilot on Arc (top pick)

A borrower with a BTC-backed loan sees the market's own odds that the loan gets liquidated before a date, sets a limit on those odds, and an agent repays from a capped reserve when the limit is crossed.

### What changed from the liquidation-odds guard already on the table

| | Liquidation-odds guard (IDEAS.md) | This version |
| --- | --- | --- |
| Chain | Solana, Anchor programs | Arc testnet, one short Solidity contract |
| Protected position | Mock | A real cirBTC-collateralised USDC loan opened through `@circle-fin/borrow-kit` |
| Gemini data onchain | A signed trigger or probability posted to an oracle program | Nothing. The odds stay in the backend; the agent sends an ordinary repay transaction |
| Model | One ladder, probability of finishing below a price | Several expiries, a fitted distribution per expiry, and the chance of touching the liquidation price before expiry |
| History | None | Backtest from the public trades endpoint and reference candles |
| Hedge | A button | A sized order on the user's own Gemini account through the trading endpoints (sandbox) |
| Chain award | Best use of Solana, $1,500 | Best use of Arc, $1,000 |

### The problem

- **Who:** anyone borrowing stablecoins against volatile collateral.
- **Evidence:** Aave reports more than $250 million liquidated on October 10, 2025 alone ([Aave](https://aave.com/blog/historical-liquidations)). A search excerpt reports a record $429 million liquidated across 12,500 transactions from January 31 to February 5, 2026; I did not open the source page, so treat the figure as (unverified). [The Block](https://www.theblock.co/news/defi/2026-02-05-loan-backed-2-3-aave-supply-cascading-liquidations-token-slides-388721) covered cascading liquidations in the same week.
- **Why current tools fall short:** a lending app shows a health factor and a liquidation price. Both are distances, not odds. Circle's own Borrow Kit groups health into five bands and offers a webhook when the band changes ([loan health](https://docs.arc.io/app-kit/concepts/borrow-loan-health.md)); it reacts after the price has moved. Alert bots and auto-deleveraging tools trigger on price or health factor, never on a forward-looking probability.

### Why it is not simple

It builds a market-implied price distribution from binary-option ladders across several expiries, converts it into the probability that a specific loan touches its liquidation price before each date, and lets that probability drive a constrained onchain action. The quantitative core is the part judges cannot guess at from the UI.

The method, so the README can state it:

1. Each strike `K` on a ladder is a contract "BTC at or above `K` at expiry". Its YES price is the market's survival probability at `K`, bounded by bid and ask.
2. Clean the strikes into a non-increasing curve with isotonic regression weighted by the inverse spread. Treat one-sided quotes as bounds only.
3. The chance of finishing below the liquidation price `L` is one minus the curve at `L`, interpolated in log-strike.
4. Liquidation happens on a touch, not only at expiry. For a driftless process the reflection principle gives a touch probability of about twice the finish-below probability. Show both numbers and say which is which.
5. Repeat for today's ladder, Nov 20 and Nov 30 to get odds by date. Cross-check the implied volatility against realised volatility from the reference candles.
6. Label the result as the app's estimate from Gemini quotes, never as a Gemini price (terms clause (iii)).

### What already exists

- No tool found derives liquidation odds from prediction-market ladders (one search; treat as a lead, not proof).
- [LiqGuard](https://devpost.com/software/liqguard) entered last year with flat-premium liquidation insurance and is not known to have placed (from IDEAS.md).
- Health-factor alerting and auto-repay products exist for Aave-style markets and trigger on price.

New here: the probability itself, the term structure, a real loan on Arc's newest kit, and a design that keeps Gemini data offchain.

### Tools

| Piece | Tool | Status |
| --- | --- | --- |
| Loan | `@circle-fin/borrow-kit` 1.3.1 or `@circle-fin/app-kit` 1.22.0 (both published 2026-11-12). `exploreMarkets`, `borrow`, `getLoans`, `getPosition` (returns `ltv`, `healthFactor`, `healthFactorBand`, `liquidationPrice`), `registerWebhook`. Needs Node 22 and an adapter with atomic batches (`@circle-fin/adapter-viem-v2` or Circle Wallets) | Docs ([quickstart](https://docs.arc.io/app-kit/quickstarts/originate-a-loan.md), [monitor](https://docs.arc.io/app-kit/howtos/borrow/monitor-a-loan.md)), versions Probed |
| Testnet funds | cirBTC and USDC on Arc testnet from the [Circle faucet](https://faucet.circle.com/) | Docs |
| Reserve yield (stretch) | Earn Kit vaults on Arc testnet ([quickstart](https://docs.arc.io/app-kit/quickstarts/earn-deposit.md)) | Docs |
| Odds | Gemini REST for ladders, `@bookTicker` for live quotes, `/v1/trades` for history, `/v2/klines` for reference prices, `@gemini-markets/sdk/server` | Probed |
| Hedge order | `predictions.placeOrder` with `env: "sandbox"` | Docs; sandbox orders (unverified) |
| Guard contract | Solidity with Arc Foundry, viem 2.57 | Docs |
| Events | QuickNode Stream on Arc testnet logs, filtered to the guard contract, to a webhook | Verified in IDEAS.md |

Traps:

- **I could not list the live Borrow markets.** The read-only call needs the SDK installed and I was not permitted to run it. Run `exploreMarkets({ chain: "Arc_Testnet" })` first thing; it needs no key.
- **The testnet cirBTC price may not track real BTC** (unverified). If it does not, express everything as percentage distance to liquidation and map that onto the live ladder.
- **One open loan per wallet per market** (Docs).
- **Arc traps from IDEAS.md:** USDC is 6 decimals as an ERC-20 and 18 as the native token; transactions under 20 Gwei `maxFeePerGas` are dropped.
- **Ladder liquidity:** BTC Nov 20 and Nov 30 were well quoted today; same-day ladders thin out near expiry.

### Architecture

- **Odds engine (offchain, TypeScript):** subscribes to the BTC ladders, fits the distribution, publishes odds by date to the app's own frontend session. Stores every quote for the backtest.
- **Loan reader (offchain):** `getPosition` on a timer plus the Borrow webhook; takes `liquidationPrice` and debt.
- **Policy and reserve (onchain, Solidity on Arc testnet):** the user deposits a USDC reserve and sets a daily cap and the one address funds may go to. The agent key can call a single function that releases up to the cap to that address. It cannot change the policy or withdraw elsewhere. Pause and withdraw belong to the user.
- **Agent (offchain):** when the odds for the chosen date exceed the user's limit, it computes the repayment that brings them back under, asks the reserve for that amount, and repays through Borrow Kit. Above a second, larger threshold it asks the user instead of acting.
- **Hedge (offchain, optional):** sizes NO contracts on the strike nearest the liquidation price and places the order on the user's Gemini account.
- **Stream (QuickNode):** reserve and repay events to a webhook that updates the dashboard and reconciles the agent's log against the chain.

Open design point: whether the reserve contract can repay the loan directly on the borrower's behalf depends on the underlying lending protocol's interface, which the kit hides (unverified). The fallback is that the loan sits in a dedicated wallet the agent operates through Borrow Kit, and the contract caps what can flow into it. Ask Circle on Wed 6:00–7:00 PM.

Decision loop and safety limits, as the Agentic and DeFi tracks ask to see documented: thresholds set by the user and stored onchain; daily cap enforced by the contract, not the model; no language model in the trigger path (the model only writes the plain-language explanation); manual pause.

### Prize stack

DeFi track $2,000 + Best use of Arc $1,000 + Gemini 1st $2,500 + QuickNode $500 = **$6,000**, plus an Official Winner place of up to $2,500. First place in Gemini also gives a finalist slot.

It could instead enter Agentic Payments (spending controls, a documented loop). DeFi fits better: "improve risk management", "compose with existing protocols", "make DeFi safer".

### Build estimate: 45–55 person-hours

| Day | Goal | Who |
| --- | --- | --- |
| Mon evening | Faucet cirBTC, open a loan, read `liquidationPrice`. Pull a ladder and print finish-below odds for one price. Create sandbox account and place one prediction order. Gemini office hours at 7:00 PM | All four, one task each |
| Tue | Distribution fit across three expiries with tests. Reserve contract written, tested, deployed. Agent repays the loan by hand-triggered call. Start recording quotes | Quant, contracts, agent, frontend skeleton |
| Wed | Threshold loop end to end. QuickNode Stream. Dashboard: distribution chart, odds by date, policy screen, activity log. Backtest from trade history | Same split |
| Thu | Hedge order, replay mode, deploy, README with the method and risk assumptions, video. Freeze at 8:00 PM | Demo owner leads |
| Fri | Submit by 10:00 AM | |

Cut first, in order: Earn yield on the reserve, the hedge order, the backtest chart, the second and third expiries. Do not cut the real loan or the onchain cap.

### Risks

- **Borrow markets absent or illiquid on testnet.** Decided by Monday evening's first task. If it fails, deploy a minimal collateral-and-debt contract yourselves (adds 6–8 hours and weakens the "real protocol" claim).
- **It is an evolution of a known idea.** Another team could build the Solana version. The distribution engine and the real loan are the differentiators; lead with them.
- **The live trigger may not fire on cue.** Odds move with real BTC. Keep a replay of a recorded move, labelled as a replay, and a what-if slider.
- **Gemini judges may prefer trading volume.** The hedge order is the answer; do not cut it lightly.

### Demo script (5 minutes)

1. **0:00** One borrower, one loan. "Health factor 1.25, band SAFE. What are the odds?" Nobody can answer from the lending screen.
2. **0:40** The app shows the real loan from Arc testnet and, beside it, "the market puts 14% on BTC touching your liquidation price by Nov 30" (an illustrative number), with the fitted distribution and the ladder quotes it came from.
3. **1:30** Odds by date across three expiries; one sentence on the method.
4. **2:00** The user sets "keep it under 10%, spend at most 500 USDC a day". The policy transaction lands on Arc.
5. **2:40** The odds cross the limit (live if the market obliges, replay otherwise). The agent repays; the explorer shows the transaction; the health factor and the odds both improve; the Stream pushes the notification.
6. **3:40** The residual risk is hedged with one order on Gemini; the order ID appears.
7. **4:15** Architecture slide: what is onchain, what the agent key cannot do, and that no Gemini data leaves the app.
8. **4:45** What comes next.

### Scores

| Criterion | Score (1–5) | Note |
| --- | --- | --- |
| Technical Execution | 4 | Real loan, real contract, a real model. Loses a point if the testnet price is static |
| Product & UX | 4 | One number a borrower understands |
| Innovation | 4 | New use of the ladders; the base idea is known |
| Impact & Potential | 4 | Liquidations are large and recurring; commercial use needs Gemini's consent |
| Demo | 4 | Visible onchain action; depends on the replay being honest and clear |

## 6. Idea B: Proof of Edge

A trader or trading agent proves its settled Gemini prediction-market record without revealing its API key, and the proof is verified onchain and attached to an agent identity on Arc.

### The problem

- **Who:** people and agents who sell forecasts or signals, and anyone deciding whether to trust them.
- **Evidence:** regulators keep charging people who fake records with screenshots. In September 2026 the SEC alleged an operator posted "highly cropped screenshots of fake returns he had made on a practice trading platform" ([InvestmentNews](https://www.investmentnews.com/regulation-legal-compliance/sec-alleges-florida-operator-faked-fund-returns-targeting-police-retirees/268341)); another admitted using Photoshop on trade screenshots ([Finance Magnates](https://www.financemagnates.com/forex/regulation/he-promised-1200-returns-on-10m-then-used-photoshop-to-hide-the-truth/amp)). Both are read from search excerpts, not the full articles.
- **Why current solutions fall short:** on an onchain venue every wallet's record is public. On a regulated, centrally cleared venue such as Gemini, a record lives in a private account and can only be shown as a screenshot.

### Why it is not simple

The proof is a zkTLS attestation: a third-party attestor confirms that a specific HTTPS response came from Gemini's settled-positions endpoint while the HMAC headers stay hidden, and a contract on Arc checks the attestor's signature before writing to the ERC-8004 validation registry. The score is calibration (entry price against outcome), not raw profit.

### What already exists

Proof of profit through zkTLS exists for crypto exchanges: [Whop PnL Cards](https://whop-docs.vercel.app/docs/13-pnl-cards-verification) (Reclaim), [Tickr](https://docs.nillion.com/articles/tickr-app) (Primus, Binance), [Tread vCeFi](https://docs.tread.fi/order-tracking-and-portfolio-management/portfolio/vcefi-verified-cefi), [Proof of Alpha](https://minaprotocol.com/blog/proof-of-alpha) (Mina). Reclaim publishes an [ERC-8004 validator](https://github.com/reclaimprotocol/reclaim-8004-validator) for identity credentials. I found none for a prediction-market venue, none that scores calibration, and none tied to Gemini. Novelty is in the combination, not the technique.

### Tools

| Piece | Tool | Status |
| --- | --- | --- |
| Record | `POST /v1/prediction-markets/positions/settled` returns payout, cost basis, net profit, outcome held and resolution side | Docs |
| Proof | `@reclaimprotocol/zk-fetch` 2.1.0 (2026-11-12). Server-side, Node 22. Private headers stay hidden; `responseMatches` and `responseRedactions` select what is revealed; `context.contextAddress` binds the proof to a wallet | Docs ([README](https://github.com/reclaimprotocol/zk-fetch)), version Probed |
| Verify offchain | `@reclaimprotocol/client` 0.1.47, `verifyRequestProof` and `hashProofClaimParams` | Docs |
| Verify onchain | `transformForOnchain` from zk-fetch, then a Reclaim verifier contract (`@reclaimprotocol/verifier-solidity-sdk` 1.0.4) that recovers attestor signatures | Docs |
| Agent identity | ERC-8004 registries on Arc testnet: Identity `0x8004A818BFB912233c491871b3d84c89A494BD9e`, Reputation `0x8004B663056A597Dffe9eCcC1965A193B7388713`, Validation `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` | Docs ([Arc tutorial](https://docs.arc.io/arc/tutorials/register-your-first-ai-agent.md)) |
| Payments | x402 with Circle Gateway Nanopayments on Arc testnet (`@x402/express` 2.31.0, `@circle-fin/x402-batching` 4.0.0) | Verified in report 01; versions Probed |

Traps:

- **zk-fetch now requires a Reclaim Builder organisation token and draws on a `ZKFETCH` quota.** The free allowance is not stated (unverified). The older application ID flow and `@reclaimprotocol/js-sdk` are discontinued, so most tutorials and AI-generated code are wrong.
- **TEE mode is the default** and downloads a 30–40 MB native library at install.
- **Whether a Reclaim verifier is deployed on Arc testnet is (unverified)**; the supported-networks page returned 404. Plan to deploy the verifier yourselves and register the attestor key.
- **Whether a default-mode proof from 2.1.0 verifies in the Solidity verifier is (unverified).**
- **Parsing the claim JSON in Solidity is expensive.** Store the proof identifier and a hash of the summary onchain; let anyone recompute the score from the public proof.
- **Whether Reclaim's attestor can reach `api.sandbox.gemini.com` is (unverified).**

### Architecture

- **Trading agent (offchain):** trades 5-minute and 15-minute contracts on the sandbox account to build a record; dozens of positions settle per hour.
- **Prover (offchain, Node 22):** calls settled positions through zkFetch with the HMAC headers private and the wallet address in the context.
- **Validator (onchain, Solidity on Arc testnet):** checks the proof targets the expected URL and method, that the proof owner is the caller, that the caller owns the agent ID, and that the proof is not replayed; then writes a validation response to the ERC-8004 registry.
- **Scorer (offchain, reproducible):** from the revealed positions, computes win rate by entry-price bucket and a Brier score against the entry price.
- **Marketplace (offchain plus x402):** a buyer agent reads the registry and pays per forecast only to agents whose validation is recent and above a threshold. The seller sells its own forecasts, never Gemini data.
- **Stream (QuickNode):** validation events to a webhook that refreshes the leaderboard.

### Terms position

The proof reveals the user's own account records, which neither agreement restricts. Forecasts sold are the agent's own work. This is the "fine by silence" row in section 2. A stretch goal of proving public market data onchain would move it to grey; leave that out.

### Prize stack

Agentic Payments track $2,000 + Best use of Arc $1,000 + Gemini 1st $2,500 + QuickNode $500 = **$6,000**, plus an Official Winner place.

### Build estimate: 60–70 person-hours

The plan only starts if a three-hour test passes:

1. Create a sandbox account and a `Trader` key, accept terms, place and fill one prediction order.
2. Get a Builder token and produce one zkFetch proof of the settled-positions response.
3. Deploy the verifier to Arc testnet and verify that proof.

| Day | Goal |
| --- | --- |
| Mon evening | The three-step test. Ask Gemini whether sandbox orders are supported |
| Tue | If the test passed: validator contract, trading agent accumulating settled positions, scorer |
| Wed | ERC-8004 registration and validation flow, x402 seller and buyer, leaderboard |
| Thu | Stream, README with the security model, video |

If the test fails by Tuesday noon, either switch to idea A or fall back to a trusted attester: the user connects Gemini through OAuth, the service reads settled positions and signs an EIP-712 statement, and the contract checks that signature. That version works but loses the "how did they build that" factor.

Cut first: x402 marketplace (use a direct USDC transfer), then the calibration chart, then ERC-8004 (use your own registry).

### Risks

- **The whole idea rests on sandbox prediction orders working.** Without them there is no record to prove unless a team member has an eligible, funded production account.
- **Three unverified links in the proof chain** (quota, attestor reach, onchain verification).
- **A proof shows one account's record.** Someone could open several accounts and present the best, or trade against themselves. Production accounts are identity-checked, sandbox accounts are not. Say so in the README.
- **Gemini judges may see little market-data use.** The entry relies on trading and account endpoints.

### Demo script (5 minutes)

1. A screenshot of a 90% win rate, then the question: is it real?
2. The agent's live Gemini sandbox positions; one 5-minute contract settles during the pitch.
3. "Prove it": the proof is generated, the key is never shown, the transaction lands on Arc, the registry shows the validation.
4. A buyer agent refuses an unverified seller and pays the verified one.
5. A tampered proof is rejected by the contract.

### Scores

| Criterion | Score (1–5) | Note |
| --- | --- | --- |
| Technical Execution | 5 if the chain works, 2 on the fallback | |
| Product & UX | 3 | The buyer's story is clear; the prover's flow is technical |
| Innovation | 4 | Known technique, new venue and new score |
| Impact & Potential | 3 | Useful where records are private; the sybil caveat is real |
| Demo | 4 | A rejected forgery is a strong moment |

## 7. Idea C: Sealed Forecast Arena

AI agents commit sealed forecasts onchain for Gemini's short-dated contracts, reveal after the close, and are scored with a proper scoring rule against the market price; a USDC prize pool pays out by skill.

- **Problem:** claims that a model "beats the market" are made after the fact. Offchain benchmarks exist that score models on prediction markets (Prophet Arena on Kalshi, ForecastBench; from memory, not re-checked today), but none found commits forecasts where they cannot be backfilled and pays automatically.
- **Why it is not simple:** commit and reveal with a fixed-point Brier score computed in the contract, a baseline taken from the market quote at commit time, and a market that resolves every five minutes so the full cycle runs on stage.
- **Tools:** Gemini 5-minute "Up" contracts and `contractStatus` feed (Docs), settled `resolutionSide` (Probed), Solidity on Arc testnet, ERC-8004 identities (Docs), x402 for agents buying outside data (verified in report 01), QuickNode Stream on arena events.
- **Architecture:** agents (offchain) forecast and commit a hash; the arena contract (onchain) stores commitments, accepts reveals, takes the outcome from a resolver, scores, and splits the epoch's prize pool; the resolver (offchain) reads Gemini's settlement and posts it. Agents stake nothing.
- **Terms position: grey.** The resolver posts Gemini outcomes onchain, and the baseline is a Gemini quote. Keeping the baseline as a hash and revealing it offchain reduces the exposure but does not remove it. If agents staked money it would become a wager settled by Gemini data, which is prohibited. Ask Gemini before building.
- **What exists:** picks and fantasy games are flagged as saturated, and Hunch already scores humans against Gemini prices. This differs by audience (agents), by sealing, and by onchain scoring, but a judge may file it with the picks apps.
- **Prize stack:** Agentic Payments $2,000 + Best use of Arc $1,000 + Gemini 1st $2,500 + QuickNode $500 = **$6,000**, plus an Official Winner place.
- **Build estimate: 40–50 person-hours.** Mon: arena contract and one agent committing. Tue: reveal, resolver, scoring tests. Wed: three agents with different strategies, x402 purchases, leaderboard, Stream. Thu: README and video. Cut x402 first, then ERC-8004.
- **Risks:** the terms question; the Agentic track wants agents that pay, and payment here is secondary; five-minute outcomes are close to coin flips, so skill differences will be small in a short demo.
- **Demo:** three agents commit; the room sees only hashes; the contract closes; reveals land; Gemini settles; the contract scores and pays. Then one agent tries to reveal a different number and is rejected.

| Criterion | Score (1–5) |
| --- | --- |
| Technical Execution | 4 |
| Product & UX | 3 |
| Innovation | 3 |
| Impact & Potential | 3 |
| Demo | 5 |

## 8. Idea D: Event-aware treasury agent on Arc

A single-owner treasury contract holds USDC and EURC; an agent reads Gemini's macro and commodity markets (Fed decision, gold, oil, BTC ladders) and shifts the allocation inside limits the contract enforces.

- **Problem:** small treasuries react to scheduled events by hand. Evidence for a specific, measured pain was not found; this is the weakest problem statement of the four.
- **Why it is not simple:** honestly, it mostly is. The depth would be in translating several ladders into one risk score and in the policy contract.
- **Tools:** Gemini REST and WebSocket (Probed), Swap Kit `@circle-fin/swap-kit` 1.9.2 on Arc (Docs; testnet liquidity for USDC to EURC unverified), Earn Kit vaults (Docs), a Solidity policy contract, QuickNode Stream.
- **Terms position: clearly fine** while the treasury has one owner. Open it to outside depositors and it becomes an investment product built on the data, which is prohibited.
- **What exists:** agent-with-limits projects are the most crowded Arc lane (IDEAS.md). Only one Economics event was active today (the December Fed decision, 3 of 5 contracts two-sided), so the macro signal is thin.
- **Prize stack:** Agentic Payments or DeFi $2,000 + Best use of Arc $1,000 + Gemini $2,500 + QuickNode $500 = **$6,000** on paper. A track win is unlikely.
- **Build estimate: 35–40 person-hours.**
- **Demo:** the Fed odds move, the agent proposes a shift, the contract rejects an oversized one and executes a capped one.

| Criterion | Score (1–5) |
| --- | --- |
| Technical Execution | 3 |
| Product & UX | 3 |
| Innovation | 2 |
| Impact & Potential | 2 |
| Demo | 3 |

## 9. Considered and dropped

| Idea | Reason |
| --- | --- |
| Wallet-aware hedging: read a Solana wallet, size a ladder hedge, place it through Gemini OAuth | Clean on terms and a good use of OAuth, but the only onchain work is reading balances. It would not win a track or a chain award |
| Trust-minimised odds bridge: a zkTLS proof of a public Gemini response triggers a contract | Technically the most striking, but it publishes Gemini-derived values onchain. Grey until Gemini says otherwise |
| Onchain market that mirrors or settles from Gemini | Prohibited under (i), and new prediction markets are saturated |
| Odds widgets for news or social feeds | Thin onchain half; relays data to third parties |
| Maker co-pilot for Liquidity Rewards | Already rejected in IDEAS.md; needs a funded production account |

## 10. Ranked comparison

| Rank | Idea | Track, chain | Max cash (plus Official Winner) | Person-hours | Terms | Sum of scores (of 25) | Biggest risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A. Liquidation Odds Autopilot | DeFi, Arc | $6,000 | 45–55 | Clearly fine | 20 | Arc testnet Borrow markets not usable, or a static testnet BTC price |
| 2 | B. Proof of Edge | Agentic, Arc | $6,000 | 60–70 | Fine by silence | 19 if the proof chain works, about 15 on the fallback | Sandbox orders or the zkTLS chain fail the Monday test |
| 3 | C. Sealed Forecast Arena | Agentic, Arc | $6,000 | 40–50 | Grey | 18 | Gemini says outcomes may not be posted onchain; reads as a picks game |
| 4 | D. Event-aware treasury agent | Agentic or DeFi, Arc | $6,000 | 35–40 | Clearly fine | 13 | Too ordinary to place |

Every idea is on Arc. For a team that has not shipped an Anchor program, the extra $500 from Best use of Solana does not pay for the added risk, and the two tools that make ideas A and B possible (Borrow Kit and the ERC-8004 registries) are on Arc.

## 11. Top pick

**Build idea A, Liquidation Odds Autopilot on Arc.**

- It is the only idea here that is both clearly inside Gemini's terms and backed end to end by official TypeScript tooling, so the team's first contract is a short one and not the critical path.
- It answers "too simple" with a quantitative core that can be explained in one sentence and inspected in the README.
- It hits three of Gemini's four objectives (odds over time, an agent acting on the data, prediction data inside an onchain app) and three of the DeFi track's four.
- It uses a kit Circle published four days ago, which the Arc judge is likely to notice.

Two checks decide it, both for Monday evening:

1. `exploreMarkets({ chain: "Arc_Testnet" })` returns a market with liquidity, and the faucet gives cirBTC.
2. A prediction order can be placed on the Gemini sandbox. Idea A survives without this by showing the order as a dry run; idea B does not.

If check 1 fails, choose between building a minimal loan contract for idea A or running idea B's three-hour test.

## 12. Not verified

- **Arc Borrow on testnet:** live markets, their liquidity, the cirBTC faucet, whether the testnet price tracks real BTC, and whether a contract can repay on a borrower's behalf. Documented, not exercised.
- **Gemini sandbox prediction orders:** strong indirect evidence, no primary statement, not tested.
- **Gemini eligibility in Texas** for production trading.
- **Gemini bounty winners at other events:** none confirmed from a primary source.
- **Reclaim:** the free zkFetch quota, attestor access to Gemini's hosts, a verifier on Arc testnet, and onchain verification of proofs from zk-fetch 2.1.0.
- **This year's field:** how many teams are building on the ladders or on Arc lending is unknown.
- **The API Agreement** was read through a summarising fetch, not in full.
- **Prophet Arena and ForecastBench** are cited from memory.
- **Swap liquidity for USDC to EURC on Arc testnet.**
