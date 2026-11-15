# Research 03: Consumer Applications track

Researched on 2026-11-15 for the UBC 26 Hackathon (deadline Fri Nov 20, 2026, 12:00 PM CST). Requirements come from `HACKATHON.md`. Everything else comes from live web research on the same day. Claims are marked **(unverified)** where I could not confirm them against a primary source.

Two sources I could not open: the Devpost page returned HTTP 403, and I did not fetch the official Google Doc guide. The guide holds the sponsor doc links and the perk redemption steps, so the team should read it directly.

## Summary

1. **"Grok Bot" is not the `@grok` reply account on X.** It is a separate agent product launched on Aug 11, 2026: persistent "Bots" that each run on a cloud computer, sign into apps, and run scheduled or event-triggered routines. It has an X connector. This changes what the bounty asks for and what a "chat export" means. See section 2.6.
2. **The invisible-crypto stack is a solved problem.** Embedded wallets with social login, sponsored fees, and USDC as gas all work today on Solana devnet and Arc testnet. A project that only shows "no seed phrase, no gas" will not stand out. The product idea has to carry the Innovation score.
3. **Voice is the best differentiator available in this track.** A voice-controlled USDC wallet already exists as a prior hackathon project, so plain "talk to your wallet" is not new. Voice used for accessibility and for scam safety is much less covered, and the evidence for both problems is strong.

**Top pick:** a voice-first USDC wallet on Solana with a spoken read-back and a guardian hold on risky transfers (idea 1 in section 5). It targets Consumer Track Winner, Best use of Solana, the ElevenLabs bounty, the QuickNode Streams bounty, and the Grok Bot bounty.

## 1. Requirements

### 1.1 Consumer Applications track ($2,000)

The track asks for everyday apps (payments, social, gaming, creator tools, loyalty) where the crypto is invisible to the user.

| Type | Item |
| --- | --- |
| Requirement | Interact with the blockchain in some way. |
| Requirement | Provide a working, user-facing frontend (web or mobile). |
| Objective | Onboard and retain retail users by abstracting bridging, gas fees, and seed phrases. |
| Objective | Build something people would use every day, not once. |
| Objective | Intentional, thoughtful design and UX. |

A UBC representative picks the Track Winner. Devnet or testnet is fine.

### 1.2 Chain awards (pick one, judged inside the track)

| Award | Requirements | Objectives the judge will look for |
| --- | --- | --- |
| Best use of Solana, $1,500 | Core onchain functionality on Solana (devnet is fine). Program IDs in the README, with an explanation of how the project uses Solana. Using existing programs counts. | Anchor or native Rust for any program written. SPL tokens, Token Extensions, Solana Pay. Integration with existing Solana protocols. Smooth wallet experience. |
| Best use of Arc, $1,000 | Core onchain functionality on Arc (testnet is fine). Contract addresses in the README, with an explanation of how the project uses Arc. | Payment, treasury, or FX apps that use USDC as gas. Hardhat or Foundry. Circle Wallets, CCTP, Gateway, Paymaster. Simple and stable fees and balances. |

The team competes only against projects on the same chain in the same track. A Solana representative picks the Solana award and an Arc representative picks the Arc award.

### 1.3 Bounties (any number, all stack)

| Bounty | Prize | Requirements |
| --- | --- | --- |
| ElevenLabs | 3 months of Scale tier per member | ElevenLabs API or SDK as a core feature, not an add-on. Demo video shows the integration with audio. README lists which ElevenLabs products were used and how. |
| Grok Bot | Mechanical keyboard per member, plus swag | Grok Bot as a core part of the project. A Grok Bot chat export showing how it was built or used. A README section of 3–4 sentences on Grok Bot's role. Working and technically sound. |
| QuickNode Streams | $500 | Streams as a core data source. At least one Stream with a filter and a destination. README explains network, dataset, filter logic, destination, and why. |
| Gemini Prediction Markets | $2,500 / $1,000 / $500 | Use the Gemini Prediction Markets API. Not researched here. |

Each bounty also needs a main-track submission that meets the track requirements. The team must be present in person on Nov 21 to receive any prize.

