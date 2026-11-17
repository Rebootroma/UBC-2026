# Research 06: Solana ideas that do not depend on Gemini

Scope: project ideas on Solana for any of the three main tracks, with more technical depth than the guardian voice wallet, buildable by four TypeScript developers between Mon Nov 16 evening and Thu Nov 19. Researched on 2026-11-16 against live docs, the npm and crates.io registries, and the public devnet RPC. Requirements come from [`../HACKATHON.md`](../HACKATHON.md). Earlier findings in [`../IDEAS.md`](../IDEAS.md) and reports 01–03 are reused, not repeated.

Verification labels:

- **Probed** means I called the endpoint or ran the code myself on 2026-11-16 and saw the stated result.
- **Docs** means the claim comes from an official doc page, spec, or repository README that I fetched.
- **Secondary** means press, blogs, or search summaries, not confirmed at the source.
- **Unverified** means I could not confirm it. Section 10 lists every such item that affects a decision.

## 0. Bottom line

1. **The team can reach real depth on Solana without writing Rust.** The strongest case is Token-2022 Confidential Balances. The ZK ElGamal proof program was switched off in June 2025, came back on mainnet on 2026-06-17 (Secondary), and is executing successfully on devnet today (Probed). The official JavaScript client now ships high-level helpers that generate the zero-knowledge proofs in WebAssembly and sequence the transactions (Docs). Before this year that flow was Rust-only.
2. **Top pick: Sealed, private payouts with verifiable payslips** (idea 1). Amounts are encrypted onchain, an auditor key can read them, and a recipient can prove one payment to a third party without handing over any key. No custom program. Stack: Consumer track $2,000 + Best use of Solana $1,500 + QuickNode Streams $500 = **$4,000**, plus an Official Winner place. That is $500 above the guardian wallet's ceiling and far deeper technically.
3. **No idea in this angle reaches the $6,000–6,500 ceiling of the Gemini ideas.** Without the Gemini bounty, every Solana stack tops out at $4,000 plus an Official Winner place. ElevenLabs is not a natural fit for any of these, and I could not establish what Grok Bot is, so neither is counted.
4. **The DeFi track is the weak spot.** Jupiter and marginfi are not on devnet (Probed), Drift is still recovering from its April 2026 exploit (Secondary), and a DeFi entry with no program of its own will look thin next to last year's options protocol. I do not recommend a DeFi idea from this angle.
5. **One decision rests on a test I could not run.** The public devnet RPC faucet is closed (Probed), so I could not fund a wallet and run a confidential transfer from my own code. Everything short of that is confirmed. The team should run the official example first thing; section 6.1 gives a go/no-go gate and a fallback.

## 1. What is usable on devnet today, from TypeScript

"On devnet" in the Probed rows means `getAccountInfo` on `api.devnet.solana.com` returned an executable program account for that ID on 2026-11-16. Package versions were read from the npm registry the same day.

