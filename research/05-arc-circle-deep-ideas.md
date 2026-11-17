# Technically deep ideas on Arc with Circle's stack (no Gemini)

Researched on 2026-11-16 for the UBC 26 Hackathon (deadline Fri Nov 20, 12:00 PM CST). Requirements come from [`../HACKATHON.md`](../HACKATHON.md). Earlier findings in [`../IDEAS.md`](../IDEAS.md) and reports 01 to 03 are reused, not repeated.

**Scope.** Ideas whose core is technically hard, that use Arc for something Arc or Circle makes easy, and that do not touch the Gemini API. The guardian voice wallet and light variations of it are excluded. Solana ideas and Gemini ideas belong to the other two researchers.

**How to read the labels.**

- **Verified** means I read the official page, the npm registry, or the live Arc testnet RPC today.
- **(unverified)** means I could not confirm the claim against a primary source. Field-size claims are always guesses, because the project gallery is unpublished.

## Contents

1. Summary
2. What Arc and Circle offer on Arc testnet today
3. Which Arc objectives are under-served
4. Where the bounties fit
5. Ideas
6. Ranked comparison and top pick
7. Not verified
8. Sources

## 1. Summary

1. **Every idea in this angle tops out at $3,500 in track, chain, and bounty cash** (track $2,000 + Best use of Arc $1,000 + QuickNode $500), plus an Official Winner place worth up to $2,500. That is the same ceiling as the rejected guardian wallet. Without Gemini there is no way to raise it. What changes is the odds: a deeper build competes better for the track and for an Official Winner place.
2. **Arc testnet now has far more on it than the earlier reports found.** Swap between USDC and EURC, Earn vaults, cirBTC-backed borrowing, Gateway unified balances, the x402 `upto` usage-based scheme, ERC-8004 and ERC-8183 reference contracts, and two Arc-only helper contracts (`Memo` and `Multicall3From`) are all live on testnet. Privacy is not: Arc's confidential execution is on the roadmap only.
3. **The most crowded Arc lane is wider than "agent spend limits".** At ETHGlobal HackMoney 2026, 97% of the 155 Arc submissions had AI agents and 56% were crosschain. Arc's own write-up says "most submissions built familiar workflows that use stablecoins for settlement, not new financial primitives" ([Arc blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned)). Payroll, treasury sweeps, invoice factoring, milestone escrow, and an FX exchange have all been built on Arc already.
4. **The gap is a new settlement primitive.** I found no Arc hackathon project that nets obligations between many parties. That is the top pick: a clearing contract that discharges a web of invoices with a fraction of the cash, in one atomic transaction.

**Top pick: multilateral invoice clearing on Arc (idea 1).** DeFi track, Best use of Arc, QuickNode Streams. About 60 person-hours. Details are in section 5.

## 2. What Arc and Circle offer on Arc testnet today

Arc testnet was live when probed today: `eth_chainId` returned `0x4cef52` (5042002) and blocks were advancing. Every contract address in the table below returned code from `eth_getCode`.