### 1.4 What each judge is likely to reward

This section is my inference from the published criteria. It is not a statement from the judges.

| Judge | Likely reward |
| --- | --- |
| UBC representative (track, Official Winner) | A product a non-crypto person could use in the demo without explanation. A clear daily-use story. A polished 5-minute pitch. |
| Solana | Real onchain logic, ideally a small Anchor program, plus Solana-native primitives and a wallet flow with no visible signing friction. |
| Circle / Arc | Several Circle products combined (Wallets, Gas Station or Paymaster, CCTP or Gateway), and a UX where the user only ever sees dollars. |
| ElevenLabs | Voice that the product cannot work without. Agents that call tools and take onchain actions. Accessibility. Good audio in the video. |
| Cursor / xAI | Grok Bot doing unattended, repeated work with a visible result. The bounty text says "central to the experience, not a novelty". |

## 2. Tools and resources available now

### 2.1 Embedded wallets and account abstraction

| Tool | What it does | Chains relevant here | Setup time (estimate) | Gotchas | Docs |
| --- | --- | --- | --- | --- | --- |
| Privy | Email and social login that creates an embedded wallet. App-managed fee payer for Solana. | Solana, EVM | 1–2 hours | On Solana, sponsorship is a fee-payer wallet the app funds with SOL, not a hosted paymaster. Arc testnet support is reported by community sources only **(unverified)**. | https://docs.privy.io/wallets/gas-and-asset-management/gas/solana |
| Phantom Connect | Embedded wallet with Google and Apple login. React, Browser, and React Native SDKs. | Solana mainnet, devnet, testnet | 1–2 hours | Needs an `appId`. Embedded Ethereum support is listed as planned, so do not use it for Arc. Docs conflict on session length (7 days and 31 days). | https://docs.phantom.com/phantom-connect |
| Circle modular wallets | Passkey-backed smart accounts. `paymaster: true` turns on Gas Station sponsorship. | EVM chains including Arc testnet | 2–3 hours | Passkeys need a real domain or localhost setup. Testnet sponsorship is automatic; mainnet needs a policy in the Console. | https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn |
| Dynamic | Embedded wallets and login. Circle documents it as a signer for modular wallets on Arc testnet. | Solana, EVM, Arc testnet | 2–3 hours | May need RPC URLs supplied manually for Arc testnet. Has a documented Kora integration for Solana. | https://developers.circle.com/wallets/modular/use-dynamic-as-a-signer |
| Turnkey, Crossmint | Key infrastructure and wallet APIs. | Solana, EVM | Not assessed | I did not research these in depth. | Not checked |

Circle's release notes say Wallets and Paymaster support were both extended to Arc testnet (https://developers.circle.com/release-notes/w3s-2025).

### 2.2 Gas sponsorship

- **Solana fee payer.** Any transaction can name a second signer as fee payer. This is the simplest route: a backend keypair funded with devnet SOL co-signs. See https://solana.com/developers/cookbook/transactions/fee-sponsorship.
- **Kora.** An open-source Solana relayer that validates transactions against a policy and co-signs as fee payer. It also lets users pay fees in other tokens. Docs are at https://solana.com/docs/tools/kora/getting-started. The page returned HTTP 429 when I fetched it, so the client package name `@solana/kora` comes from a search summary **(unverified)**. For a 5-day build, a plain backend fee payer is less work than running Kora, unless the team wants a policy layer to show the Solana judge.
- **Circle Gas Station and Paymaster.** Gas Station sponsors fees. Paymaster lets users pay fees in USDC on other EVM chains. On Arc, USDC is already the gas token, so the user-facing benefit comes from Gas Station.

### 2.3 Arc

| Item | Value | Source |
| --- | --- | --- |
| Mainnet status | Public mainnet launched Sep 16, 2026. | https://www.circle.com/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet |
| Testnet chain ID | 5042002 (mainnet is 5042) | https://docs.arc.io/arc/references/connect-to-arc |
| Testnet RPC | `https://rpc.testnet.arc.io` | Same page |
| Explorer | `https://explorer.testnet.arc.io` | Same page |
| Faucet | https://faucet.circle.com | Same page |
| Gas token | USDC, 18 decimals as the native currency | Same page |
| ERC-20 view of USDC | 6 decimals at `0x3600000000000000000000000000000000000000` | https://docs.arc.io/arc/references/evm-differences |