| Tool | Devnet | TypeScript SDK (latest, date) | Custom program needed | Traps |
| --- | --- | --- | --- | --- |
| SPL Token, Token-2022 `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Yes (Probed) | `@solana-program/token-2022` 0.20.1 (2026-11-04), needs `@solana/kit` ^8.5. Legacy `@solana/spl-token` 0.4.15. | No | Extensions must be chosen at mint creation; most cannot be added later. |
| Confidential Balances (Token-2022) + ZK ElGamal proof program `ZkE1Gama1Proof11111111111111111111111111111` | Yes. Successful `ConfigureAccount`, `Deposit`, `ApplyPendingBalance`, `Transfer`, `Withdraw` transactions landed on devnet at 18:16–18:17 UTC today (Probed). | `@solana-program/token-2022/confidential` helpers, `@solana/zk-sdk` 0.5.4 (WASM, 2026-10-08), `@solana-program/zk-elgamal-proof` 0.5.0 ([integration guide](https://solana.com/docs/tokens/extensions/confidential-transfer/integration-guide), Docs). | No | See idea 1. Hides amounts and balances, not addresses. Devnet USDC is a legacy SPL token with no confidential extension (Probed), so the demo needs its own dollar mint. |
| Transfer hooks | Yes | Client helpers exist in both token clients | **Yes.** The hook is a program you deploy. | Extra-account resolution on every transfer; wallet support varies (Unverified). |
| Permanent delegate, non-transferable, default-frozen, pausable, interest-bearing, metadata | Yes (same program) | Same clients | No | Interest-bearing only changes the displayed amount. Permanent delegate triggers wallet warnings. |
| Token ACL (sRFC 37) `TACLkU6CiCdkQN2MjoyDkVg2yAH9zkxiHDsiztQ52TP` | Program present (Probed). The README names mainnet only ([repo](https://github.com/solana-foundation/token-acl), Docs). | `@token-acl/sdk` 0.2.7 (2025-11-24), pinned to `@solana/kit` ^5 and `token-2022` 0.6.1 | No, if the reference gate program is deployed on devnet (Unverified) | Old dependency pins. Reference gate is labelled not production-ready ([guide](https://solana.com/docs/tokenization/token-acl), Secondary). |
| Solana Pay | n/a | `@solana/pay` 1.0.26 (2026-07-31), needs `@solana/kit` ^6.9 | No | Kit version differs from the Token-2022 client. |
| Actions and Blinks | n/a | `@solana/actions` 1.6.6, **last published 2024-11-05** | No | Stale SDK. Whether Blinks unfurl on X is still Unverified. Do not build a demo on them. |
| Compressed NFTs, Bubblegum `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY` | Yes (Probed) | `@metaplex-foundation/mpl-bubblegum` 6.0.0 (2026-09-22) | No | Reading needs an RPC with the DAS API. |
| Squads v4 `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf` and Smart Account `SMRTzfY6DfH5ik3TKiyLFfXexV8uSG3d2UksSCYdunG` | Yes, both (Probed) | `@sqds/multisig` 2.1.4 (2025-06-16, `@solana/web3.js` v1). Hosted API: `@sqds/grid` 3.2.0 (2026-11-14) with a devnet header ([quickstart](https://developers.squads.so/squads-api/api-reference/v1/quickstart), Secondary). | No | Spending limits are set through config transactions ([docs](https://docs.squads.so/main/development/reference/spending-limits), Docs). Field names and the destination allowlist are from my memory of the v4 SDK (Unverified). |
| Subscriptions and allowances (Solana Foundation) `De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44` | Yes (Probed), also mainnet | `@solana/subscriptions` 0.5.0 (2026-08-10), a `@solana/kit` ^7 plugin | No | Fixed, recurring, and plan-based delegations; audited by Cantina ([repo](https://github.com/solana-foundation/subscriptions), Docs). Closing the authority is not a kill switch; use `revokeDelegation`. |
| Streamflow `HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ` | Yes (Probed) | `@streamflow/stream` 13.4.0 (2026-08-31), `@solana/web3.js` v1 | No | Depends on the old `@coral-xyz/anchor` 0.32. |
| Jupiter v6 | **No** (Probed: not executable on devnet) | `@jup-ag/api` 6.0.48 | n/a | Mainnet only. Use Orca on devnet if a swap is needed. |
| Lending | Kamino `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD` program present (Probed); whether any funded market exists is Unverified. marginfi absent (Probed). | `@kamino-finance/klend-sdk` 13.1.0 | n/a | Do not plan on borrowing from a real protocol on devnet. |
| Drift | Program present (Probed) | `@drift-labs/sdk` latest tag is a beta from 2026-05-11 | n/a | Exploited for about $280–295M on 2026-04-01 and still relaunching ([recovery plan](https://www.drift.trade/updates/recovery-plan-for-affected-users), Secondary). Avoid. |
| Orca Whirlpools, Meteora DLMM | Yes, both (Probed) | `@orca-so/whirlpools` 8.0.1 | No | You must create and fund your own pool. |
| Pyth pull oracle `rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ` | Yes (Probed) | `@pythnetwork/pyth-solana-receiver` 0.17.0 | No | |
| Lighthouse assertions `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` | Yes (Probed) | `lighthouse-sdk` 2.1.0 (2025-05-12), pinned to `@solana/kit` ^2.1 | No | Old Kit pin. Assertions add bytes to the transaction ([QuickNode guide](https://www.quicknode.com/guides/solana-development/tooling/solana-kit/lighthouse), Docs). |
| Solana Attestation Service `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` | Yes (Probed) | `sas-lib` 1.0.10 (2025-11-19), `@solana/kit` ^5 | No | Old Kit pin. |
| x402 on Solana | Facilitator covers devnet (report 01) | `@x402/svm`, `@x402/fetch`, `@x402/express` 2.31.0 (2026-11-12) | No | The `exact` scheme accepts Lighthouse assertion instructions and has an opt-in smart-wallet path that allowlists Squads and Swig ([spec](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md), Docs). |
| Solana Agent Kit | n/a | `solana-agent-kit` 2.0.10, **2025-09-24** | No | No release in 14 months. Write the three tools you need by hand. |
| Passkeys | secp256r1 precompile present (Probed) | `@lazorkit/wallet` 3.4.1 (2026-10-05); Privy and Phantom Connect per report 03 | No | A passkey smart wallet is a program-owned account, which complicates owner-signed flows such as confidential account setup. |
| Gasless | Native: any transaction can name a second signer as fee payer | `@solana/kora` 0.2.1 for a policy relayer | No | A plain backend fee payer is less work than Kora. |
| Transaction format v1 (4,096 bytes) | Live. Devnet is on `4.5.0-beta.0` and I read a v1 transaction that carried a whole confidential transfer (Probed). | `@solana/kit` 8.6.0 | n/a | RPC calls need `maxSupportedTransactionVersion: 1`. Wallet and QuickNode support for v1 is Unverified. |
| Anchor | n/a | `anchor-cli` and `anchor-lang` 1.2.2 on crates.io (updated 2026-11-14); `@anchor-lang/core` 1.2.2 (2026-10-28). `@coral-xyz/anchor` is frozen at 0.32.1 (2025-10-10). | n/a | Confirms the note in IDEAS.md. Most tutorials and AI output still target the old package. |

**Answer to the feasibility question.** Composing existing programs from TypeScript covers payments, private payments with zero-knowledge proofs, permissioned tokens, capped allowances, multisig budgets, streaming, receipts, attestations, and onchain assertions. It does not cover a rule that must run inside every token transfer (that is a transfer hook), or any new DeFi primitive.

## 2. Traps that cut across every idea

- **The devnet RPC faucet is closed.** `requestAirdrop` returns "The RPC faucet is closed on this cluster. Request test SOL at https://faucet.solana.com" (Probed). Every wallet, including the fee payer, must be funded through the web faucet. Its limits are Unverified. Fund on day one and keep one treasury wallet.
- **SDK versions do not line up.** The Token-2022 client needs Kit 8, Subscriptions needs Kit 7, Solana Pay needs Kit 6, SAS and Token ACL need Kit 5, Lighthouse needs Kit 2, and Squads, Streamflow and LazorKit need `@solana/web3.js` v1 (all Probed on npm). `@solana/web3.js` latest on npm is now 3.2.1. Plan one package per protocol in a workspace, or build the few instructions you need by hand. Do not put them in one `package.json`.
- **Official examples lag the packages.** The confidential-transfer doc page pins `token-2022` ^0.12 and Kit ^6.10 while the registry is at 0.20.1 and 8.6.0 (Probed). The latest packages install cleanly together and export the documented helpers (Probed), but expect small API drift.
- **QuickNode Streams on Solana offers two datasets, Block and Programs + Logs** ([supported chains](https://www.quicknode.com/docs/streams/supported-chains), Docs). The free trial allows one Solana stream, bills per block, and has no backfill (report 02).
- **Nobody on the team has the Solana toolchain.** The machine I ran on has no `cargo`, `solana`, or `anchor` (Probed). Any idea with a custom program starts with an install.

## 3. If a small custom program is unavoidable

Honest estimate for a team with no Rust, using AI coding tools:

| Item | Estimate |
| --- | --- |
| Toolchain: Rust, Agave CLI (latest release v4.4.1), Anchor 1.2.2 through `avm` | 1–3 hours per machine. Do it on one machine only. |
| A transfer hook of about 120 lines adapted from the official allowlist example, with its `ExtraAccountMetaList` | 8–12 hours for one person, most of it fighting account resolution and Anchor 1.x differences from what the AI writes |
| Tests on a local validator, then devnet deploy | 4–6 hours |
| Client integration (every transfer must pass the extra accounts) | 3–5 hours |
| **Total** | **16–25 person-hours, one person for two days** |

What can go wrong: a program deploy needs a few SOL of rent, and the only faucet is the web one. AI tools generate Anchor 0.29–0.31 code against `@coral-xyz/anchor`. A hook that fails closes every transfer of the token.

What is realistic: one program with one instruction and one config account. Not realistic in three days for this team: an escrow with dispute logic, a vault with share accounting, or anything that makes CPI calls into another protocol.

Rule for the plan: the custom program must be an upgrade to something that already demos without it. Idea 3 is built that way.

## 4. What has won, what is saturated, where the gaps are

**Same organiser, last year (MBC 2025).** Per IDEAS.md: pay-to-email escrow first, an options protocol second, USDC food ordering third. One listing puts last year's Solana first prize at $7,500 ([allhackathons](https://allhackathons.com/hackathon/midwest-blockchain-conference-hackathon-2025), Secondary). I found no official results page and added nothing new here.

**2026 elsewhere.**

- Colosseum Frontier (April–May 2026, 2,857 submissions): the top prize went to a DePIN project, and the organisers said the strongest entries came from the stablecoin track ([Solana Compass](https://solanacompass.com/news/colosseum-announces-26-winners-of-the-solana-frontier-hackathon-the-largest-crypto-hackathon-ever), [Blockworks](https://blockworks.com/news/solana-data-startup-wins-hackathon), Secondary).
- Solana Privacy Hack (January 2026) had a confidential-transfers track ([solana.com/privacyhack](https://solana.com/privacyhack), Secondary). It ran while the native proof program was disabled on mainnet, so entries leaned on third-party privacy stacks. That last point is my inference from the dates.
- Private payroll has been attempted with third-party privacy layers: [KavachPay](https://block-programr.github.io/projects/KavachPay/) on MagicBlock rollups (March 2026), [ghost-pay](https://github.com/n4beel/ghost-pay) on Cloak (Frontier), and Cloak itself as a product ([Solana Compass](https://solanacompass.com/news/cloak-launches-private-payroll-on-solana-for-usdc-and-usdt-salaries)). All Secondary.
- Agent guards that simulate before signing already exist on Solana: [AgentGuard](https://github.com/0xAxiom/agentguard) and a devnet "agent wallet runtime" prototype (Secondary).

**Saturated, per IDEAS.md and the above:** voice wallets, prediction markets, trading bots, agent marketplaces, plain spend-limit wrappers, tip jars, loyalty stamps, bill splitting. Add: agent "simulate then sign" guards without anything new on top.

**Gaps I found.**

| Gap | Why it is open |
| --- | --- |
| Native Token-2022 Confidential Balances driven from TypeScript | Mainnet re-enabled five months ago; the JS proof client was first published 2026-04-25 (Probed on npm). An earlier builder reported the tooling was Rust-only ([Private Pass write-up](https://aseneca.substack.com/p/building-private-pass-token-gated), Secondary). I found no hackathon entry using the native helpers (Unverified: absence of evidence). |
| Proving one confidential payment to a third party without sharing keys | The official guide says sharing keys "discloses every confidential account, not just one" (Docs). The proof primitive to avoid that is in the WASM SDK (Probed). |
| The Solana Foundation Subscriptions program in a consumer product | Program is about six months old. No hackathon use found (Unverified). |
| Lighthouse assertions inside x402 payments | The x402 Solana spec explicitly permits them (Docs). No agent project found that uses them (Unverified). |

## 5. Where the bounties fit

| Bounty | Fit |
| --- | --- |
| QuickNode Streams, $500 | Natural in ideas 1–4. Solana devnet is supported with Block and Programs + Logs datasets (Docs). In each idea the Stream is the only source for a ledger or an alert, which is what "core data source" asks for. |
| ElevenLabs, non-cash | Not natural in any idea here. Adding a voice layer would be the add-on the bounty text rules out. I count it in no stack. |
| Grok Bot, non-cash | Still unresolved. IDEAS.md records the guide calling it "xAI's assistant built into X". I found nothing new and count it in no stack. |
| Gemini | Out of scope for this report. |

## 6. Ideas

### 6.1 Idea 1 (top pick): Sealed, private payouts with verifiable payslips

Pay a team in dollars onchain without publishing what each person earns. Each person can later prove one payment to a landlord or lender without revealing anything else.

**Problem.** Paying people on a public chain publishes every salary, bonus and contractor rate, and anyone can set alerts on a known payroll wallet ([American Banker](https://www.americanbanker.com/payments/news/paxos-aleo-add-privacy-to-new-stablecoin), Secondary). Vendors call this the last blocker for stablecoin payroll; Toku, Paxos and Aleo launched a private payroll product in January 2026 for that reason ([Toku](https://www.toku.com/resources/aleo-toku-and-paxos-labs-launch-first-private-stablecoin-payroll-solution-removing-the-final-barrier-to-enterprise-stablecoin-adoption), Secondary, vendor source). The same applies to a student organisation paying stipends or a hackathon paying prizes. The second half of the problem: a person paid in stablecoins has nothing to show a landlord except a public wallet, which exposes everything.

**Why current solutions fall short.** The shipped answers move payroll to another chain (Aleo, Canton) or route it through a separate privacy protocol or rollup (Cloak, MagicBlock), some charging a percentage per withdrawal (Secondary). Solana's native mechanism lets an owner share decryption keys, but that reveals every confidential balance they hold (Docs).

**Tools.**

- Token-2022 mint with the `ConfidentialTransferMint` extension, auto-approved accounts and an auditor key. Created with `getCreateMintInstructionPlan` (Docs).
- `@solana-program/token-2022/confidential`: `getCreateConfidentialTransferAccountInstructionPlan`, `getConfidentialTransferInstructionPlan`, `getConfidentialWithdrawInstructionPlan`, `getApplyConfidentialPendingBalanceInstructionFromToken`, `deriveConfidentialKeys` (Docs, and present in 0.20.1, Probed).
- `@solana/zk-sdk` 0.5.4 for proofs and key derivation, including `ConfidentialKeys.fromPrf` for passkeys (Docs).
- A backend fee payer for gasless use. Next.js. QuickNode Streams.

**What I measured (Probed, Node 24, WASM build).** A batched range proof generates in about 38 ms and is 1,000 bytes. A zero-ciphertext proof generates and verifies in under 1 ms and is 192 bytes. Proof generation is not the bottleneck; transaction confirmation is.

**The payslip proof, which is the new part.** Take the encrypted amount from the onchain transfer, subtract the claimed amount homomorphically (`ElGamalCiphertext.subtractAmount`), and produce a `ZeroCiphertextProofData` with the recipient's key. I ran this: a true claim verifies, a false claim is rejected with "cryptographic component mismatch" (Probed). The verifier page rebuilds the ciphertext from chain data, so the proof is bound to a real payment. That binding step is not tested end to end (Unverified); the transfer splits the amount into low and high parts, and `combineLoHi` exists for that (Probed as an export only).

**What already exists, and what is new.** Private payroll exists as a category (section 4). New here: native Token Extensions with no third-party privacy layer, an auditor view from the mint's auditor key, and a per-payment proof that solves a limitation the official docs name. Honest limit: addresses and who-pays-whom stay public. This is confidentiality, not anonymity, and the README must say so.

**Why it is not simple.** The browser generates three zero-knowledge proofs for every payment and a fourth kind for every payslip, and the chain verifies them through a native proof program. A judge who knows Solana knows this was Rust-only and switched off a year ago.

**Architecture.**

| Component | Runs | Does |
| --- | --- | --- |
| Dollar mint | Onchain, Token-2022 | Holds public and encrypted balances; enforces proofs; encrypts each amount to the auditor key |
| ZK ElGamal proof program | Onchain, native | Verifies equality, validity and range proofs |
| Payer console | Browser | CSV upload, deposit into the confidential balance, one confidential transfer per person |
| Recipient app | Browser | Email or passkey login, account setup on first use, decrypt balance, apply pending, withdraw, create payslip proof |
| Verifier page | Browser, no login | Reads the transaction, rebuilds the ciphertext, checks the proof |
| Auditor view | Browser + backend | Decrypts every amount with the auditor key |
| Stream | QuickNode, Solana devnet, Programs + Logs, filter on Token-2022 confidential instructions for this mint, webhook | Feeds the ledger the auditor view and notifications are built from. Explorers cannot show these amounts, so this is the only ledger. |
| Fee payer | Backend | Pays fees and proof-account rent |

Data flow: payer deposits (amount public) → transfers (amounts encrypted) → Stream delivers each transfer to the webhook → recipient is notified, applies the pending balance, sees the amount → recipient shares a payslip link → verifier checks it against the chain.

**Prize stack.** Consumer Applications $2,000 + Best use of Solana $1,500 + QuickNode Streams $500 = **$4,000**, plus Official Winner up to $2,500. The DeFi track ("payment rails") is a legitimate alternative; I chose Consumer because a no-program entry will look thinner beside DeFi protocols. Ask the Solana representative which they would rather see.

**Build estimate: 60–65 person-hours.**

| Work | Hours |
| --- | --- |
| Mint, issuer scripts, faucet funding | 4 |
| Confidential flow wrapper: setup, deposit, apply, transfer, withdraw | 12 |
| Payer console with batch run | 8 |
| Recipient app, embedded key, gasless | 10 |
| Payslip proof and verifier page | 8 |
| Auditor view | 4 |
| Stream, webhook, ledger | 6 |
| README, architecture, video, rehearsal | 8 |
| Buffer | 5 |

| Day | Goal |
| --- | --- |
| Mon evening | Fund wallets from the web faucet. One person runs the official example unchanged on devnet. Others scaffold the app and the Stream. |
| Tue | **Gate at noon: one confidential transfer from the team's own code.** Then recipient app and payer console against it. Payslip proof working in a script. |
| Wed | Batch run, auditor view, Stream ledger, verifier page. QuickNode office hours at 7 PM. |
| Thu | Polish, README, video, rehearsal. Feature freeze at 6 PM. |

Cut first, in order: passkey key derivation (use a key held by the app), withdraw, the batch run (pay three people one at a time), the auditor view. Never cut the payslip proof; it is the differentiator.

**Fallback if the Tuesday gate fails.** Switch to idea 3. The mint scripts, fee payer, recipient login and Stream carry over.

**Risks.**

- **The flow is new.** The JS helpers are months old and the doc example pins older versions. Mitigation: the Tuesday gate.
- **Wallet signing.** The guide tells wallets to refuse generic `signMessage` requests for the key-derivation message (Docs). Whether Phantom does is Unverified. Use keys held by the app, not a browser extension wallet.
- **Several transactions per transfer.** With v0 transactions a transfer spans a few dependent transactions (Docs). Single-transaction v1 transfers work on devnet (Probed), but tooling support is Unverified. Budget 5–15 seconds per payment in the demo and show a progress state.
- **No real stablecoin.** The demo dollar is the team's own mint. Say so. On mainnet this needs an issuer that enables the extension.
- **"Privacy means crime" question in Q&A.** The auditor key and public deposits and withdrawals are the answer.

**Demo script (5 minutes).**

1. 0:00 A block explorer showing a normal token payroll: five names, five salaries, public forever.
2. 0:40 Payer uploads the same five rows and clicks Pay.
3. 1:20 Explorer again: five transfers, amounts shown as confidential.
4. 1:50 A recipient logs in with email on a phone, no wallet, no gas, and sees $2,500.
5. 2:30 Auditor view: the accountant sees all five amounts with the auditor key.
6. 3:10 The recipient shares a payslip link. The verifier page shows "paid exactly $2,500 on this date by this payer", checked against the chain. Change the amount in the link and it fails.
7. 4:10 One slide: zero custom programs, two program IDs, proofs generated in the browser, the Stream.

**Score.**

| Criterion | Score (1–5) | Why |
| --- | --- | --- |
| Technical Execution | 5 | Zero-knowledge proofs, native program, Token Extensions used for what only they can do |
| Product & UX | 4 | One clear user; delay per payment is the weak point |
| Innovation | 4 | The category exists; the native route and the payslip proof do not, as far as I found |
| Impact & Potential | 4 | Named blocker for stablecoin payroll; depends on issuers enabling the extension |
| Demo | 4 | Strong before-and-after; less visceral than a voice demo |

### 6.2 Idea 2: Preflight, a signing firewall for AI agents

Every transaction an agent is asked to sign is simulated, checked against what the agent said it intended, and then rewritten so the simulated outcome is enforced onchain. The agent's money comes from an allowance it cannot exceed.

**Problem.** Agents sign what servers hand them. In May 2026 a prompt injection drained roughly $150,000–200,000 from an AI-linked wallet ([Cointelegraph](https://cointelegraph.com/news/grok-bankr-wallet-free-nft-prompt-injection), [OECD incident record](https://oecd.ai/en/incidents/2026-05-04-4a73), Secondary). An agent lost about $440,000 in a transfer error in February 2026 ([KuCoin news](https://www.kucoin.com/news/flash/ai-agent-lobstar-wilde-loses-440-000-in-solana-transfer-error), Secondary). On Solana, an x402 paywall or a transaction-request endpoint returns a transaction built by a stranger.

**Why current solutions fall short.** Existing agent guards check limits and run a simulation, then sign (section 4). A simulation can be defeated when state changes between the check and the execution; that is why Phantom attaches Lighthouse guard instructions for human users ([Phantom](https://phantom.com/learn/blog/anti-spoofing-security), [Blockaid](https://blockaid.io/blog/dissecting-toctou-attacks-how-wallet-drainers-exploit-solanas-transaction-timing), Secondary). Agents have no equivalent that I found.

**Tools.** `simulateTransaction` on devnet. Lighthouse (`lighthouse-sdk` 2.1.0, token-account and account-delta assertions; Docs). x402 (`@x402/svm` 2.31.0), whose Solana spec allows Lighthouse assertion instructions anywhere in a payment (Docs). Subscriptions program for a fixed or recurring allowance (`@solana/subscriptions` 0.5.0; Docs). Any non-Gemini model for the agent. QuickNode Streams.

**What already exists, and what is new.** Simulate-then-sign guards and spend limits are a crowded lane; IDEAS.md already lists plain spend-limit wrappers as saturated. New here: the firewall derives assertions from the simulation and appends them, so a bait-and-switch reverts onchain instead of draining; it works inside x402; and the cap is enforced by a Solana Foundation program, not by the team's code. Novelty is a claim I could not test against this year's field (Unverified).

**Why it is not simple.** It decodes arbitrary transactions into balance and authority effects, compares them with a declared intent in code outside the model, and rewrites the transaction with onchain assertions without breaking the payment protocol's verification rules.

**Architecture.**

| Component | Runs | Does |
| --- | --- | --- |
| Agent | Offchain | Decides what to buy, declares intent as structured data |
| Firewall | Offchain, holds the signing key, outside the model | Simulate, decode effects, compare with intent and policy, append Lighthouse assertions, sign or refuse |
| Allowance | Onchain, Subscriptions program | Caps what the agent wallet can pull per period; the owner can revoke |
| Sellers | Offchain | Two honest x402 endpoints and three hostile ones |
| Stream | QuickNode, Solana devnet, filter on the agent wallet and Lighthouse failures, webhook | Live audit feed; revokes the allowance after a failed assertion |

**Prize stack.** Agentic Payments and AI $2,000 + Best use of Solana $1,500 + QuickNode Streams $500 = **$4,000**, plus Official Winner.

**Build estimate: 55–60 person-hours.** x402 round trip 6; effect decoder 10; policy and intent check 6; Lighthouse rewrite 8; allowance and just-in-time funding 6; hostile endpoints 6; dashboard 6; Stream and auto-revoke 5; README with decision loop and limits, video 7.

| Day | Goal |
| --- | --- |
| Mon evening | x402 buyer and seller on devnet; allowance created and pulled once |
| Tue | Effect decoder and policy; two hostile endpoints blocked |
| Wed | Lighthouse rewrite inside an x402 payment; Stream and auto-revoke; dashboard |
| Thu | Bait-and-switch scenario, README, video |

Cut first: the bait-and-switch scenario, then auto-revoke, then the allowance (fall back to a small hot-wallet balance).

**Risks.**

- **The headline scenario needs changing state.** A bait-and-switch without a custom program means a swap on an Orca devnet pool the team creates and then moves, about 5 extra hours, or a tiny hostile program. Without it the Lighthouse step is hard to show.
- **Crowded and abstract.** Agent guardrails are the most common agentic entry, and there is no end user on screen.
- **Kit version split** between Lighthouse (2), Subscriptions (7) and x402.
- **Facilitator behaviour.** That the devnet facilitator accepts Lighthouse instructions follows from the spec but is untested (Unverified).

**Demo script.** The agent buys two data calls and the dashboard shows intent, simulated effect and assertion for each. Then three attacks: a hidden second transfer (refused before signing), an authority change (refused), and a pool moved after simulation (signed, reverts onchain, explorer shows the failed assertion, the allowance is revoked by the Stream). Close on the allowance: even with the firewall off, the agent cannot exceed it.

**Score.** Technical Execution 5. Product & UX 3. Innovation 3. Impact & Potential 4. Demo 4.

### 6.3 Idea 3: Earmark, dollars that can only be spent where the sender intended

A sender earmarks money for school fees, groceries or a pharmacy. The recipient can spend it only at approved merchants, and unspent money returns after a deadline.

**Problem.** People who send money home want a say in how it is used. In a field experiment with Filipino migrants, labelling a remittance for education raised the amount sent by more than 15%, and paying the school directly added a further 2.2% ([De Arcangelis et al., NBER w20839](https://www.nber.org/papers/w20839.pdf); [University of Michigan summary](https://news.umich.edu/?p=22838), Secondary). The same shape fits student-organisation budgets and relief aid. Existing remittance apps move money; they do not carry the purpose with it.

**Tools.**

- Version without a custom program: a Token-2022 mint with default-frozen accounts (the issuer thaws approved merchants and recipients), permanent delegate (returns unspent funds at the deadline), pausable, and metadata. Solana Pay QR at the merchant. Backend fee payer.
- Upgrade with one custom program: a transfer hook that checks sender role, merchant category, a per-payment cap and the deadline on every transfer. Section 3 gives the estimate.
- Alternative enforcement without Rust: a Squads spending limit with a destination allowlist, where the recipient is the member allowed to spend (Unverified against current docs).

**What already exists, and what is new.** Purpose-bound money is a known concept and restricted aid vouchers exist offchain. Not new as an idea. New only in execution: the restriction is a property of the token, visible on an explorer, and it fails onchain when broken.

**Why it is not simple.** With the hook, the token program calls the team's program on every transfer and rejects the ones that break the rule. Without the hook this is a composition of extensions and is only moderately deep; I will not oversell it.

**Architecture.** Sender app (fund and earmark) → mint with extensions onchain → recipient app (balance per purpose, scan to pay) → merchant page (Solana Pay QR, settlement) → issuer backend (approvals, deadline sweep, fee payer) → Stream (QuickNode, Solana devnet, Programs + Logs on the mint, webhook: tells the sender "spent $40 at the pharmacy" and flags rejected attempts).

**Prize stack.** Consumer Applications $2,000 + Best use of Solana $1,500 + QuickNode Streams $500 = **$4,000**, plus Official Winner.

**Build estimate.** 35–40 person-hours without the hook, 55–60 with it.

| Day | Goal |
| --- | --- |
| Mon evening | Mint with extensions; thaw and transfer from a script; one person starts the toolchain install |
| Tue | Three screens end to end with the no-hook version; hook compiling on a local validator |
| Wed | Deadline sweep, Stream alerts; hook on devnet or dropped by 6 PM |
| Thu | README, video, rehearsal |

Cut first: the hook, then the deadline sweep.

**Risks.** Without the hook a recipient can pass funds to another approved recipient, which weakens the claim. With the hook the team is exposed to everything in section 3. Wallet handling of hooked and frozen tokens is Unverified, so keep signing inside the app. Innovation score is the ceiling on this idea.

**Demo script.** A sender in Austin earmarks $100 for school fees. The recipient scans the school's QR and pays. The recipient then tries to send the rest to a personal wallet; the transfer fails onchain and the sender's phone shows the attempt. Fast-forward the deadline; the remainder returns.

**Score.** Technical Execution 3 (4 with the hook). Product & UX 4. Innovation 3. Impact & Potential 4. Demo 5.

### 6.4 Idea 4: Cancel Button, subscriptions the merchant cannot overcharge

A subscription wallet where every recurring charge is a capped, revocable onchain delegation, with one tap to cancel and an alert before each pull.

**Problem.** Surveys put forgotten or unwanted subscriptions at roughly $200–250 a year per person, and 79% of respondents in one survey had been charged after forgetting a free trial ([Cord Cutters News on a Dimers survey](https://cordcuttersnews.com/cord-cutters-check-your-credit-card-americans-are-losing-45-a-month-to-forgotten-free-trials/), Secondary; figures vary widely by method). Card subscriptions give the merchant the pull and the customer a phone queue.

**Tools.** Subscriptions program on devnet (Probed), `@solana/subscriptions` 0.5.0: merchant plans, subscribe, per-period pulls, `cancelSubscription`, `revokeDelegation` (Docs). Backend fee payer. QuickNode Streams on the program.

**What already exists, and what is new.** Onchain subscriptions have been built many times with custom programs. New: this uses the Foundation's audited program, released this year, and adds the consumer layer (pre-pull alerts, trial that ends by default, one cancel screen for everything). No hackathon use of the program found (Unverified).

**Why it is not simple.** It is the simplest idea here, and I include it as the safe option. The program does the hard part. The team's depth would be the Stream-driven alerting and a merchant checkout.

**Architecture.** Merchant page (create plan, pull each period) → Subscriptions program onchain → customer app (subscribe, list, cancel) → Stream (filter on the program for this app's plans, webhook: "pull due tomorrow", "pulled", "cancelled").

**Prize stack.** Consumer Applications $2,000 + Best use of Solana $1,500 + QuickNode Streams $500 = **$4,000**, plus Official Winner.

**Build estimate: 30–35 person-hours.** Mon: plan, subscribe and pull from a script. Tue: both apps end to end. Wed: Stream alerts, trial logic, polish. Thu: submission. Cut first: trial logic.

**Risks.** Fails the team's own test of depth. The program's README lists edge cases around rotation and near-expiry charges (Docs). Kit 7 pin.

**Demo script.** Subscribe to a demo streaming service. The merchant tries to pull twice the plan amount and the program rejects it. An alert arrives before the next pull. One tap cancels and the next pull fails.

**Score.** Technical Execution 3. Product & UX 4. Innovation 3. Impact & Potential 3. Demo 4.

## 7. Ranked comparison

| Rank | Idea | Track | Stack, max cash | Person-hours | Custom program | Technical depth | Biggest risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Sealed: private payouts with verifiable payslips | Consumer | Track + Solana + QuickNode, $4,000 | 60–65 | None | Highest | The JS confidential flow is new; I could not run it end to end |
| 2 | Preflight: agent signing firewall | Agentic | Track + Solana + QuickNode, $4,000 | 55–60 | None (optional hostile program for the demo) | High | Crowded lane, no end user on screen |
| 3 | Earmark: purpose-bound dollars | Consumer | Track + Solana + QuickNode, $4,000 | 35–40, or 55–60 with a hook | Optional transfer hook | Medium, high with the hook | Idea is not new; the hook is the team's first Rust |
| 4 | Cancel Button: capped subscriptions | Consumer | Track + Solana + QuickNode, $4,000 | 30–35 | None | Lowest | Too simple by the team's own standard |

Every stack adds an Official Winner place of up to $2,500. All four have the same cash ceiling, so the ranking is on depth, novelty and risk only.

## 8. Top pick

**Build Sealed (idea 1).**

- It is the only idea here where the "how did they build that" comes from something that became possible this year, and it needs no Rust.
- It answers the Best use of Solana objectives directly: Token Extensions as the core, existing programs, no wallet friction.
- The risky part is isolated and testable in the first working morning, and the fallback (idea 3) reuses most of the scaffolding.
- It still has one relatable user in the first minute, which IDEAS.md identifies as the pattern in past winners.

What it gives up: the Gemini bounty, and with it $2,000–2,500 of ceiling. Compared with the guardian wallet it gives up the ElevenLabs perk and gains $500 of chain award.

Against the other two research angles, as reported to me by the coordinator (I have not read those reports):

- **Arc, non-Gemini (top pick: multilateral invoice clearing).** Those ideas cap at $3,500 plus an Official Winner place. Sealed caps at $4,000, $500 higher, because the Solana chain award is larger.
- **Gemini (top pick: a liquidation-odds autopilot on Arc).** A Gemini idea has the higher ceiling because of the $2,500 bounty. Sealed cannot match that. It carries no exposure to Gemini's data terms, which IDEAS.md records as unresolved.

A caution on the premise. Last year's Solana winners at this organiser's event were a pay-to-email escrow and a food-ordering checkout, which were not technically deep. Depth helps the Solana representative's vote; the UBC representative picks the track winner on five criteria, two of which are product and demo. Sealed is ranked first because it is deep and still demos as a product, not because depth alone wins.

## 9. Considered and dropped

| Idea | Reason |
| --- | --- |
| Offline payments with durable nonces (payer signs with no signal, merchant broadcasts) | Strong demo, but the mechanism is a basic System Program feature, so it does not answer the request for depth. No prior hackathon entry found (Unverified). Worth a second look if the team wants a demo-first idea. |
| Liquidation guard on a devnet lending market, without Gemini | No confirmed funded lending market on devnet; Drift is unusable; becomes a mock protecting a mock. |
| Any swap or routing idea | Jupiter is not on devnet (Probed). |
| Guarded agent with a Squads budget | Feasible now, since x402's smart-wallet path allowlists Squads (Docs), which corrects the inference in IDEAS.md. Still a spend-limit wrapper. Idea 2 is the stronger form. |
| Compressed-NFT receipts or stamps | Loyalty stamps are listed as saturated. |
| Blinks-based social payments | Stale SDK; unfurl status Unverified. |
| Helius shielded transfers ([docs](https://www.helius.dev/docs/privacy/guides/transfer)) as the privacy layer for idea 1 | Single-transaction private transfers on devnet, but an alpha third-party SDK with a hosted prover. Token Extensions is what the Solana award names. Keep as a second fallback. |

## 10. Could not verify

Items that could change a decision:

1. **A confidential transfer from freshly written code on devnet.** Confirmed: the program runs on devnet today, the packages install and export the helpers, proofs generate locally. Not confirmed: the whole flow from my own wallet, because the RPC faucet is closed. This decides idea 1. Test it first.
2. **Web faucet limits** at faucet.solana.com. Every idea needs funded wallets; a hook deploy needs several SOL.
3. **Whether QuickNode Streams delivers v1 transactions** on Solana devnet, and the credit cost. Ask at QuickNode office hours, Wed 7 PM. If not, use v0 multi-transaction transfers.
4. **Whether browser wallets block the key-derivation signature.** Avoided by holding keys in the app.
5. **Binding a payslip proof to onchain ciphertext end to end.** The proof itself works locally.
6. **How crowded each track is on Solana this year.** The gallery is unpublished. Every statement here about a gap is absence of evidence in search results.
7. **Whether the devnet x402 facilitator accepts Lighthouse instructions** in practice (idea 2).
8. **Squads spending-limit fields and Token ACL gate deployment on devnet** (idea 3 alternatives).
9. **Consumer versus DeFi track for idea 1.** A question for the Solana and UBC representatives at office hours (Solana: Mon and Wed 6–7 PM, Thu 7–8 PM).
10. **Official results of last year's event.** Taken from IDEAS.md, which itself relied on search excerpts.

## Sources

Primary and probed:

- Solana devnet RPC, `api.devnet.solana.com`: `getAccountInfo`, `getSignaturesForAddress`, `getTransaction`, `getVersion`, `requestAirdrop`, 2026-11-16
- npm registry and crates.io metadata for every package and version named above, 2026-11-16
- Confidential Balances integration guide and transfer example: https://solana.com/docs/tokens/extensions/confidential-transfer/integration-guide (read from the `solana-foundation/solana-com` repository source)
- Token-2022 JS client source: https://github.com/solana-program/token-2022/tree/main/clients/js
- `@solana/zk-sdk` README: https://www.npmjs.com/package/@solana/zk-sdk
- x402 `exact` scheme on Solana: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md
- Subscriptions program: https://github.com/solana-foundation/subscriptions
- Token ACL: https://github.com/solana-foundation/token-acl
- Lighthouse with Solana Kit: https://www.quicknode.com/guides/solana-development/tooling/solana-kit/lighthouse
- QuickNode Streams supported chains: https://www.quicknode.com/docs/streams/supported-chains
- Squads spending limits: https://docs.squads.so/main/development/reference/spending-limits

Secondary:

- Confidential transfers return to mainnet: https://solanacompass.com/news/confidential-transfers-return-to-solana-mainnet-after-year-long-security-pause
- June 2025 post-mortem: https://solana.com/news/post-mortem-june-25-2025
- Payroll privacy: https://www.americanbanker.com/payments/news/paxos-aleo-add-privacy-to-new-stablecoin
- Agent wallet incidents: https://cointelegraph.com/news/grok-bankr-wallet-free-nft-prompt-injection · https://oecd.ai/en/incidents/2026-05-04-4a73
- Phantom guard instructions: https://phantom.com/learn/blog/anti-spoofing-security
- Directed remittances: https://www.nber.org/papers/w20839.pdf
- Colosseum Frontier winners: https://solanacompass.com/news/colosseum-announces-26-winners-of-the-solana-frontier-hackathon-the-largest-crypto-hackathon-ever
- Solana Privacy Hack: https://solana.com/privacyhack
- Drift recovery: https://www.drift.trade/updates/recovery-plan-for-affected-users
