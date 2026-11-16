# Implementation Details: Guardian Voice Wallet

**Status: proposal for the team to decide on. Nothing is built yet.** Written 2026-11-15. It turns the recommended idea in [`IDEAS.md`](IDEAS.md) into a concrete design, with the changes made during a design review the same evening. The rules and prizes are in [`HACKATHON.md`](HACKATHON.md).

**Deadline:** Fri Nov 20, 12:00 PM CST. All four of us must be in Austin on Sat Nov 21 to receive any prize.

## What we are building

A dollar account that an adult child sets up for an older or low-vision parent. The parent pays known people by voice. Anything unusual (a new recipient, a large amount, a change to the safety settings) is held for a set time, and the family member, as guardian, can cancel it from their phone.

- **Track:** Consumer Applications
- **Chain award:** Best use of Arc
- **Bounties:** ElevenLabs, QuickNode Streams
- **Not targeting:** Gemini, Grok Bot

**The pitch leads with the hold, not the voice.** A plain talking wallet is the most common ElevenLabs entry. A hold that the contract enforces and a guardian can cancel is what the others do not have.

## Prizes we can win, and why we are not chasing Solana or Gemini

Added 2026-11-16, after the question came up of swapping in Best use of Solana and the Gemini bounty because they pay more.

**What this project can win.** The rules allow exactly one main track, and the other prizes stack on top of it.

| Prize | Amount | Who picks |
| --- | --- | --- |
| Consumer Track Winner | $2,000 | UBC representative |
| Best use of Arc (within Consumer) | $1,000 | Arc representative |
| QuickNode Streams bounty | $500 | QuickNode and UBC |
| ElevenLabs bounty | 3 months of Scale tier per member | ElevenLabs and UBC |
| Official UBC Winner | $2,500 / $1,000 / $500 (1st also gets 3 months of ElevenLabs Pro per member) | UBC team |

Winning all of them would be $6,000 in cash plus the ElevenLabs perks. The participation prize comes on top for any complete, working submission. None of it is paid unless the whole team is in Austin on Sat Nov 21.

**What it cannot win.**

- The Agentic Payments and DeFi tracks, because only one main track is allowed.
- Best use of Solana, because it cannot be combined with Best use of Arc.
- The Gemini bounty, because the project does not use the Gemini Prediction Markets API.
- Grok Bot is allowed by the rules but we are not targeting it (see the top of this document).

**Recommendation: keep the plan as it is.** The reasons, one per proposed change:

- **Dropping ElevenLabs gains nothing.** Bounties stack without limit, so ElevenLabs does not block Gemini or Solana. Voice is also half of the demo.
- **Gemini cannot be added on.** The bounty needs the Prediction Markets API doing real work in the product. Prediction markets inside a scam-protection wallet for older users contradicts the pitch, so entering Gemini means building a different project.
- **Solana instead of Arc is $500 more for a weaker position.** It adds an estimated 6–10 hours in Anchor and Rust, and nobody on the team has deployed a contract. The Circle passkey wallet in this plan is the Arc one, so the wallet work would restart. Voice wallets have already won Solana prizes twice (see [`IDEAS.md`](IDEAS.md)).
- **Solana and Gemini together is the liquidation-odds guard** from [`IDEAS.md`](IDEAS.md). Its ceiling is $9,000 against $6,000 here. It is also the largest build (40–45 person-hours), was ranked last for buildability, and sits in the most crowded theme. Gemini's data terms may prohibit its core mechanism, and that question is still open.

A higher ceiling is not a higher expected result. The extra $3,000 on paper does not make up for lower odds in a larger field with four build days left.

**What would change this.**

- The belief that the Arc consumer field is thinner is a guess. The project gallery is unpublished, so nobody has counted.
- If someone on the team has shipped an Anchor program, the Solana estimate above is too pessimistic. Say so.

**If the team still wants the Gemini money,** the only switch worth considering is the guarded research agent on Arc: Agentic Payments track, the same chain and tools, and the same $6,000 ceiling with an Official Winner place. It needs the redesign described in [`IDEAS.md`](IDEAS.md) and Gemini's answer on the data terms. Gemini office hours are today, Mon Nov 16, 7:00–8:00 PM CST. Decide tonight; a switch after today leaves too little time.

## Decisions to confirm as a team

Each was the recommended option in the review. Changing one may change the sections below it.