Gotchas:

- `docs.arc.network` now redirects to `docs.arc.io`. Older guides use `rpc.testnet.arc.network` and `testnet.arcscan.app`. I did not test whether the old hosts still respond, so use the `.io` values.
- The native balance has 18 decimals and the ERC-20 view has 6. Both read the same balance. The conversion factor is 10^12. Mixing them up is the most likely bug.
- One ERC-20 transfer emits two logs, so an indexer can double-count.
- Sources disagree on whether viem ships `arcTestnet`. Check the installed version, and define the chain by hand if it is missing.

### 2.4 Solana consumer primitives

| Primitive | Use | Maturity | Docs |
| --- | --- | --- | --- |
| Solana Pay | QR and link payments. Transfer requests are simple URLs. Transaction requests let a server build any transaction. | Mature | https://solana.com/docs/tools/solana-pay/overview |
| Actions and Blinks | A transaction behind a shareable URL. | Mature spec. Whether Blinks still unfurl on X in 2026 is **unverified**; all coverage I found dates from 2024. Do not build a demo that depends on it. | https://solana.com/solutions/actions |
| Compressed NFTs (Bubblegum v2) | Cheap stamps, passes, and badges. v2 adds freeze and soulbound. | Mature. Needs an RPC with DAS API support. v2 does not support decompression. | https://developers.metaplex.com/smart-contracts/bubblegum-v2 |
| Token Extensions | Non-transferable tokens, transfer hooks, and metadata for loyalty points. | Mature. Not researched in depth. | https://solana.com/docs |
| Solana Mobile | Mobile wallet adapter and dApp Store. | Not researched in depth. A web app is the safer choice for 5 days. | Not checked |

