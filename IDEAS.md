# Project Ideas

Written 2026-11-15, about 8:00 PM CST. Combines two parallel research passes over [`HACKATHON.md`](HACKATHON.md) and [`research/`](research/README.md): one on what judges and sponsors reward, one on what can be built in the time left. Their sources were not re-checked when combining them; facts each pass could not confirm are listed under [Not verified](#not-verified).

**Time left:** the deadline is Fri Nov 20, 12:00 PM CST, about 112 hours away. That is four build days (Mon–Thu) plus Friday morning for submission only. The existing research assumes five.

## Recommendation

**Build the guardian voice wallet on Arc.** The team is four people and the goal is to win any prize, so the choice favours the least crowded prize categories over the highest ceiling.

- **It is the only idea in both researchers' top three.**
- **It avoids the crowd.** Prediction markets were the most crowded theme last year, and the organisers advertise a Solana prediction market on Gemini's API as the example stack. Agent spend limits are the most crowded Arc lane.
- **It does not depend on Gemini's data terms,** an open risk for every Gemini-based idea.
- **It enters six prize pools:** Consumer Track Winner, Best use of Arc, ElevenLabs, QuickNode Streams, Official Winner, and the participation prize.

The case rests on an inference: that the Arc consumer field is thinner than the Solana and Gemini fields. The project gallery is unpublished, so nobody has counted.

What it gives up: it cannot win the Gemini bounty, so its cash ceiling is $3,500 plus an Official Winner place, against $6,000–6,500 for the Gemini-based ideas.

**With four people the build is not the constraint.** The core is 30–35 person-hours, roughly two days for four people working in parallel. Spend the rest on the demo and the submission, not on a second idea: Product & UX and Demo are two of the five judging criteria.

**The surest prize is the participation prize,** which goes to every complete, working submission that meets every item under "What to submit" in the brief. No prize of any kind is paid unless the team is at the closing ceremony in Austin on Sat Nov 21.

**If you later want the higher ceiling,** the guarded research agent on Arc is the most buildable Gemini idea, but its design has to change first: as written it sells Gemini-derived data, which Gemini's terms prohibit (see [the Gemini data terms](#the-gemini-data-terms)).

## How the two researchers ranked the candidates

| Idea | Track, chain | Judging rank | Build rank | Effort (person-hours) | Max cash | Exposure to Gemini terms |
| --- | --- | --- | --- | --- | --- | --- |
| Guardian voice wallet | Consumer, Arc | 2 | 2 | 30–35 | $3,500 | None |
| Guarded research agent | Agentic, Arc | 4 | 1 | 35–40 | $6,000 | High as designed: sells Gemini-derived data |
| Liquidation-odds guard | DeFi, Solana | 1 | 5 | 40–45 | $6,500 | Open: posts a Gemini-derived value onchain |
| Odds-priced cover vault | DeFi, Arc | Flagged as a prohibited use | 3 | 30–35 | $6,000 | High: prices a financial contract |
| Claim-link payouts | Consumer, Arc | 3 | Not estimated | Closest estimate 25–30 | $3,500 | None |

- **Max cash** assumes first place in the track, the chain award, and every cash bounty the idea targets. An Official Winner place adds up to $2,500.
- **Where they disagree:** the judging researcher put the liquidation-odds guard first for its ceiling and novelty; the build researcher put it fifth because it is the largest build and needs Anchor. The build researcher's first and third picks both run into the Gemini terms, which only the judging researcher checked.

## The Gemini data terms

Gemini's [Market Data Agreement](https://www.gemini.com/legal/market-data-agreement) prohibits redistributing or selling its market data, and using it to price "any financial contract" or in a "benchmark, reference rate, or index". The bounty text invites bringing the data "onchain", so the two conflict and only Gemini can settle it.

Ask at Gemini office hours, Mon Nov 16, 7:00–8:00 PM CST: do those bans apply to bounty projects that act on, or publish, Gemini-derived values onchain?

Until then, reading Gemini data inside your own app and acting on it looks like the safe use; selling it, posting it onchain, or pricing a contract from it does not.

## Shortlist

### 1. Guardian voice wallet (recommended)

A dollar wallet you operate by voice. It reads every transfer back, and a risky one is held so a family member can cancel it.

- **User and problem:** older and low-vision users. People 60 and over reported $4.4 billion in crypto losses in 2025 ([The Block](https://www.theblock.co/news/ecosystems/2026-04-12-fbi-says-crypto-related-fraud-losses-hit-record-11-4-billion-in-2025-with-seniors-bearing-the-brunt-397134)).
- **Targets:** Consumer track, Best use of Arc, ElevenLabs, QuickNode Streams.
- **Demo:** "send fifty dollars to Maria" goes through. "Send two thousand to a new address" triggers spoken scam questions, a hold, and a cancel from the guardian's phone.
- **Why it is different:** shipped hold-and-guardian wallets ([Kleidi](https://www.kleidi.io/product), [Fortcore](https://fortcore.io/security)) have no voice, and the voice wallets that won elsewhere ([VoxSol](https://devpost.com/software/voxsol)) have no hold. The hold has to carry the pitch.
- **Why Arc and not Solana:** the hold is a short Solidity contract, the user only ever holds dollars, and voice wallets have already won Solana prizes twice. Solana pays $500 more but adds 6–10 hours; choose it only if someone has shipped an Anchor program.

**Architecture**

- **Voice agent (ElevenLabs Agents):** gathers intent and calls browser-side tools for balance, contacts, transfer and cancel.
- **Risk rules (plain code, not the model):** a new recipient or an amount over a threshold routes to the hold.
- **Hold vault (Solidity on Arc testnet):** create a hold with a release time; the sender or guardian cancels for a refund; anyone releases after the time lock.
- **Wallet:** Circle passkey wallet with sponsored fees ([quickstart](https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn.md)).
- **Stream (QuickNode):** filters hold events to a webhook that notifies the guardian's page and schedules the release.
- **Stack:** Next.js, `@elevenlabs/react`, `@circle-fin/modular-wallets-core`, Foundry, viem.

**Split across four people**

| Owner | Owns |
| --- | --- |
| Voice | ElevenLabs agent, browser-side tools, read-back and scam-check prompts, push-to-talk and typed fallback |
| Contracts and wallet | Hold vault with tests, deployment to Arc testnet, Circle passkey wallet, sponsored transfers |
| Frontend and Stream | Wallet screens, guardian page, QuickNode Stream, webhook and notifications |
| Demo and submission | Office hours, README, architecture diagram, video, Devpost form, stage rehearsal |

**Schedule**

| Day | Goal |
| --- | --- |
| Mon | Each piece works alone: agent in text-only mode against a mock wallet, hold vault deployed, a gasless transfer from a passkey wallet |
| Tue | End to end: a voice send goes through, a risky send is held, the guardian cancels it |
| Wed | Stream and notifications; accessibility pass; rehearse the demo in a noisy room |
| Thu | Deploy, README, video with audio; feature freeze in the evening |
| Fri | Submit by 10:00 AM |

The split and schedule are a suggestion built from the build researcher's hour estimates, which assumed one stream of work.

**Risks**

- **Live voice on stage:** names and amounts misheard in a noisy room. Restrict recipients to a contacts list, use push-to-talk and a headset, and keep typed input available.
- **Voice minutes:** the ElevenLabs free plan has 15 agent minutes a month and the hackathon coupon tier is unknown. Develop in text-only mode.
- **Crowded lane:** a talking wallet is ElevenLabs' own first example, so expect several.
- **Grok Bot:** the judging researcher listed it as a target; the build researcher advises against depending on it. Leave it out unless Tuesday's Cursor office hours clarify what it is.

### 2. Guarded research agent on Arc (higher ceiling, needs a redesign)

An agent that researches Gemini prediction markets, pays per request for outside data only when the information is worth more than its price, and sits behind a guard the model cannot bypass.

- **Targets:** Agentic Payments track, Best use of Arc, Gemini, QuickNode Streams.
- **Demo:** three purchases with the value calculation on screen, then the room is invited to prompt-inject the agent and the guard blocks the payment.
- **Why it is buildable:** every piece has an official Arc testnet quickstart, it is TypeScript plus one small Solidity contract, and the demo is scripted and repeatable.
- **Why the judging researcher ranked it fourth:** agent spend limits are the most crowded lane. Two spend-limit projects entered last year's edition ([gallery](https://mbc.devpost.com/project-gallery)) and 98% of Arc entries at ETHGlobal Cannes were agentic ([Arc blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned)).
- **Required change:** the build plan has the paid endpoints serve recorded Gemini odds history. Replace those with data that is not Gemini's, and keep Gemini as what the agent reads and reasons about. Whether that still satisfies the Gemini bounty is a question for Monday.

**Architecture**

- **Seller (offchain):** two x402-paywalled endpoints.
- **Agent (offchain):** forecasts a market, prices each signal, asks to buy.
- **Guard (offchain, outside the model):** checks the seller allowlist, quoted amount and remaining budget, holds the signing wallet, and escalates exceptions to a human.
- **Budget vault (Solidity on Arc testnet):** holds USDC, releases capped tranches, stores the allowlist, can be paused.
- **Payments:** Circle Gateway Nanopayments, signed offchain and settled in batches.
- **Stream (QuickNode):** reconciles vault events with the guard's log and pauses the vault on a mismatch.
- **Stack:** `@x402/express`, `@circle-fin/x402-batching`, viem, Foundry, Gemini REST and WebSocket, Next.js.

**Build order:** Mon seller-and-buyer round trip, Gemini reader, vault (9h). Tue decision loop, guard, injection scenario, dashboard (10h). Wed Stream, auto-pause, approval screen, deploy (8h). Thu README and video (5h).

**Risks**

- **Settlement timing:** the Nanopayments batch interval on testnet is unpublished, so onchain proof of a payment may lag. Fall back to Circle's Facilitator Service or direct USDC transfers.
- **Policies:** Circle Agent Wallet spending policies are mainnet only, so every guardrail must be your own code.

### 3. Liquidation-odds guard (highest ceiling, largest build)

Turns Gemini's crypto price ladders into a market-implied chance of liquidation, and an onchain vault acts on it.

- **Targets:** DeFi track, Best use of Solana, Gemini, QuickNode Streams.
- **Demo:** enter a position, see "23% chance of liquidation by Nov 30", and watch an onchain top-up fire.
- **Why it could win:** no earlier Gemini bounty winner found used the ladders this way, and DeFi primitives built on prediction markets won at Penn and USC this year.
- **Why it is risky:** 40–45 person-hours across Anchor programs, a relayer, a Stream and a frontend; the protected position is a mock because no devnet lending protocol was confirmed; ladder liquidity is thin, so the live trigger needs a manual control.
- **Terms:** keep raw quotes inside the app and send only a signed trigger onchain until Gemini answers.
- **Fallback:** port the onchain half to Solidity on Arc, which saves about a day and changes the chain award to Arc.
- **Prior attempt:** [LiqGuard](https://devpost.com/software/liqguard), flat-premium liquidation insurance on Solana, entered last year and did not place as far as the researcher could tell.

### 4. Claim-link payouts for student orgs and hackathons

Upload a list; every winner or reimbursed member gets a link, signs in with a passkey, and has dollars.

- **Targets:** Consumer track, Best use of Arc, QuickNode Streams. It matches all four Arc objectives.
- **Why it could win:** the organisers are the user. Last year's edition owed 130 participation payouts plus team prizes, and the Arc consumer field is probably thin (an inference, not a count).
- **Why it ranks below the voice wallet:** low Innovation score, since mass-payout tools exist, and no build estimate was made for this exact product. The closest, a voice remittance app with the same claim contract, was 25–30 person-hours.

## Not recommended

| Idea | Reason |
| --- | --- |
| Odds-priced cover vault (DeFi, Arc) | Pricing a contract from Gemini odds is inside the prohibited uses; similar hedging and insurance projects entered last year and did not place |
| Weather cover for Austin small businesses | Same terms problem; weather-market volume is tiny |
| Odds-history paid API | Resells Gemini data outright; thin for a track that wants a documented decision loop |
| Maker co-pilot for Gemini Liquidity Rewards | Needs a funded, verified Gemini account this week; little onchain work, so a track win is unlikely |
| Grok Bot approval desk | Depends on Grok Bot features documented only by third parties |
| Guarded agent on Solana | Circle's agent products do not support Solana, and a program-held budget probably cannot pay over x402 directly (inferred from the docs, not tested) |

**Saturated themes to avoid:** new prediction markets, fantasy leagues, trading terminals and bots; agent marketplaces and plain spend-limit wrappers; bill splitting, tip jars, loyalty stamps, and a plain "talk to your wallet".

## What has won before

- **Same organiser, last year** ([MBC 2025](https://mbc.devpost.com/), 97 projects): Solana first place went to a pay-to-email escrow, second to an options protocol, third to food ordering with USDC checkout. The Circle bounty went to phone-to-phone tap-to-pay.
- **Gemini's bounty, Penn, March 2026:** a fantasy picks app and an order-book analytics terminal.
- **The pattern, as the researcher read it:** one relatable user visible in the first minute, a deployed contract doing real work, and focused execution over half-finished ambition.
- **This year the UBC team picks track and overall winners.** Last year sponsors picked everything, so those results show sponsor taste, not the UBC team's.

Most of these come from team posts read as search excerpts, not from an official results list.

## Before you build

**Tonight**

- Confirm the idea and assign the four roles, so Monday's office hours are used on the right sponsors.
- Create the accounts the chosen idea needs: Circle Console, ElevenLabs (redeem the coupon), QuickNode.
- If a Gemini idea is still in play, start recording odds now. Gemini has no price history for contracts.

**Office hours**

| Slot (CST) | Sponsor | Ask |
| --- | --- | --- |
| Mon 6:00–7:00 PM | Circle | Passkey wallet setup on Arc testnet; the Nanopayments batch interval; faucet limits |
| Mon 7:00–8:00 PM | Gemini | Whether the data terms apply to bounty projects; whether the sandbox takes prediction-market orders |
| Tue 6:00–6:30 PM | Cursor | What "Grok Bot" means for the bounty and what counts as a chat export |
| Wed 7:00–8:00 PM | QuickNode | Credit cost per block on Arc testnet; what the hackathon credits add |

**Traps on the tools**

- **Arc:** transactions with `maxFeePerGas` under 20 Gwei are silently dropped. USDC has 18 decimals as the native token and 6 as an ERC-20.
- **QuickNode Streams:** the free trial allows one stream with webhook destinations only, and bills per block whether or not the filter matches. Pause the stream when idle.
- **Anchor:** now 1.2.x, with the TypeScript package renamed to `@anchor-lang/core`. Older tutorials and AI-generated code target the old package.
- **Circle:** Nanopayments work with plain key wallets only, not passkey smart accounts.

## Corrections to the existing research

| Claim | File | Finding |
| --- | --- | --- |
| Post Gemini-derived odds onchain, sell odds history, price a cover vault from them | 01, 02 | Conflicts with Gemini's Market Data Agreement; unresolved |
| No past winners of this organiser or of Gemini's bounty | all | Both exist; see above |
| "TRM Labs classed 89% of volume as wash, test, or internal" | 01 | The figure is Visa and Artemis's, not TRM's |
| No official Circle Facilitator Service docs | 01 | A [quickstart](https://developers.circle.com/facilitator-service/quickstart.md) for Arc testnet exists |
| No self-custody wallet combines a hold and a trusted contact | 03 | Kleidi and Fortcore do; none found with a spoken check |
| Seniors lost $7.8 billion, up 59% | 03 | The FBI figure is about $7.7 billion, up 37% |
| Grok Bot is a separate agent product | 03, README | The official guide calls it "xAI's assistant built into X"; unresolved |
| QuickNode billing unclear; Streams on Arc testnet unverified | 02, 03 | Billed per block processed; Arc testnet is supported |
| Five-day build plans | all | Four build days remain |

The research files themselves are unchanged.

## Not verified

- **Live endpoints:** neither researcher probed the Arc RPC, Solana devnet or the Gemini API today.
- **Gemini:** sandbox trading for prediction markets, state eligibility, and the fields that report a settled outcome.
- **This year's field:** the project gallery is unpublished, so how crowded each track and chain is remains a guess.
- **Eligibility:** the Devpost overview says "Students only" and the rules page says students, independent builders and community members. Confirm if anyone on the team is not a student.
- **Sponsor perks:** the ElevenLabs coupon tier and the QuickNode credit amount.
- **Your team:** whether anyone has Rust or Anchor experience or an eligible Gemini account. Neither matters for the recommended idea.