| # | Decision | Proposed answer | Why |
| --- | --- | --- | --- |
| 1 | Chain | Arc testnet, Solidity with Foundry | Nobody on the team has deployed a contract; Solidity is the faster one to learn, and the Arc consumer field looks thinner |
| 2 | Where the dollars live | In the vault contract, not in the user's wallet | The hold cannot be skipped, and the app only ever calls one contract |
| 3 | Where the rules run | In the contract | The rules are deterministic, so no backend or browser code has to be trusted |
| 4 | How the guardian signs | Their own passkey wallet | Reuses the user's wallet code; no server holds a key that can block funds |
| 5 | Changing contacts, limit or guardian | Same time-locked hold; the guardian can cancel | Closes the "add me as a contact first" bypass with one mechanism |
| 6 | Release after the lock | A server keeper, triggered by the QuickNode Stream | Gives the Stream real work, which the QuickNode bounty asks for |
| 7 | Lock length | Set per account: 60 seconds in the demo, 24 hours in the pitch | Lets the full hold-and-release cycle be shown on stage |
| 8 | If gas sponsorship fails on Arc | The passkey wallet pays its own fees in USDC | Arc's gas token is USDC, so the user still only holds dollars |
| 9 | Final confirmation of a transfer | App reads back recipient and amount, then the passkey prompt | The model proposes and can never sign; one step, no misheard "yes" |
| 10 | Target user | Family-managed dollar account | Answers "why would a senior install this"; the guardian is a real user |
| 11 | Stage demo | Live voice with push-to-talk, a headset and a typed fallback | Live voice is the memorable part; the fallback limits the damage |

## Architecture

```
 Parent's browser                         Guardian's browser
 ┌───────────────────────────┐            ┌──────────────────────┐
 │ ElevenLabs voice agent    │            │ Guardian page        │
 │   └ client tools          │            │   pending holds      │
 │ Passkey wallet (Circle)   │            │   Cancel button      │
 └────────────┬──────────────┘            │ Passkey wallet       │
              │ send / propose / cancel   └──────────┬───────────┘
              ▼                                      │ cancel
        ┌──────────────────────────────────────────────┐
        │ GuardianVault contract on Arc testnet        │
        │ balances, contacts, limit, guardian, holds   │
        └───────────────┬──────────────────────────────┘
                        │ events
                        ▼
        QuickNode Stream (filter: vault address + hold events)
                        │ webhook
                        ▼
        ┌──────────────────────────────────────────────┐
        │ Backend                                      │
        │  - stores holds, feeds the guardian page     │
        │  - keeper wallet calls release at lock end   │
        └──────────────────────────────────────────────┘
```

## The contract: `GuardianVault`

One contract holds every account, keyed by the owner's wallet address. Target size is about 120 lines plus tests.

**Per account**

- `balance`: dollars held for the owner
- `guardian`: address allowed to cancel
- `limit`: largest amount that goes straight through to a trusted contact
- `delay`: how long a hold lasts, in seconds
- `contacts`: addresses the owner has approved

**Functions**

| Function | Who can call | What it does |
| --- | --- | --- |
| `open(guardian, limit, delay, contacts[])` | Owner, once | Creates the account. This is the only time settings apply at once. |
| `deposit(amount)` | Anyone, for an owner | Adds dollars to the owner's balance |
| `send(to, amount)` | Owner | If `to` is a contact and `amount <= limit`, pays now. Otherwise creates a transfer hold. |
| `proposeContact(addr)`, `proposeLimit(newLimit)`, `proposeGuardian(addr)` | Owner | Creates a settings hold |
| `cancel(holdId)` | Owner or guardian | Cancels a pending hold. A transfer hold returns the dollars to the balance. |
| `release(holdId)` | Anyone, after the lock ends | Pays the transfer, or applies the settings change |
| `removeContact(addr)`, `lowerLimit(newLimit)` | Owner | Applies at once, because it only makes the account stricter |

**Rules worth stating in the README**