Starters: the official templates site lists a Next.js template on `@solana/kit`, a Next.js plus Anchor template, a Gill plus Wallet UI template, and Phantom embedded starters (https://solana.com/developers/templates). The Kit template requires Node.js 24 or newer. I found no official template with Privy wired in.

### 2.5 Onramps

Coinbase Onramp has a sandbox that mimics Guest Checkout (https://docs.cdp.coinbase.com/onramp/additional-resources/sandbox-testing). I could not confirm that the sandbox delivers to Solana devnet. For a demo, a faucet-funded "add $20" button is honest and enough, as long as the README says so. The CDP faucet gives devnet USDC, and Circle's faucet covers Arc testnet.

### 2.6 Grok Bot

**What it is.** Grok Bot is an agent product from xAI (sources now call the company SpaceXAI), built with Cursor and launched in beta on Aug 11, 2026. A user creates persistent Bots. Each Bot runs on a cloud computer, signs into the user's apps and websites, and comes back when the task is done or needs approval (https://x.ai/news/introducing-grok-bot). Version 1.0 shipped on Nov 11, 2026 with Team Bots, proactive tasks, and better browser use (https://x.ai/news/grok-bot-1-0).

**What it can do today.**

| Capability | Detail | Source |
| --- | --- | --- |
| X connector | Search posts, read the timeline, check mentions. Paid users get starter X API credits. The official page does not list posting. | https://x.ai/news/grok-bot-and-x |
| Posting and DMs on X | A third-party guide says posting, liking, following, and DMs exist behind approvals, and that tagging `@bot` on X hands off a task. **(unverified)** | https://flaviocopes.com/grok-bot/ |
| Routines | Run on a schedule or from events (Slack, GitHub, inbound email). Up to 50 routines per Bot, 300 runs per hour in total. **(third-party source)** | Same guide |
| Webhook trigger | A routine exposes a POST URL and a Bearer key. A JSON body reaches the Bot. **(third-party source, unverified against official docs)** | https://www.learncursor.dev/learn/cursor-agents/grok-bot-skills-routines |
| Other connectors | Gmail, Google Calendar, GitHub (official). MCP servers and payment wallets (third-party). | https://x.ai/news/grok-bot-1-0 |
| Approvals | Risky actions raise an approval card. Cards from background work expire after 30 minutes. **(third-party source)** | https://www.learncursor.dev/learn/cursor-agents/grok-bot-approvals |

No source mentions crypto or blockchain support. A Bot would reach a chain through its cloud computer (scripts, CLIs), an MCP server, or the app's own HTTP API.

**Access.** Reports agree that paid Cursor and SuperGrok plans include it, but they disagree on which tiers. The participation prize includes X Premium, but that arrives after submission. The team needs access during the build, so check for an existing Cursor or Grok subscription and read the perk section of the official guide.

**Chat export.** I found no official export feature for Grok Bot conversations. The options I found are:

- A community tool, `grok-export-tool`, that writes Bot transcripts to Markdown and JSONL using the signed-in grok.com session (https://github.com/LofiSu/grok-export-tool). It is not published by xAI and it reads session cookies, so review it before running it.
- The whole-account data export in grok.com settings. Whether it includes Bot threads is **unverified**.
- Copying the thread by hand, or screenshots.

**Action:** ask at Cursor office hours on Tue Nov 17, 6:00–6:30 PM, what format the "chat export" must take and which tier the perk grants. This is the largest open question for this bounty.

### 2.7 ElevenLabs

| Product | Use | Notes | Docs |
| --- | --- | --- | --- |
| Agents (ElevenAgents) | Real-time voice agent with turn-taking, an LLM, and tool calls. | Tool types: client, webhook, MCP, system, and code. | https://elevenlabs.io/docs/eleven-agents/customization/tools |
| Client tools | The agent calls a function in the browser, for example "build and send this transfer". | Enable "Wait for response" so the result returns to the agent. Tool and parameter names are case-sensitive and must match the dashboard exactly. | https://elevenlabs.io/docs/eleven-agents/customization/tools/client-tools |
| React SDK | `@elevenlabs/react` with `useConversation`. The older `@11labs/*` packages are deprecated. | Confirm the current version on npm. | https://elevenlabs.io/docs/eleven-agents/libraries/react |
| Text to speech | Flash v2.5 for low latency. Eleven v3 for expressive narration. | Published latency figures conflict between two official pages. | https://elevenlabs.io/docs/models |
| Speech to text | Scribe v2 Realtime, about 150 ms, 90+ languages. | | Same page |
| Music and sound effects | Listed in the bounty objectives. Not researched. | | Not checked |

Costs and credits: secondary sources put agent time at about $0.08 per minute, with LLM cost billed separately **(unverified)**. The participation perk is one month of Creator. The official guide mentions a coupon, and I could not confirm its tier or credit amount **(unverified)**. Check https://elevenlabs.io/pricing before a long test session.

Design note for the bounty: a client tool is the cleanest way to make the agent "take onchain actions". The agent collects intent by voice, calls the tool, the browser builds and signs the transaction with the embedded wallet, and the tool result is spoken back.

## 3. Unsolved problems in consumer crypto

| Problem | Evidence | Evidence quality |
| --- | --- | --- |
| Onboarding friction | A CMU study at CHI 2025 found only 43% of respondents could identify a seed phrase. A 2026 survey of 1,000 US holders found 35% had lost access to a wallet. Vendor posts report 60–65% drop-off at wallet setup. | Mixed. The drop-off figures are vendor claims and conflict with each other. I found these through a search summary and did not open the primary studies. |
| Retention | Claims that 70% of crypto app users leave within 30 days. | Weak. Vendor content only. |
| Scams and trust | The FBI IC3 report for 2025 logged about $11.4 billion in crypto-linked losses, more than half of all reported cybercrime losses of $20.9 billion. Crypto investment fraud was $7.2 billion. Seniors reported $7.8 billion in total losses, up 59%. | Strong on totals, via news coverage of the report (https://www.theblock.co/post/397134/fbi-says-crypto-related-fraud-losses-hit-record-11-4-billion-in-2025-with-seniors-bearing-the-brunt). I did not open the FBI PDF. |
| Accessibility | A SOUPS 2023 study of MetaMask with blind users found confusing headings, poor contrast, and missing keyboard navigation. Recovery phrase checks were the hardest step. News coverage says 8 of 10 popular wallets had no accessibility features. | Strong for the paper (https://www.usenix.org/conference/soups2023/presentation/zhou). The 8-of-10 figure is from a news article. |
| Low literacy | A CHI 2009 study with 148 participants found text interfaces unusable for first-time low-literacy users. | Strong but old. I found no large recent trial of voice payments. |
| Remittance cost | The World Bank global average cost to send $200 was 6.49% in Q1 2025, against a 3% SDG target. | Strong (https://remittanceprices.worldbank.org). No 2026 figure found. |
| Loyalty, creator monetization, campus use | I did not find strong data in the time available. | Not evidenced here. |

## 4. Existing solutions

| Problem | Already built | How well covered |
| --- | --- | --- |
| Onboarding and gas | Privy, Phantom Connect, Dynamic, Circle modular wallets, Kora, Gas Station. | Fully covered as infrastructure. Do not present this as the innovation. |
| P2P stablecoin payments | Cash App began rolling out USDC in May 2026. PayPal and Venmo offer free PYUSD transfers in-network. | Heavily covered by large incumbents. A plain "Venmo on USDC" will score low on Innovation. |
| Voice wallet | VoiceVault, a voice-controlled USDC wallet using Circle wallets and ElevenLabs, from a lablab.ai and Arc hackathon (https://github.com/Abdulbasit110/voice-vault). | Covered at prototype level. Generic "talk to your wallet" is not new. Do not reuse its code: all code must be new. |
| Scam safety | Coinbase Transfer Protections add trusted contacts and thresholds inside Coinbase. Several US states now let banks hold suspicious payments. Casa added anti-social-engineering features for Bitcoin. | Covered for custodial accounts and banks. I found no self-custody consumer wallet that combines a transfer hold, a trusted contact, and a spoken check. |
| Accessibility | iWallet, a research redesign of MetaMask for blind users. | Research only. No shipped voice-first wallet found. |
| Loyalty | cNFT and Token Extension loyalty demos are common hackathon entries. | Well covered. Low novelty. |
| Recent consumer winners | Colosseum Frontier (2026) consumer-facing winners were reported as AI investing, social trading, fantasy sports pools, and a game arena. Cypherpunk (2025) Consumer first place was a prediction-market aggregator. | Consumer winners lean toward trading and speculation. Utility and safety are comparatively open. I did not open the official winner pages. |

## 5. Gaps, opportunities, and project ideas

The gaps I see are:

- No voice-first self-custody wallet built for people who cannot use a screen.
- No consumer wallet where a risky transfer triggers a hold that a family member can cancel, with a spoken check for the sender.
- Remittance apps move money but not context. The recipient gets a number, in a language and format chosen by the sender's app.
- Grok Bot is three months old. Almost no crypto project uses it, so any working integration is early.

### Idea 1 (top pick): Voice-first wallet with a guardian hold

- **Problem.** Seniors and blind or low-vision users are the least served by wallets and the most harmed by scams.
- **User.** An older adult or a low-vision user, plus one family member as guardian.
- **Demo moment.** The user says "send fifty dollars to Maria". The agent reads back the name, amount, and whether this recipient is new, then sends. Next, the user says "send two thousand dollars to a new address someone gave me on the phone". The agent asks two scam-check questions aloud, places the transfer in a timed hold, and the guardian's phone shows a cancel button. The guardian cancels and the funds return.
- **Stack.** Next.js. Phantom Connect or Privy embedded wallet on Solana devnet. Backend fee payer. USDC (SPL). A small Anchor program: an escrow vault with a time lock and a guardian cancel. ElevenLabs Agents with client tools. QuickNode Stream filtered on the program ID, delivered to a webhook. Grok Bot routine that receives each hold event, writes a plain-language summary for the guardian, and sends a weekly safety digest.
- **Prizes.** Consumer Track Winner, Best use of Solana, ElevenLabs, QuickNode Streams, Grok Bot, and an Official Winner place.
- **Feasibility.** Medium. Suggested order: voice send, balance, and history (days 1–2); Anchor hold and cancel (days 2–3); Stream and Grok Bot (day 4); polish, README, and video (day 5). If time runs short, drop Grok Bot first, then the Stream. The first two pieces alone still qualify for the track, Solana, and ElevenLabs.
- **Risks.** Speech recognition of amounts and names, which a mandatory read-back mitigates. Grok Bot access and the export format. The Grok Bot webhook trigger is documented only by a third party. Demo-room noise, so bring a headset microphone and a recorded fallback.
- **Scoring.** Technical Execution: a custom program, sponsored fees, and an event pipeline. Product and UX: one clear user and a screen-free flow. Innovation: voice as a safety control, not a novelty. Impact: backed by FBI loss data and the accessibility study. Demo: the cancelled scam transfer is easy to follow from a stage.

### Idea 2: Voice remittance on Arc

- **Problem.** Remittances cost 6.49% on average, and recipients may not read the sender's language.
- **User.** A student or worker sending money home, and a parent receiving it.
- **Demo moment.** The sender records "this is for your medicine" in English. The recipient opens a link with no wallet setup, hears the message in Spanish, and sees dollars arrive with a fee under one cent.
- **Stack.** Circle modular wallets with passkeys on Arc testnet. Gas Station. USDC, optionally EURC for an FX step. ElevenLabs speech to text and multilingual text to speech. A small Foundry contract for claim links.
- **Prizes.** Consumer Track Winner, Best use of Arc, ElevenLabs.
- **Feasibility.** Medium to high. The Circle quickstart already sends sponsored USDC on Arc testnet.
- **Risks.** No cash-out step, which judges will ask about. Voice is closer to an add-on here than in idea 1. The Arc decimals mismatch.
- **Scoring.** Strong on Product and Impact. Moderate on Innovation, since stablecoin remittance is a crowded pitch.

### Idea 3: Tag-to-pay concierge on X with Grok Bot

- **Problem.** Paying or tipping someone you only know by a social handle needs an address exchange.
- **User.** Creators and their followers.
- **Demo moment.** A user tags the bot under a post with "tip this $2". The Bot resolves the handle to an embedded wallet, sends USDC, and the creator later claims with social login.
- **Stack.** Grok Bot with the X connector and a routine that calls the app's API. Solana devnet USDC. Privy for handle-based wallets.
- **Prizes.** Consumer Track Winner, Best use of Solana, Grok Bot.
- **Feasibility.** Low to medium. Posting and tag hand-off are reported only by a third party, and tagging is reported as unavailable in some regions.
- **Risks.** High platform risk. Social tipping bots have existed for years, so novelty depends on the Bot doing more than a transfer.
- **Scoring.** Strong for the Grok Bot judge if it works. Weak fallback if it does not.

### Idea 4: Campus club pass and stamps

- **Problem.** Student clubs track attendance and perks on paper or spreadsheets.
- **User.** Club officers and members.
- **Demo moment.** A member scans a QR code at an event and a stamp appears, with no wallet prompt. Five stamps unlock a reward.
- **Stack.** Solana Pay transaction requests. Bubblegum v2 soulbound cNFTs. Embedded wallet. Fee payer.
- **Prizes.** Consumer Track Winner, Best use of Solana. QuickNode Streams could power a live leaderboard.
- **Feasibility.** High.
- **Risks.** Low novelty. Many hackathon projects look like this. There is no natural voice use, so it leaves ElevenLabs out.
- **Scoring.** Strong on Demo and UX. Weak on Innovation.

### Idea 5: Audio tip jar for buskers and creators

- **Problem.** Street performers and small creators lose tips because fewer people carry cash.
- **User.** A performer with a QR sign, and a passer-by.
- **Demo moment.** A passer-by scans, pays $3 with Apple login, and the performer's speaker plays a generated thank-you with the tipper's name.
- **Stack.** Solana Pay. Embedded wallet. ElevenLabs text to speech and sound effects.
- **Prizes.** Consumer Track Winner, Best use of Solana, ElevenLabs.
- **Feasibility.** High.
- **Risks.** Voice is decorative, so the ElevenLabs "core, not an add-on" test may fail. Tip jars are a common entry.
- **Scoring.** Good Demo. Moderate elsewhere.

### Ranking

| Rank | Idea | Prize ceiling | Feasibility | Innovation | Main reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Voice-first wallet with a guardian hold | Highest (track, Solana, three bounties) | Medium | High | Strongest evidence, clearest demo, voice is essential. |
| 2 | Voice remittance on Arc | Medium (track, Arc, one bounty) | Medium to high | Medium | Best Arc fit. The Arc field may be smaller than Solana's, which is my guess, not a fact. |
| 3 | Campus club pass | Medium | High | Low | Safe fallback with a good demo. |
| 4 | Audio tip jar | Medium | High | Low to medium | Easy, but voice is weak. |
| 5 | Tag-to-pay concierge on X | Medium | Low to medium | Medium | Depends on unverified Grok Bot features. |

**Top pick: idea 1.** It is the only idea where voice, the onchain program, and the Grok Bot each do necessary work, and it degrades safely if the later pieces slip.

## 6. Open questions and unverified items

- The required format of the Grok Bot "chat export", and whether any official export exists.
- Which subscription tier grants Grok Bot access during the build, and whether the hackathon perk covers it.
- Grok Bot webhook triggers, X posting, and `@bot` tagging. These come from third-party guides only.
- The ElevenLabs hackathon coupon tier and credit amount, and current agent per-minute pricing.
- Whether the old Arc hosts (`rpc.testnet.arc.network`, `testnet.arcscan.app`) still work.
- Privy support for Arc testnet.
- Whether QuickNode Streams supports Arc testnet. I only confirmed a QuickNode RPC host for Arc in older docs.
- Whether Blinks still unfurl on X.
- The Kora client package name and current setup steps.
- Onboarding and retention percentages, which come from vendor content.
- FBI IC3 figures, which I took from news coverage and not the report itself.
- The Devpost page and the official guide, which I could not read.

## Sources

- https://x.ai/news/introducing-grok-bot
- https://x.ai/news/grok-bot-and-x
- https://x.ai/news/grok-bot-1-0
- https://venturebeat.com/orchestration/spacexais-grok-bot-turns-agents-into-persistent-digital-coworkers-that-can-operate-your-apps-for-120-per-month
- https://keywordseverywhere.com/news/grok-updates/grok-bot/
- https://flaviocopes.com/grok-bot/
- https://www.learncursor.dev/learn/cursor-agents/grok-bot-skills-routines
- https://github.com/LofiSu/grok-export-tool
- https://www.universityblockchain.org/programs/hackathon
- https://docs.arc.io/arc/references/connect-to-arc
- https://docs.arc.io/arc/references/evm-differences
- https://www.circle.com/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet
- https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn
- https://developers.circle.com/wallets/modular/use-dynamic-as-a-signer
- https://developers.circle.com/release-notes/w3s-2025
- https://elevenlabs.io/docs/eleven-agents/customization/tools
- https://elevenlabs.io/docs/eleven-agents/customization/tools/client-tools
- https://elevenlabs.io/docs/eleven-agents/libraries/react
- https://elevenlabs.io/docs/models
- https://elevenlabs.io/hackathon
- https://docs.privy.io/wallets/gas-and-asset-management/gas/solana
- https://docs.phantom.com/phantom-connect
- https://solana.com/docs/tools/kora/getting-started
- https://solana.com/docs/tools/solana-pay/overview
- https://solana.com/developers/templates
- https://developers.metaplex.com/smart-contracts/bubblegum-v2
- https://docs.cdp.coinbase.com/onramp/additional-resources/sandbox-testing
- https://www.theblock.co/post/397134/fbi-says-crypto-related-fraud-losses-hit-record-11-4-billion-in-2025-with-seniors-bearing-the-brunt
- https://www.usenix.org/conference/soups2023/presentation/zhou
- https://remittanceprices.worldbank.org
- https://microsoft.com/en-us/research/wp-content/uploads/2016/02/medhi_chi2009.pdf
- https://github.com/Abdulbasit110/voice-vault
- https://cryptobriefing.com/coinbase-transfer-protections-account-security/
- https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/