| Product | Live on Arc testnet? | Quickstart | Traps |
| --- | --- | --- | --- |
| **USDC as gas** | Yes. ERC-20 interface at `0x3600000000000000000000000000000000000000`, 6 decimals. Verified, [contract addresses](https://docs.arc.io/arc/references/contract-addresses). | [Deploy on Arc](https://docs.arc.io/arc/tutorials/deploy-on-arc) | Native balance uses 18 decimals, the ERC-20 view uses 6. Use the ERC-20 interface only. `maxFeePerGas` under 20 Gwei can stay pending forever ([gas and fees](https://docs.arc.io/arc/references/gas-and-fees)). |
| **EURC** | Yes, `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`, 6 decimals. Verified. | [Transfer EURC](https://developers.circle.com/stablecoins/quickstarts/transfer-eurc-evm) | The faucet gives "a small test allocation" of EURC. The amount is not stated. |
| **App Kit Swap (USDC, EURC, cirBTC)** | Yes. "Swap is available on mainnet only, with the exception of Arc testnet." Verified, [Swap](https://docs.arc.io/app-kit/swap). | [Swap on one chain](https://docs.arc.io/app-kit/quickstarts/swap-tokens-same-chain) | The quickstart warns that Arc testnet liquidity is thin and unstable, and that a swap can pass estimation and still revert. Do not put a live swap on the demo's critical path. |
| **StableFX (institutional RFQ)** | Contract `FxEscrow` is deployed at `0xd68256f4D69C6BbEcB873D8588AE0Dc6B8E22E10`. Access is permissioned (report 02). | [Docs](https://developers.circle.com/stablefx) | Treat as unavailable. Use App Kit Swap for USDC and EURC conversion instead. |
| **CCTP (USDC)** | Yes, domain 26, `TokenMessengerV2` at `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`. Arc supports standard transfers, upfront fees, and the Forwarding Service. Verified, [supported chains](https://developers.circle.com/cctp/concepts/supported-chains-and-domains). | [Ethereum to Arc](https://developers.circle.com/cctp/quickstarts/transfer-usdc-ethereum-to-arc), [Solana to Arc](https://developers.circle.com/cctp/quickstarts/transfer-usdc-solana-to-arc) | Fast Transfer is marked N/A for Arc as a source, because standard attestation is already fast. |
| **CCTP for non-USDC assets, with hooks** | Yes. `CrossChainTokenService` at `0x63753E722bd2C2A5DF6EE19C5106662208B81077`. EURC, cirBTC, and WETH can arrive with `hookData` that runs a contract call in the same transaction. Verified, [hooks](https://developers.circle.com/cctp/expanded-assets/concepts/hooks). | [Base to Arc EURC](https://developers.circle.com/cctp/expanded-assets/quickstarts/transfer-eurc-base-to-arc), [build a hook receiver](https://developers.circle.com/cctp/expanded-assets/howtos/build-hook-receiver) | A hook that reverts rolls back delivery, and the source burn is not undone. EVM chains only. |
| **Gateway (unified balance)** | Yes. `GatewayWallet` `0x0077777d7EBA4688BDeF3E311b846F25870A19B9`, `GatewayMinter` `0x0022222ABE238Cc2C7Bb1f21003F0a260052475B`. Supports USDC, EURC, and cirBTC. Verified. | [Unified Balance quickstart](https://docs.arc.io/app-kit/quickstarts/unified-balance-deposit-and-spend) | Circle smart-contract wallets cannot sign their own spends and need a delegate. Fast deposits are USDC only ([Unified Balance](https://docs.arc.io/app-kit/unified-balance)). Gateway's transfer API now accepts ERC-1271 contract signatures ([docs](https://developers.circle.com/gateway/references/erc-1271)). |
| **Gateway Nanopayments** | Yes (report 01). EURC and cirBTC are also supported on Arc ([supported networks](https://developers.circle.com/gateway-nanopayments/supported-networks)). | [Buyer](https://developers.circle.com/gateway-nanopayments/quickstarts/buyer), [seller](https://developers.circle.com/gateway-nanopayments/quickstarts/seller) | The batch interval is still unpublished. The page describes the lifecycle but gives no timing. |
| **x402 Facilitator Service** | Yes. Arc testnet (`eip155:5042002`) supports `exact` and `upto`. **Arc is the only testnet with `upto`**; Base Sepolia and Polygon Amoy list `exact` only. Verified, [supported networks](https://developers.circle.com/facilitator-service/supported-networks). | [Quickstart](https://developers.circle.com/facilitator-service/quickstart) | The keyless trial covers `exact` only. Settling an `upto` payment always needs a Circle API key, and the buyer needs a Permit2 allowance ([how it works](https://developers.circle.com/facilitator-service/how-it-works)). The trial allowance size is not stated. Accepts EOAs and deployed ERC-1271 accounts. |
| **Paymaster** | **No.** The supported list is Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon, and Unichain. Verified, [Paymaster](https://developers.circle.com/paymaster). | n/a | Not needed on Arc, since gas is already USDC. To hide fees from users, use Gas Station. The Arc objective that names "Paymaster" is met in spirit by Gas Station. |
| **Gas Station (sponsored fees)** | Yes, for user-controlled and developer-controlled wallets. Verified, [Gas Station](https://developers.circle.com/wallets/gas-station). | [Send a gasless transaction](https://developers.circle.com/wallets/gas-station/send-a-gasless-transaction) | Needs a Circle Console account. |
| **Modular (passkey) wallets** | Yes (`MSCA` on `ARC-TESTNET`). Verified, [supported blockchains](https://developers.circle.com/wallets/supported-blockchains). `@circle-fin/modular-wallets-core` 1.0.16. | [Passkey wallet and gasless send](https://developers.circle.com/wallets/modular/create-a-wallet-and-send-gasless-txn) | Smart accounts cannot call `Memo` or `Multicall3From` (see below). Passkeys need a real domain or localhost. |
| **Developer-controlled and user-controlled wallets** | Yes, EOA and SCA on `ARC-TESTNET`. Verified. `@circle-fin/developer-controlled-wallets` 10.8.1. | [Create a dev-controlled wallet](https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet) | Needs an API key and a registered entity secret. |
| **Agent Wallets** | Yes, `ARC-TESTNET`. Verified, [supported blockchains](https://developers.circle.com/agent-stack/agent-wallets/supported-blockchains). | [Quickstart](https://developers.circle.com/agent-stack/agent-wallets/quickstart) | "Policies apply to mainnet agent wallets only" is still on the [policies page](https://developers.circle.com/agent-stack/agent-wallets/wallet-operations/custom-policies). |
| **Earn (yield vaults for USDC and EURC)** | Yes, `kit.earn.exploreVaults({ chain: "Arc_Testnet" })`. Verified, [Earn](https://docs.arc.io/app-kit/earn). | [Deposit into a vault](https://docs.arc.io/app-kit/quickstarts/earn-deposit) | I did not run it, so testnet vault count and APY are unknown. |
| **Borrow (USDC against cirBTC)** | Yes, with webhooks when a loan's health band changes. Verified, [Borrow](https://docs.arc.io/app-kit/borrow), [monitor a loan](https://docs.arc.io/app-kit/howtos/borrow/monitor-a-loan). | [Originate a loan](https://docs.arc.io/app-kit/quickstarts/originate-a-loan) | Needs testnet cirBTC from the faucet. Needs an adapter with atomic batching (Viem or Circle Wallets). |
| **USYC (tokenized T-bill fund)** | Deployed, but allowlisting takes a support ticket and "24–48 hours". Verified, [contract addresses](https://docs.arc.io/arc/references/contract-addresses). | [Teller quickstart](https://developers.circle.com/tokenized/usyc/subscribe-and-redeem) | Too slow and too uncertain for this week. Use Earn vaults for yield instead. |
| **`Memo` contract** | Yes, `0x5294E9927c3306DcBaDb03fe70b92e01cCede505`. Wraps any call, keeps the caller as `msg.sender`, and emits an indexed `memoId` for reconciliation. Verified, [transaction memos](https://docs.arc.io/arc/concepts/transaction-memos). | [Send USDC with a memo](https://docs.arc.io/arc/tutorials/send-usdc-with-transaction-memo) | **EOA callers only.** Passkey smart accounts, Safe, and any ERC-4337 wallet revert. |
| **`Multicall3From` contract** | Yes, `0x522fAf9A91c41c443c66765030741e4AaCe147D0`. Batches calls while keeping the caller as `msg.sender`, so one transaction can pay many recipients with no approvals. Verified, [batched transactions](https://docs.arc.io/arc/concepts/batched-transactions). | [Batch USDC transfers](https://docs.arc.io/arc/tutorials/batch-usdc-transfers) | EOA callers only. No value forwarding. |
| **ERC-8004 agent registries** | Yes. Identity `0x8004A818BFB912233c491871b3d84c89A494BD9e`, Reputation `0x8004B663056A597Dffe9eCcC1965A193B7388713`, Validation `0x8004Cb1BF31DAf7788923b405b754f57acEB4272`. Verified. | [Register an agent](https://docs.arc.io/arc/tutorials/register-your-first-ai-agent) | None found. |
| **ERC-8183 job escrow** | Yes, testnet only. Reference contract `0x0747EEf0706327138c69792bF28Cd525089e4583`. Verified. | [Create a job](https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job) | A reference implementation, so behaviour may change. |
| **Privacy (Arc Privacy Sector)** | **No.** "Privacy features are on the roadmap and not yet available on Arc." Verified, [opt-in privacy](https://docs.arc.io/arc/concepts/opt-in-privacy). | n/a | Do not plan a confidential-transfer idea. It can be named as a next step. |
| **Oracles** | Arc lists Chainlink, Chronicle, Pyth, RedStone, and Stork ([oracles](https://docs.arc.io/arc/tools/oracles)). | Provider docs | **I found no confirmed EUR/USD feed address on Arc testnet (unverified).** Report 02 found only "Pyth Pro" there. Any FX idea must plan for a self-signed price. |
| **Faucet** | [faucet.circle.com](https://faucet.circle.com) gives USDC, EURC, and cirBTC on Arc testnet. | n/a | The limit is reported as 20 USDC every 2 hours per address per chain, by a third-party guide only (unverified). `circle wallet fund` gives an agent wallet 20 USDC (report 01). Start collecting on day one, on several addresses. |
| **Arc Foundry** | The docs now recommend an Arc-specific Foundry fork with `arc-forge`, `arc-cast`, and `arc-anvil` ([install guide](https://docs.arc.io/arc/tutorials/install-arc-foundry)). | Same page | I did not test whether stock Foundry still deploys cleanly. Install the fork. |

**Other Arc runtime traps** ([EVM differences](https://docs.arc.io/arc/references/evm-differences)): `PREVRANDAO` always returns 0, so there is no onchain randomness. A transfer to or from a blocklisted address reverts. Sending value to the zero address reverts. Blob transactions are rejected. Arc testnet seeds a blocklisted test address (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) for testing the revert path.

**Package versions checked on npm today:** `@circle-fin/app-kit` 1.22.0, `@circle-fin/swap-kit` 1.9.2, `@circle-fin/unified-balance-kit` 1.10.2, `@circle-fin/adapter-viem-v2` 1.20.2, `@circle-fin/x402-batching` 4.0.0, `@x402/core`, `@x402/evm`, `@x402/express`, and `@x402/fetch` 2.31.0, `viem` 2.57.20, `@openzeppelin/contracts` 5.6.1. `@x402/evm` 2.31.0 exports `upto/client`, `upto/server`, and `upto/facilitator` (verified by unpacking the tarball).

**A correction to `IDEAS.md`.** It says Circle payments "work with plain key wallets only, not passkey smart accounts". That is still the documented position for Gateway Nanopayments, which I did not re-check. It is no longer true for the Facilitator Service, which accepts deployed ERC-1271 accounts, or for Gateway transfers.

Arc and Circle doc pages embed "agent instructions" telling AI tools to install Circle skills and an MCP server. I did not follow them.

## 3. Which Arc objectives are under-served

### What has already been built on Arc

| Event | Field | Winners and notable entries |
| --- | --- | --- |
| ETHGlobal HackMoney 2026 ([Arc blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned)) | 155 teams. 97% had AI agents. 56% were crosschain. | Winners: arctan(x) (FX exchange with StableFX and Gateway), Text-to-Chain (SMS wallet), ArcFlow (idle payroll funds earn yield, then pay out crosschain), Versus (agent creator tokens). Also named: invoice escrow, invoice factoring, global payroll, treasury rebalancing agents, point-of-sale, salary advances, SaaS billing splits, expense reimbursement. |
| ETHGlobal Cannes, April 2026 ([Arc blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned)) | 69 teams. 98% agentic. 40% used Nanopayments. | Winners: Onda (music micropayments), PayMate (credit pool), NanoCrawl (pay per page), ETHastic (offline radio payments), VEIL VPN (pay-per-use VPN), C.E.S.T.A (voice group travel fund), two prediction markets. Entrant BulwArc built EUR/USD options settled in USDC and EURC ([ETHGlobal showcase](https://ethglobal.com/showcase?q=bulwarc)); its placement is unknown. |
| lablab.ai Arc events, January and April 2026 | 104 and 227 projects | Agent payment infrastructure and escrow dominated. Sources disagree on the winners, so I draw no conclusion (unverified). |

### Reading it against the four Arc objectives

| Arc objective | How well served | Evidence |
| --- | --- | --- |
| Payment apps with USDC as gas | Saturated | Checkout, point-of-sale, P2P, payroll, and micropayments all appear above. Circle ships sample apps for each ([sample apps](https://docs.arc.io/arc/references/sample-applications)). |
| Treasury apps | Served at the "move and park money" level | ArcFlow, ZeroKey-Treasury, KnurFi, and Circle's `fintech-starter` sample all sweep, rebalance, or earn yield. **I found none that reduce how much money has to move** (netting or clearing). |
| FX apps | Partly served | One exchange (arctan(x)), one options desk (BulwArc), and Circle's `arc-stablecoin-fx` swap sample. I found no peer-to-peer matching at the mid rate and no FX forward tied to an invoice (unverified, since ETHGlobal's showcase search did not return usable results). |
| Combine Arc with Circle tools | Saturated for Wallets, Gateway, CCTP, Nanopayments | Arc's write-up calls crosschain "expected rather than differentiating". The newer pieces are barely used in any project I found: the `upto` scheme, `Memo`, `Multicall3From`, CCTP hooks for EURC, Earn, and Borrow. |
| Simple, stable fees and balances | Saturated | Arc's write-up: "many teams treated gas fees as something end users should never see". |

**Conclusion.** Agent projects are the crowd, not only spend-limit wrappers. "A familiar finance workflow settled in USDC" is the second crowd. The open ground is a new settlement mechanism in the treasury and FX objectives, built on the parts of Arc that are new this year.

Whether the same pattern holds among UBC entrants is unknown. Those events were global and online or ETHGlobal-run; this one is a student-heavy event with a Solana prize that pays more.

## 4. Where the bounties fit

| Bounty | Natural fit in this angle | Comment |
| --- | --- | --- |
| QuickNode Streams, $500 | Strong in ideas 1, 2, and 4. Workable in idea 3. | Each idea has contract events that must trigger an offchain solver or keeper. A Stream on Arc testnet logs, filtered to the contract and decoded with `decodeEVMReceipts`, delivered to a webhook, is the trigger. That meets "core data source" honestly. Arc testnet support was confirmed in `IDEAS.md`. Billing is per block processed, and Arc produces a block every 0.5 seconds, so about 172,800 blocks a day. Pause the Stream when idle. The credit cost per Arc block is unknown; ask QuickNode on Wednesday. |
| ElevenLabs (no cash) | Weak in all four | None of these ideas needs voice. Adding a spoken summary would be an add-on, which the bounty text rules out. I recommend not targeting it. The one honest exception is idea 2, where a voice send flow is plausible, but that drifts back toward the rejected "talk to your wallet". |
| Grok Bot (keyboards) | Not established | `IDEAS.md` records that the official guide calls it "xAI's assistant built into X" while third parties describe a separate agent product, and that no chat-export feature was found. I found nothing new and did not research it further. Leave it out. |
| Gemini | Out of scope | Not used by any idea here. |

## 5. Ideas

All four are new. None restates an idea in `IDEAS.md`. Idea 4 is related in spirit to the rejected cover vault (both are derivatives on Arc) but shares no mechanism and uses no Gemini data.

Person-hour estimates assume the team's stated profile: strong TypeScript and Next.js, heavy use of AI coding tools, and no prior contract deployment. Each estimate includes about 6 hours for the README, video, and Devpost form.

---

### Idea 1 (top pick): multilateral invoice clearing

**One line.** Small businesses that owe each other money post their invoices to a contract on Arc. A solver finds the loops and chains in the debt graph, and one transaction discharges most of the debt while moving a small fraction of the cash.

#### The problem

- **Who has it.** Small businesses stuck in late-payment chains: A cannot pay B until C pays A.
- **Evidence.** 59% of US small businesses have invoices overdue by 30 days or more, up from 47% a year earlier. The average owed is $17,700. 39% say one late payment made it hard to cover payroll or bills. Among businesses with overdue invoices, 53% delayed their own outgoing payments, against 26% of businesses without ([QuickBooks 2026 Late Payments Report](https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2026/)). That last pair of numbers is the chain reaction.
- **Why clearing helps.** Much of that debt is circular. Using real data from the Sardex network, obligation clearing alone cut net internal debt by about 25%, and by about 50% combined with mutual credit ([Fleischman, Dini, Littera 2020](https://wiki.p2pfoundation.net/Liquidity-Saving_through_Obligation-Clearing_and_Mutual_Credit)). Banks do the same thing for themselves: CLS says multilateral netting cuts the funding needed for FX settlement by about 96% ([CLS](https://www.cls-group.com/media/ruxdgeyd/cls-shaping-fx-03-liquidity-benefits_do_not_settle_for_less.pdf), vendor figure).
- **Why current solutions fall short.** Clearing houses are closed clubs for banks. Factoring and invoice finance (the crowded lane on Arc) add credit at a cost instead of removing the need for it. Stablecoin payment apps make each payment cheaper but still move the gross amount.

#### What exists and what is new

- **Cycles Protocol** is the closest prior work: a clearing protocol designed by Ethan Buchman, Paolo Dini, Tomaž Fleischman and others, using a min-cost max-flow solver called MTCS inside a TEE with ZK proofs ([whitepaper, November 2024](https://cycles.money/whitepaper.pdf)). I did not establish its launch status or whether it runs on any EVM chain (unverified).
- **Institutional netting** exists at CLS, Fnality, Partior, and Circle's own Payments Network.
- **On Arc and at hackathons**, I found batch settlement (StabL, SettleOne) but nothing that nets obligations across counterparties. This rests on web search only (unverified).
- **What is new here:** an open clearing contract that anyone can solve for, on a chain where the unit of account, the gas, and the settlement asset are the same dollar, and where finality is immediate. The contract checks that a proposed settlement is valid; it does not trust the solver.

#### Why it is not simple

The solver is a constrained graph optimisation (cycle cancelling, then max-flow over the remaining chains, limited by each payer's cash cap). The contract verifies any solver's output in one pass and settles every leg atomically, so a hundred invoices across a dozen parties clear or fail together in a single 0.5-second block.

#### Why Arc

- **Deterministic finality.** A clearing round is only useful if it cannot be reversed. Arc finalises in under a second with no reorgs ([docs](https://docs.arc.io/arc/concepts/deterministic-finality)).
- **One currency for everything.** Invoices, settlement, and gas are all USDC. A business never holds a second token.
- **Stable fees.** A round touching 100 invoices should cost on the order of $0.10 at the 20 Gwei floor (my estimate from typical storage-write costs, not measured).
- **EURC is native**, so a second currency is a stretch goal, not a rewrite.
- **`Memo`** lets an EOA attach the invoice number to its acceptance, so accounting systems can reconcile from events.
- **The faucet limit becomes the pitch.** Clearing needs very little cash, so "we cleared 1,150 USDC of invoices with 40 USDC" is achievable on faucet funds and is exactly the point.

#### Architecture

| Component | Where | What it does |
| --- | --- | --- |
| `Clearing` contract | Arc testnet, Solidity | Stores obligations (debtor, creditor, amount, due date, status). `propose` by the creditor, `accept` by the debtor. Each member sets a cash cap per round. `settle(obligationIds[], amounts[], parties[])` reduces each obligation, sums a net position per party, pulls from net payers with `transferFrom`, pays net receivers, and reverts unless every check passes. |
| Solver | Offchain, TypeScript | Builds the graph from events. Version 1: find cycles by depth-first search and cancel each by its smallest edge. Version 2: push available cash down the remaining chains (max-flow with payer caps). Simulates with `eth_call`, then submits. |
| Stream | QuickNode, Arc testnet logs | Filter keeps only the `Clearing` contract's `Accepted`, `Settled`, and `CapChanged` events and decodes them. Destination is a webhook that updates the graph store and wakes the solver. |
| Wallets | Circle developer-controlled wallets (EOA) with Gas Station | Each business signs in with email. The app holds no user-visible keys and no user pays gas. A "bring your own wallet" path uses viem. |
| App | Next.js | Invoice inbox (accept or dispute), a live graph of who owes whom, a "before and after" view of each round, and a per-business statement. |
| Seed script | TypeScript | Creates six demo businesses and a tangled set of invoices. |

**Safety rules in the contract (these go in the README as "risk assumptions").**

- An obligation exists only after the debtor accepts it.
- A settlement can never reduce an obligation by more than is outstanding, and never pulls more cash from a party than that party's net debit in this round or its own cap.
- An obligation not yet due is only cleared if its debtor opted in to early clearing.
- The solver is untrusted and permissionless. A bad solution reverts. A lazy solution clears less but harms nobody.
- A blocklisted party makes transfers revert on Arc, so the solver simulates first and drops that party.

**Known limits to state openly.** Obligations are public onchain, and real businesses will not accept that. Cycles solves it with a TEE; Arc's privacy sector is the natural home once it ships. The legal enforceability of set-off is out of scope.

#### Prize stack

DeFi and Onchain Applications ($2,000) + Best use of Arc ($1,000) + QuickNode Streams ($500) = **$3,500**, plus an Official Winner place (up to $2,500).

Track fit: "new DeFi primitives" and "capital efficiency, risk management, liquidity" are the first objective. The README must explain the economic design and risk assumptions, which this idea has in abundance.

#### Build estimate: about 60 person-hours

| Piece | Hours |
| --- | --- |
| Contract, Foundry tests, deploy | 12 |
| Solver, both versions, with simulation | 12 |
| Circle wallets, sign-in, Gas Station | 8 |
| Stream, webhook, graph store | 8 |
| Frontend with graph animation | 12 |
| Seed data and demo script | 2 |
| README, diagram, video, Devpost | 6 |

**Day-by-day for four people**

| Day | Contracts | Solver and data | Wallets and backend | Frontend and submission |
| --- | --- | --- | --- | --- |
| Mon evening | Install Arc Foundry, deploy a hello-world contract, start faucet collection | Write the graph types and cycle finder against a JSON fixture | Circle Console account, API key, one developer-controlled wallet on Arc testnet | Scaffold Next.js, pick the graph library |
| Tue | `propose`, `accept`, `settle` with tests; deploy | Cycle cancelling end to end against the deployed contract | Wallet per business, sponsored `accept` call | Invoice inbox and graph view on mock data |
| Wed | Cash caps, due dates, early-clearing flag; fuzz test conservation | Max-flow over chains with caps; QuickNode Stream and webhook | Webhook to solver trigger; seed script | Before-and-after round view; wire to live data. Circle and QuickNode office hours. |
| Thu | Freeze contract by noon; verify on explorer; README economics section | Solver hardening, simulation, retries | Deploy app and backend | Record video, write README and Devpost answers; feature freeze in the evening |
| Fri | Submit by 10:00 AM | | | |

**Cut first, in order:** EURC as a second currency (cut before starting), `Memo` invoice references, max-flow over chains (keep cycle cancelling only), bring-your-own-wallet. The floor that still wins a hearing is: accept invoices, cancel cycles onchain in one transaction, show the graph collapse.

#### Risks

| Risk | Mitigation |
| --- | --- |
| First contract the team has deployed | The contract is one file with no external protocol calls. Start it Monday night. Property-test that the sum of net positions is zero and no balance goes negative. |
| Judges see B2B plumbing, not a product | Open the pitch on one named business that cannot make payroll because it is owed money. Show its statement before and after. |
| "Why would businesses post invoices publicly?" | Answer in the README and on stage: privacy is the next step, and name Arc Privacy Sector. |
| Gas for a large round is higher than estimated | Cap a round at a tested size. Measure on testnet Tuesday. |
| Prior art (Cycles) | Cite it. The claim is "first open clearing contract on Arc, with an untrusted solver", not "we invented netting". |
| Streams credit burn on a 0.5-second chain | Pause when idle. Keep a viem `watchContractEvent` fallback so the demo does not depend on the Stream being up. |

#### Demo script (5 minutes)

1. **0:00** "Maria's bakery is owed $400 and owes $380. She has $20 in the bank. So do the five businesses around her. Nobody can pay first." Show the tangled graph: six businesses, 1,150 USDC of invoices, 40 USDC of total cash.
2. **1:00** A new invoice is accepted live on a phone. The graph updates within a second, driven by the Stream.
3. **1:45** Press "Run clearing round". One transaction. The graph collapses on screen. Show the explorer: one transaction hash, sub-second finality, a fee of a fraction of a cent.
4. **2:45** Show the numbers: debt discharged, cash moved, cash each business still holds. Open Maria's statement.
5. **3:30** Show the safety property: submit a deliberately invalid solution and watch it revert.
6. **4:15** Why Arc, what is public today, and what comes next (privacy, EURC, credit for the residual).

#### Score against the judging criteria (1 to 5)

| Criterion | Score | Reason |
| --- | --- | --- |
| Technical Execution | 5 | Own contract doing real work, an optimisation solver, verification onchain, a Stream as the trigger. |
| Product & UX | 3 | Clear problem. The product is a dashboard, and B2B. |
| Innovation | 5 | A new primitive for Arc, in the area Arc's own team says is missing. |
| Impact & Potential | 4 | Strong evidence for the problem. Adoption needs privacy and a network of businesses. |
| Demo | 5 | The collapsing graph is visual, fast, and repeatable, with no live dependency on thin testnet liquidity. |

---

### Idea 2: peer-to-peer FX at the mid rate

**One line.** A remittance app where people sending dollars to euros are matched against people sending euros to dollars. Matched money never crosses a market, so both sides get the mid rate with no spread.

#### The problem

- **Who has it.** Anyone sending money across currencies: international students, freelancers, families.
- **Evidence.** The World Bank's global average cost of sending $200 was 6.49% in Q1 2025, against a UN target of 3% ([Remittance Prices Worldwide](https://remittanceprices.worldbank.org/sites/default/files/rpw_main_report_and_annex_q125_1_0.pdf)). A newer 6.36% figure appears in secondary sources only (unverified). Report 02 recorded that non-USD stablecoin FX liquidity is shallow.
- **Why current solutions fall short.** Stablecoin remittance apps swap through a pool or a market maker and pay its spread. On Arc testnet that pool is thin enough that Circle's own quickstart warns swaps may revert.

#### What exists and what is new

- Wise began as exactly this matching model offchain. CoW Protocol runs batch auctions that match opposing orders on Ethereum. Neither is on Arc.
- On Arc: arctan(x) (exchange built on StableFX) and Circle's `arc-stablecoin-fx` sample (swap with a fee). Both route through liquidity.
- **New here:** batch matching of opposing USDC and EURC transfers onchain at a signed mid rate, with only the unmatched remainder touching a liquidity source. I found no Arc project doing this (unverified).

#### Why it is not simple

Orders collect for a short window, then a contract clears the whole batch at one uniform price, fills both sides pro rata, and hands only the imbalance to a keeper. That is a frequent batch auction with a verified price signature and an atomic two-currency settlement.

#### Architecture

| Component | Where | What it does |
| --- | --- | --- |
| `Matcher` contract | Arc testnet | Holds deposited orders for the current window (sell token, amount, worst acceptable rate, recipient). `clear(window, rate, signature)` checks the price signature and freshness, matches both sides pro rata at that rate, pays recipients, and leaves the remainder for the keeper or the next window. |
| Price signer | Offchain | Signs a EUR/USD mid rate from a public FX source every few seconds. The contract accepts only this signer and only recent timestamps. |
| Keeper | Offchain, TypeScript | Calls `clear` each window. Fills the remainder from its own inventory at the mid rate plus a small posted fee, then rebalances through App Kit Swap or Earn when it can. |
| Stream | QuickNode | Filters `OrderPlaced` and `Cleared` events to a webhook that drives the keeper and the live "matching now" screen. |
| Wallets | Circle passkey modular wallets with Gas Station | No seed phrase, no gas. |
| Funding | Gateway unified balance or CCTP | A sender can fund from USDC on another chain. Stretch goal. |
| App | Next.js, mobile-first | "Send €50 to Ana." Shows the rate, the amount matched peer to peer, and a comparison against a bank and a typical app. |

#### Prize stack

Consumer Applications ($2,000) + Best use of Arc ($1,000) + QuickNode Streams ($500) = **$3,500**, plus an Official Winner place. It could enter DeFi instead; Consumer is the better fit because the frontend is the product and the Arc objectives name FX.

#### Build estimate: about 52 person-hours

Contract and tests 12. Price signer and keeper 10. Passkey wallets and Gas Station 6. Stream and webhook 5. Mobile frontend 11. Seed and second-device demo setup 2. Submission 6.

| Day | Goal |
| --- | --- |
| Mon evening | Passkey wallet sends sponsored USDC and EURC on Arc testnet. Contract skeleton deployed. Start collecting EURC from the faucet. |
| Tue | Place orders from two phones. `clear` works at a hard-coded rate. |
| Wed | Signed price with freshness check. Keeper fills the remainder. Stream drives the live screen. |
| Thu | Comparison screen, polish, deploy, README, video. Freeze in the evening. |

**Cut first:** crosschain funding, keeper rebalancing through Swap (give the keeper fixed inventory), the fee, the comparison screen's live data.

#### Risks

| Risk | Mitigation |
| --- | --- |
| The price comes from the team's own signer | State it as the main trust assumption. Show the freshness and deviation checks. Name a production oracle as the replacement. |
| Matching needs both sides present | The demo is scripted with two phones. The keeper guarantees a fill when one side is missing. Say so. |
| Thin EURC from the faucet | Keep amounts small. Collect from day one. |
| Judges read it as "another remittance app" | Lead with the matched-versus-swapped split and the zero spread. The match is the story. |
| No cash-out step | Same gap as every stablecoin remittance demo. Acknowledge it. |

#### Demo script

1. Two phones. One user sends $54 to Europe, the other sends €50 to the US.
2. Both tap send. The screen shows "matching", then "matched peer to peer at 1.0812, spread 0".
3. Show the single clearing transaction on the explorer and both recipients' balances.
4. A third, unmatched order arrives. The keeper fills it, and the app shows the small fee, honestly labelled.
5. Close on the comparison: bank, typical app, this.

#### Scores

| Criterion | Score | Reason |
| --- | --- | --- |
| Technical Execution | 4 | Batch auction contract, signed price, keeper, Stream. The oracle is self-run. |
| Product & UX | 5 | One sentence, one screen, a relatable user. |
| Innovation | 3 | New on Arc, but the model is known from Wise and CoW. |
| Impact & Potential | 4 | Large, well-evidenced problem. Needs two-sided volume and cash-out. |
| Demo | 4 | Two phones matching is clear. It depends on two devices behaving on stage. |

---

### Idea 3: verifiable metering for usage-priced agent payments

**One line.** An agent pays for an LLM or compute call under x402's `upto` scheme, where the seller decides the final charge. This adds signed usage receipts and an onchain challenge so the seller cannot overbill.

#### The problem

- **Who has it.** Any agent paying a variable price: per token, per second of compute, per megabyte.
- **Evidence.** In `upto`, "the buyer signs for a maximum, and the seller settles the actual amount after serving the request" ([Circle](https://developers.circle.com/facilitator-service/how-it-works)). The seller computes that amount alone. The x402 scheme overview describes no way for the buyer to verify or dispute it ([x402 docs](https://docs.x402.org/schemes/overview)). I did not read the full `upto` spec, so an extension I missed is possible (unverified). Report 01 already recorded that x402 has no refund path.
- **Why current solutions fall short.** Spend caps bound the loss per call but do not detect overbilling under the cap. Escrow and refund projects (the crowded lane) need someone to judge quality. Metering is different: it is a number both sides can count.

#### What exists and what is new

- Spend-limit wrappers, payment firewalls, and refund protocols are all crowded (report 01).
- I found no project that makes an `upto` charge provable (unverified). `upto` reached Arc with Circle's Facilitator Service in September 2026 (report 01, secondary), and Arc is the only testnet where Circle supports it, so few teams anywhere can have built on it.
- **New here:** a hash-chained, seller-signed running meter delivered with the streamed response, and a per-session escrow address so the contract knows exactly what was charged.

#### Why it is not simple

The seller is paid into a counterfactual escrow address unique to the session, so that address's balance is the charge. The seller can withdraw only up to the last meter reading it signed, and the buyer can challenge within a short window by presenting a lower signed reading, which slashes the seller's bond. It is a payment-channel dispute game applied to a metered HTTP call.

#### Architecture

| Component | Where | What it does |
| --- | --- | --- |
| Seller gateway | Offchain, Express with `@x402/express` and `@x402/evm/upto/server` | Proxies an LLM API. Streams the answer with a signed meter record every N tokens: session id, sequence, cumulative units, cumulative price, hash of the previous record. Settles the final amount through the facilitator. |
| Buyer agent and guard | Offchain | Counts tokens itself, checks each record's signature and chain, refuses to continue if the meter runs ahead, and keeps the last record. |
| `MeterEscrow` factory | Arc testnet | Computes a CREATE2 address per session as the `payTo`. Releases to the seller up to the acknowledged reading. Accepts a challenge with a seller-signed record and refunds the difference from the escrow and the seller's bond. |
| Reputation | Arc testnet, ERC-8004 Reputation registry | Each clean session and each lost challenge is written as feedback on the seller's agent identity. |
| Stream | QuickNode | Filters USDC transfers into escrow addresses and `Challenged` events. The webhook compares each settled amount with the buyer's last record and files the challenge automatically. |
| Dashboard | Next.js | Live meter, charge, and verdict per session. |

#### Prize stack

Agentic Payments and AI ($2,000) + Best use of Arc ($1,000) + QuickNode Streams ($500) = **$3,500**, plus an Official Winner place. The track's required "decision loop and safety limits" documentation maps directly onto the guard.

#### Build estimate: about 50 person-hours

Seller gateway with `upto` 9. Buyer agent and guard 8. Escrow factory, bond, challenge, tests 13. Stream and auto-challenge 5. Dashboard 7. ERC-8004 writes 2. Submission 6.

| Day | Goal |
| --- | --- |
| Mon evening | **Gate:** one `upto` payment settles on Arc testnet through Circle's facilitator with a Circle API key and a Permit2 allowance. If this is not working by Tuesday noon, drop the idea. |
| Tue | Signed meter records in the stream. Buyer verifies. Escrow contract deployed. |
| Wed | Per-session `payTo`, withdrawal, challenge, slash. Stream files a challenge. |
| Thu | Dashboard, cheating-seller scenario, README, video. |

**Cut first:** ERC-8004 reputation, the bond (refund from escrow only), automatic challenges (make it a button).

#### Risks

| Risk | Mitigation |
| --- | --- |
| **The facilitator may not settle to a contract `payTo`.** Circle's seller proof is "an EIP-712 signature from the key controlling `payTo`". Whether a contract can satisfy that is unknown (unverified). | Test on Monday. Fallback: self-host a facilitator with `@x402/evm/upto/facilitator` against the Permit2 proxy already deployed on Arc testnet (`0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002`). That weakens the "Circle tools" story. |
| Most crowded lane on Arc | 97% and 98% of Arc entries at two events were agentic. This is not a spend limit, but a tired judge may not look closely. |
| Infrastructure with no visible user | Report 01 warned that infrastructure without a user story wins less often. Frame the user as a developer whose agent's bill tripled. |
| `upto` is new | SDK and facilitator behaviour may have rough edges nobody has documented. |

#### Demo script

1. An agent asks a paid model a question. The meter ticks on screen next to the agent's own count.
2. Honest seller: charge equals meter. Funds release. Reputation goes up.
3. Flip a switch: the seller settles 40% above its own meter. The Stream catches the transfer, the challenge is filed, the contract refunds the difference and slashes the bond, in about a second.
4. Show the three transactions on the explorer.

#### Scores

| Criterion | Score | Reason |
| --- | --- | --- |
| Technical Execution | 5 | Counterfactual escrow, signed receipt chain, dispute game, newest Circle product. |
| Product & UX | 3 | Developer tooling. |
| Innovation | 4 | I found nothing like it, but it sits in a lane judges are tired of. |
| Impact & Potential | 3 | Real gap, but agent payment volume is still small (report 01). |
| Demo | 4 | The caught overbilling is a clean cause and effect. |

---

### Idea 4: rate-locked invoices (an onchain FX forward)

**One line.** A freelancer invoices a client in euros and locks today's dollar value for the 30 or 60 days until it is paid. A liquidity vault takes the other side, and the contract settles the difference in USDC at maturity.

#### The problem

- **Who has it.** Freelancers and small exporters paid in a foreign currency weeks after invoicing.
- **Evidence.** I did not gather primary figures for small-business FX losses, so this problem statement rests on general knowledge that bank forwards require credit lines and minimum sizes that small firms do not meet (unverified).
- **Why current solutions fall short.** Converting on receipt leaves the rate risk in the gap. Onchain options (BulwArc) cost a premium and are harder to explain than "lock the rate".

#### What exists and what is new

- BulwArc built EUR/USD options on Arc at ETHGlobal Cannes. arctan(x) built an FX exchange. Circle's StableFX is spot.
- **New here:** a forward attached to an invoice, priced from interest-rate parity using the live USDC and EURC Earn vault rates on Arc as the two interest rates. I found no forward on Arc (unverified). The distance from BulwArc is real but not large.

#### Why it is not simple

A forward is a margined derivative: the contract must price it from two interest rates, hold margin from both sides, mark it against a price feed, liquidate a side that runs out of margin, and settle the difference at maturity.

#### Architecture

- **`ForwardVault` (Solidity, Arc testnet):** liquidity providers deposit USDC. `open(notionalEUR, maturity)` fixes the forward rate and takes margin. `settle` pays the difference at maturity. `liquidate` closes an under-margined position.
- **Pricing (offchain, checked onchain):** forward = spot × (1 + USDC rate × t) ÷ (1 + EURC rate × t), with the two rates read from Earn vaults.
- **Price feed:** a self-signed EUR/USD price, because no feed address was confirmed on Arc testnet.
- **Stream (QuickNode):** filters `Opened` and price-update events to a webhook that runs the liquidation keeper.
- **App (Next.js):** create an invoice, see "you will receive $5,406 on Dec 16 whatever the euro does", pay the invoice in EURC, settle.

#### Prize stack

DeFi and Onchain Applications ($2,000) + Best use of Arc ($1,000) + QuickNode Streams ($500) = **$3,500**, plus an Official Winner place.

#### Build estimate: about 55 person-hours

Vault, margin, liquidation, tests 18. Pricing and price signer 8. Stream and keeper 6. Wallets 5. Frontend 12. Submission 6.

| Day | Goal |
| --- | --- |
| Mon evening | Read both Earn vault rates on Arc testnet. Contract skeleton. |
| Tue | Open and settle a forward at a hard-coded price. |
| Wed | Signed price, margin, liquidation, keeper on the Stream. |
| Thu | Invoice flow, time-skip for the demo, README, video. |

**Cut first:** liquidation (fully collateralise instead), invoice payment in EURC, the liquidity provider screen.

#### Risks

| Risk | Mitigation |
| --- | --- |
| A derivative on a self-signed price | The weakest point. A DeFi judge will ask. |
| Maturity is weeks away | The demo needs an admin time-skip, which looks staged. |
| Largest contract of the four, for a team new to Solidity | Margin and liquidation maths are where first contracts go wrong. |
| Prior art in the same niche on the same chain | BulwArc. |

#### Demo script

1. Create a €5,000 invoice due in 30 days. The app quotes the locked dollar amount and shows the two vault rates behind it.
2. Move the price feed down 4%. An unhedged freelancer has lost $216; this one has not.
3. Skip to maturity. The client pays in EURC, the vault settles the difference, the freelancer receives the locked amount.

#### Scores

| Criterion | Score | Reason |
| --- | --- | --- |
| Technical Execution | 4 | Real derivative logic, weakened by the self-run price. |
| Product & UX | 4 | "Lock the rate" is easy to grasp. |
| Innovation | 3 | Forward rather than option, with parity pricing from Earn rates. |
| Impact & Potential | 3 | Real need, thin evidence gathered, needs deep liquidity. |
| Demo | 3 | Depends on a time-skip and a moved price. |

---

### Considered and dropped

| Idea | Why dropped |
| --- | --- |
| Confidential payroll or private transfers | Arc's privacy sector is not live. Building privacy from scratch is beyond a team new to contracts. |
| Treasury autopilot into USYC | Allowlisting takes 24 to 48 hours through a support ticket, and treasury sweeps are a crowded lane (ArcFlow won with one). |
| cirBTC loan autopilot (Borrow Kit health webhooks trigger a top-up) | Buildable, and a Gemini-free cousin of the liquidation guard. Mostly SDK integration, so it fails the "not simple" test, and auto-protect tools are familiar from other chains. |
| One-signature crosschain checkout with CCTP hooks | Arc's team calls crosschain "expected rather than differentiating". |
| Job market on ERC-8183 with an AI evaluator | Circle ships an AI-validated escrow sample, and several hackathon entries did the same. `IDEAS.md` lists agent marketplaces as saturated. |
| Offline or tap payments | ETHastic won at Cannes with offline radio payments, and tap-to-pay won this organiser's Circle bounty last year. |
| Anything in the Consumer track with real depth beyond idea 2 | I did not find one. Consumer depth on Arc mostly reduces to wallets and gas sponsorship, which report 03 already called solved. |

## 6. Ranked comparison and top pick

| Rank | Idea | Track | Max cash (plus Official Winner) | Person-hours | Scores T / P / I / Im / D | Total | Biggest risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Multilateral invoice clearing | DeFi | $3,500 | 60 | 5 / 3 / 5 / 4 / 5 | 22 | B2B framing; first contract for the team |
| 2 | Peer-to-peer FX at the mid rate | Consumer | $3,500 | 52 | 4 / 5 / 3 / 4 / 4 | 20 | Self-signed price; reads as "another remittance app" |
| 3 | Verifiable metering for `upto` | Agentic | $3,500 | 50 | 5 / 3 / 4 / 3 / 4 | 19 | Facilitator may not pay a contract address; most crowded Arc lane |
| 4 | Rate-locked invoices | DeFi | $3,500 | 55 | 4 / 4 / 3 / 3 / 3 | 17 | Derivative on a self-signed price; prior art on Arc |

The scores are my judgement, with no published weights behind them.

### Top pick: idea 1, multilateral invoice clearing

- **It answers the team's complaint directly.** The core is a graph optimisation verified onchain, which is the "how did they build that" factor, and the contract itself stays small.
- **It is in the gap Arc's own team described.** Their HackMoney write-up says submissions built familiar workflows, "not new financial primitives". This is a new one, in the treasury objective.
- **It has no fragile dependency.** No oracle, no thin swap pool, no gated product, no API key that might not arrive. Ideas 2 and 4 need a self-signed price and idea 3 has an untested facilitator question.
- **The demo is visual and repeatable,** and the faucet limit helps the story instead of hurting it.
- **It degrades safely.** Cycle cancelling alone, with no cash moving at all, is still a complete and striking demo.

**What it gives up.** The user is a business, not a person, so Product & UX is its weakest score. If the team believes the UBC judges favour consumer stories above all, idea 2 is the alternative, at lower novelty.

**Compared with the guardian voice wallet:** the same cash ceiling, about twice the build, no ElevenLabs perk, and a much stronger answer on Technical Execution and Innovation. It is the better choice only if the team values the track and Official Winner odds over a safe finish.

### Questions for office hours

| Slot (CST) | Sponsor | Ask |
| --- | --- | --- |
| Wed 6:00–7:00 PM (and Mon if still open) | Circle | Has anyone built obligation netting on Arc? Is stock Foundry fine or is Arc Foundry required? What is the faucet limit, and can a team get more testnet USDC and EURC? Is there a EUR/USD feed live on Arc testnet? For idea 3: can `payTo` be a contract? |
| Wed 7:00–8:00 PM | QuickNode | Credit cost per block for a logs Stream on Arc testnet at two blocks a second. Whether the hackathon credits cover three days of it. |

## 7. Not verified

- **This year's field.** How many teams are on Arc, and in which track, is unknown. The saturation analysis comes from other events.
- **Novelty claims.** "No netting project on Arc", "no peer-to-peer FX matching on Arc", "no verifiable `upto` metering", and "no forward on Arc" rest on web search. ETHGlobal's showcase search did not return usable results for "netting", and Devpost cannot be fetched.
- **Gas cost of a clearing round.** Estimated, not measured.
- **Cycles Protocol's status** and whether it has an EVM deployment.
- **Faucet limits.** 20 USDC per 2 hours per address is from a third-party guide. The EURC amount is unstated.
- **A EUR/USD price feed on Arc testnet.** Not found. Ideas 2 and 4 assume there is none.
- **Whether Circle's facilitator settles `upto` to a contract `payTo`,** and the size of the keyless trial allowance. This decides idea 3.
- **Earn and Borrow on testnet.** Documented as live. I did not call them, so vault and market availability is unconfirmed.
- **Whether stock Foundry deploys to Arc testnet without the Arc fork.**
- **Nanopayments batch interval** and whether Nanopayments still reject smart-account signatures.
- **QuickNode Streams credit cost on Arc testnet.**
- **Problem evidence for idea 4.** No primary figures gathered.
- **Winners of the lablab.ai Arc events.** Sources conflict.
- **Grok Bot.** Not researched further.

## 8. Sources

Arc docs

- https://docs.arc.io/arc/references/contract-addresses
- https://docs.arc.io/arc/references/evm-differences
- https://docs.arc.io/arc/references/gas-and-fees
- https://docs.arc.io/arc/concepts/opt-in-privacy
- https://docs.arc.io/arc/concepts/transaction-memos
- https://docs.arc.io/arc/concepts/batched-transactions
- https://docs.arc.io/arc/concepts/deterministic-finality
- https://docs.arc.io/arc/references/sample-applications
- https://docs.arc.io/arc/tools/oracles
- https://docs.arc.io/build/stablecoin-fx
- https://docs.arc.io/build/agentic-economy
- https://docs.arc.io/app-kit/references/supported-blockchains
- https://docs.arc.io/app-kit/swap
- https://docs.arc.io/app-kit/quickstarts/swap-tokens-same-chain
- https://docs.arc.io/app-kit/earn
- https://docs.arc.io/app-kit/borrow
- https://docs.arc.io/app-kit/howtos/borrow/monitor-a-loan
- https://docs.arc.io/app-kit/unified-balance

Circle docs

- https://developers.circle.com/facilitator-service/how-it-works
- https://developers.circle.com/facilitator-service/supported-networks
- https://developers.circle.com/facilitator-service/keyless-trial
- https://developers.circle.com/facilitator-service/quickstart
- https://developers.circle.com/gateway-nanopayments/supported-networks
- https://developers.circle.com/gateway-nanopayments/concepts/batched-settlement
- https://developers.circle.com/gateway/references/erc-1271
- https://developers.circle.com/gateway/references/supported-blockchains
- https://developers.circle.com/cctp/concepts/supported-chains-and-domains
- https://developers.circle.com/cctp/expanded-assets/concepts/hooks
- https://developers.circle.com/cctp/expanded-assets/howtos/build-hook-receiver
- https://developers.circle.com/cctp/expanded-assets/concepts/supported-chains-and-domains
- https://developers.circle.com/paymaster
- https://developers.circle.com/wallets/gas-station
- https://developers.circle.com/wallets/supported-blockchains
- https://developers.circle.com/agent-stack/agent-wallets/supported-blockchains
- https://developers.circle.com/agent-stack/agent-wallets/wallet-operations/custom-policies
- https://developers.circle.com/stablefx

Prior work and evidence

- https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned
- https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned
- https://ethglobal.com/showcase?q=bulwarc
- https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2026/
- https://cycles.money/whitepaper.pdf
- https://wiki.p2pfoundation.net/Liquidity-Saving_through_Obligation-Clearing_and_Mutual_Credit
- https://www.cls-group.com/media/ruxdgeyd/cls-shaping-fx-03-liquidity-benefits_do_not_settle_for_less.pdf
- https://remittanceprices.worldbank.org/sites/default/files/rpw_main_report_and_annex_q125_1_0.pdf
- https://docs.x402.org/schemes/overview

Also checked today: the npm registry for the package versions in section 2, and the Arc testnet RPC (`https://rpc.testnet.arc.io`) for chain ID, block height, and contract code at each listed address.