- A transfer to the owner's own wallet is not a trusted contact by default, so a withdrawal is held like any other unusual transfer.
- The keeper can only call `release`, which pays the recipient already stored in the hold. It cannot redirect funds.
- The guardian can cancel but cannot move funds or change settings.
- There is no daily cap in this version: several transfers under the limit to a trusted contact all go through. See [Open questions](#open-questions).

**Events** (what the Stream filters on): `HoldCreated(holdId, owner, kind, to, amount, releaseAt)`, `HoldCancelled(holdId, by)`, `HoldReleased(holdId)`, `Sent(owner, to, amount)`.

**Tests to write first:** a trusted send pays at once; a send to a new address is held; a send over the limit is held; the guardian cancels and the balance is restored; a stranger cannot cancel; release fails before the lock ends and works after; a proposed contact is not trusted until released.

## Wallets

- **Library:** `@circle-fin/modular-wallets-core` with viem. Circle's [quickstart](https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn.md) uses Arc testnet, and Circle's supported-blockchains page lists Arc for modular wallets.
- **Setup needed:** a client key and a passkey domain in the Circle Console. The passkey domain must match the site's domain, so decide the deployed domain early.
- **Parent and guardian** each get a passkey wallet. The guardian creates theirs from an invite link.
- **Gas sponsorship is not confirmed.** Circle's Gas Station page lists Arc testnet for user-controlled and developer-controlled wallets, not for modular wallets. Test it first thing Monday. If it fails by noon, fund each wallet with a small USDC balance at onboarding and let it pay its own fees.
- **Browser:** build and demo on Chrome. Safari may refuse a passkey prompt that was not started by a tap; this is from memory and untested.

## Voice

- **Product:** ElevenLabs Agents through `@elevenlabs/react`, with the tools running in the browser.
- **Tools the agent can call:** `get_balance`, `list_contacts`, `prepare_send(contact_name, amount)`, `list_holds`, `cancel_hold(hold_id)`, `propose_contact(name, address)`.
- **The agent never signs.** `prepare_send` resolves the name against the contacts list, fills a confirmation card and reads it back from the app's own data. The passkey prompt is the confirmation.
- **Recipients come only from the contacts list.** The agent does not take a spoken address.
- **When a send will be held,** the agent says so, gives the release time, and asks two or three fixed scam-check questions (for example, "Did someone you have not met in person ask you to send this?"). The questions inform the user; the contract, not the answers, decides the hold.
- **Development:** use text-only mode to save voice minutes. The free plan has 15 agent minutes a month and the coupon tier is unknown.
- **Fallbacks:** push-to-talk, and a typed input that is always on screen.

## Stream, backend and keeper

- **Stream:** one QuickNode Stream on Arc testnet, filtered to the vault address and the four events above, delivered to a webhook. Streams bill per block whether or not the filter matches, so keep it paused when nobody is testing.
- **Webhook:** stores each hold, marks it cancelled or released, and updates the guardian page.
- **Guardian page:** lists pending holds with recipient, amount and time left, and a Cancel button that signs with the guardian's passkey.
- **Keeper:** a server wallet funded with testnet USDC. When a hold's lock ends, it calls `release`. It needs a process that can wait 60 seconds, which a serverless function cannot do on its own; see [Open questions](#open-questions).
- **Arc traps:** a transaction with `maxFeePerGas` under 20 Gwei is silently dropped. USDC has 18 decimals as the native token and 6 as an ERC-20.

## Frontend

Next.js, one app with two views.

- **Parent view:** balance, a large talk button, the confirmation card, a list of recent and held transfers, the typed input.
- **Guardian view:** invite acceptance, pending holds, Cancel.
- **Onboarding:** the family member creates the account, sets contacts, limit and delay, and names themselves guardian.
- **Accessibility:** large type, high contrast, every action reachable by voice or keyboard, and spoken confirmation of every result.

## Demo script

1. "Send fifty dollars to Maria." Read-back, Face ID, paid at once.
2. "Send two thousand dollars to Alex." Alex is not a contact. The agent asks the scam questions and says the transfer is held for 60 seconds.
3. The guardian's phone shows the hold. The guardian cancels. The parent's balance is restored.
4. Repeat a held transfer and let it run: the keeper releases it when the lock ends.
5. Try the bypass: "add Alex as a contact." That is held too.

## Work split

Names to be assigned.

| Role | Owns |
| --- | --- |
| Voice | ElevenLabs agent, browser tools, read-back, scam questions, push-to-talk, typed fallback |
| Contract and wallet | `GuardianVault` with tests, deployment to Arc testnet, passkey wallets for parent and guardian, the gas decision |
| Frontend and Stream | Parent and guardian views, QuickNode Stream, webhook, keeper |
| Demo and submission | Office hours, README, architecture diagram, video with audio, Devpost form, stage rehearsal |

## Schedule

| Day | Goal |
| --- | --- |
| Mon morning | Three tests, each with a noon decision: a sponsored transfer from a passkey wallet on Arc; a contract deployed and called from that wallet; the ElevenLabs agent calling a browser tool in text-only mode |
| Mon | Each piece works alone: vault deployed with tests passing, agent against a mock wallet, both views with fake data. Circle office hours 6:00 PM. |
| Tue | End to end: a voice send pays, a risky send is held, the guardian cancels. If this is not working by Tuesday night, cut the settings holds before anything else. |
| Wed | Stream, webhook and keeper; settings holds; accessibility pass; rehearse in a noisy room. QuickNode office hours 7:00 PM. |
| Thu | Deploy, README, video; feature freeze in the evening; make the repo public |
| Fri | Submit by 10:00 AM |

## Open questions

- **The repo.** `Rebootroma/UBC-2026` is private and must be public for submission. The `research` branch, `IDEAS.md` and this strategy material would then be readable by judges. Proposed: move the notes to a private location and delete the remote `research` branch before going public on Thursday.
- **Which USDC interface the vault uses.** Native USDC is less code (a payable deposit, no approval step) but uses 18 decimals. The ERC-20 interface uses 6 decimals, which matches most Circle examples, but needs an approval before each deposit. Decide during Monday's contract test.
- **Where the keeper runs.** It needs a long-running process or a scheduler with one-minute resolution. Options are a small always-on server or a cron job that sweeps for holds past their lock.
- **Daily cap.** Whether to add a per-day total to stop many small transfers to a trusted contact. Proposed: leave out, and name it as the next step.
- **How the guardian is notified.** The guardian page updates live. Email or a push notification is extra work; decide on Wednesday.
- **Gas sponsorship on Arc for modular wallets.** Ask Circle on Monday at 6:00 PM whichever way the morning test goes.
- **Eligibility.** The Devpost overview says "Students only"; the rules page also lists independent builders. Confirm if anyone is not a student.
- **Senior fraud figure.** `IDEAS.md` cites both $4.4 billion and $7.7 billion. Check the FBI report before either goes on a slide.
