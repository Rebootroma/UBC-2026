# ResilienceOS

**Financial first responders for a changing climate.**

**Live demo:** https://resilienceos-six.vercel.app (Arc testnet; press Play on the Command Center)

ResilienceOS is a disaster financial-response system for small businesses. It replays a real hurricane (Beryl, Texas, July 2024) from real NOAA station data. It shows which fictional covered businesses are exposed, and checks each verified weather observation against predefined policy triggers. When a trigger is met, a smart contract on Circle's Arc testnet pays the policyholder in USDC. Five AI agents explain what is happening. None of them can move money.

```
DISASTER → EXPOSURE → VERIFICATION → FINANCIAL PROTECTION → SETTLEMENT
```

> **Prototype.** The 80 businesses are fictional. Payouts use Arc **testnet** USDC at a demo scale of 1 USDC = $10,000 of modeled coverage. Nothing here is an insurance product or an offer of one.

University Blockchain Conference Hackathon 2026 · Track: **DeFi & Onchain Applications** · Chain award: **Best use of Arc**. Status of every piece: [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md).

---

## The problem

| Fact | Source |
| --- | --- |
| 27 US billion-dollar weather and climate disasters in 2024, about $182.7B in damage | NOAA NCEI / Climate.gov |
| 57% of 2024 global natural-catastrophe losses were uninsured, a $181B protection gap | Swiss Re Institute (via Reinsurance News); estimate |
| The median US small business holds **27 days** of cash | JPMorgan Chase Institute |
| 63% of disaster-hit small firms closed at least temporarily; only 11% relied on insurance money | NY Fed, Liberty Street Economics (2022) |
| Standard business-interruption cover needs direct physical damage and typically starts after a 72-hour waiting period | NAIC; ISO form |
| SBA disaster loans took ~74 days after Katrina; Hurricane Milton applicants caught in a funding lapse waited 73 days | GAO-06-860; SBA OIG 25-20 |
| Beryl made landfall near Matagorda, TX on 8 Jul 2024 (80 kt) and cut power to more than 2.26M CenterPoint customers | NOAA NHC TCR AL022024; Utility Dive |

A business with four weeks of cash cannot wait two months for a loan. Full sourcing, with established figures separated from estimates, is in [`docs/RESEARCH.md`](docs/RESEARCH.md).

## The solution

A **parametric** policy pays a fixed amount when an objective, independently measured condition is met. It does not wait for a loss adjuster. ResilienceOS makes that condition precise, verifiable and enforced in code:

> *Pay Gulf Coast Hardware $5,000 (0.50 testnet USDC) if the 2-minute sustained wind reported by ASOS station KPSX (Palacios) reaches ≥ 45 kt between 1 Jun and 30 Nov 2024. At most once per storm.*

During the Beryl replay, KPSX reported **47 kt sustained, gusting 70 kt, at 07:51 UTC**. The record is the real METAR `KPSX 080751Z AUTO 01047G70KT …`. The policy's trigger is met, the observation is verified and signed, and the contract pays the holder.

Automated parametric payouts are not new (see Arbol, FloodFlash, Etherisc in [`docs/COMPETITIVE_ANALYSIS.md`](docs/COMPETITIVE_ANALYSIS.md)). Our contribution is the combination: exposure intelligence, a validated observation pipeline, an on-chain enforced trigger with oracle authorization and replay protection, transparent reserve and solvency accounting, and AI explanations that are bound to verified facts. The target customer is the small business with no claims department.

## What runs today

| Capability | Status |
| --- | --- |
| Hurricane Beryl replay: NHC best track + 1,360 real ASOS reports from 20 Texas stations | ✅ |
| MapLibre command center: storm, wind radii, stations, 80 businesses, timeline with settlement gates | ✅ |
| Exposure model (wind, surge proxy, industry, proximity), with uncertainty shown | ✅ |
| Layered observation validation: source hash, independent METAR parse, quality flags, neighbour outliers | ✅ |
| `ParametricReserve` contract: oracle registry, EIP-712 observations, deterministic eligibility, replay protection, deferred payouts, pause | ✅ 30 Foundry tests |
| Settlement service: oracle signs → `submitAndSettle` → receipt decoded → dashboard updated | ✅ live on Arc testnet: [example payout tx](https://explorer.testnet.arc.io/tx/0xd2089f6663554dbec0a1e68be0af8bf0321c08a9e315941bb94eff95ce55f7a1) |
| Attack console: forged oracle and duplicate payout, rejected by the contract's own revert | ✅ |
| Five grounded AI agents (Claude, structured output, citation check, deterministic fallback) | ✅ |
| Payout explorer from decoded chain logs, reserve accounting, scenario stress tests, basis risk | ✅ |
| Public payout verification page (`/verify/<tx>`): re-downloads the report from the NOAA archive, recomputes its hash and the EIP-712 digest, and compares them with the chain; the visitor can rerun the hashing in their own browser | ✅ |
| QuickNode Streams: reserve events pushed to the dashboard by webhook, shown in a live chain feed | ✅ |
| Voice (ElevenLabs) | ❌ not built, see [Sponsor integrations](#sponsor-integrations) |

## Architecture

```
 NOAA NHC HURDAT2 best track        Iowa Environmental Mesonet ASOS archive (METAR)
            │                                        │
            ▼                                        ▼
   ┌───────────────────── Fixture builder (deterministic, committed raw data) ──────────────┐
   │  zod schema · METAR re-parse cross-check · gust/plausibility · neighbour outliers      │
   │  keccak256(raw METAR) source hash · 80 SYNTHETIC businesses + policies                 │
   └───────────────┬───────────────────────────────┬────────────────────────────────────────┘
                   │                               │
                   ▼                               ▼
        Geospatial exposure engine        Deterministic policy evaluator ◄── parity-tested
        (modeled, ranks attention)        (mirrors checkEligibility)          against the contract
                   │                               │
                   ├──────► AI agents (read-only fact sheets → Claude → Zod → citation check)
                   │                               │
                   ▼                               ▼
          Command center UI ◄──────── Settlement API: validate → oracle EIP-712 signature
                   ▲                               │
                   │                               ▼
                   │                ParametricReserve on Arc testnet (USDC)
                   │                 ORACLE_ROLE check · replay protection · eligibility
                   │                 pay holder or record owed · events
                   │                               │
                   └──── multicall state + decoded logs (Blockscout API / RPC getLogs)
```

**Code map**

| Path | What |
| --- | --- |
| `contracts/src/ParametricReserve.sol` | Settlement contract |
| `contracts/test/ParametricReserve.t.sol` | Foundry tests (unit, fuzz, reentrancy) |
| `data-raw/` | Raw public data exactly as downloaded (HURDAT2 extract, IEM CSV, station metadata) |
| `web/scripts/build-fixtures.ts` | Raw data → validated fixtures + synthetic portfolio |
| `web/scripts/chain.ts` | Deploy, register cohort, fund reserve, status |
| `web/src/lib/` | Domain logic: `metar`, `observations`, `geo`, `exposure`, `policy`, `settlement`, `chain/*`, `agents/*` |
| `web/src/app/api/` | `state`, `settle`, `attack`, `agents` route handlers |
| `web/src/components/` | Command center, map, views |
| `web/test/`, `web/e2e/` | Vitest unit + parity tests, Playwright E2E |

## Why blockchain

The trigger is *public and binding*:

- **Programmable funds.** The reserve sits in a contract that can only pay a registered holder after its own checks pass. The operator cannot quietly pay the wrong person or skip the rules.
- **Verifiable settlement.** Every payout is an Arc transaction that names the policy, the observation digest, the amount and the recipient. The business, a regulator or a reinsurer can check it without trusting our database.
- **Honest solvency.** Reserve, amount owed and remaining exposure are on-chain reads. If a storm triggers more than the reserve holds, claims are recorded as owed (`PayoutDeferred`), never silently dropped. Owed funds cannot be withdrawn.
- **Arc specifically.** USDC is the gas token, so fees are small and denominated in dollars. Funds settle in a stablecoin the business can use immediately. Standard EVM tooling (Foundry, viem) works unchanged.

A database could store the same numbers. It could not stop the operator from changing them.

## Why AI, and why it is not the payout authority

Five agents turn the event into explanations a business owner, an adjuster or a fund manager can act on:

| Agent | Role |
| --- | --- |
| Disaster Intelligence | Storm progression and the strongest recent verified readings |
| Business Exposure | Who is most exposed and why (modeled factors) |
| Coverage Analysis | Policy terms, the evidence, why a policy did or did not trigger, basis risk |
| Fraud & Integrity | Withheld records, silent stations (KPSX went silent at 10:22Z mid-storm), attack controls |
| Financial Response | Reserve, payouts, deferrals, solvency from on-chain reads |

**Safety design.** Agents get a *fact sheet* that the server computes from verified data and chain reads. They have no tools, keys, wallet or network access. Output must match a strict Zod schema. Every finding must cite fact IDs, and findings citing unknown IDs are dropped and counted. METAR text is passed as data, and the system prompt tells the model to ignore any instructions inside it. Payouts come only from the deterministic evaluator and the contract. With `AGENTS_MODE=deterministic` or no API key, agents fall back to a fact-only summary and every payout is identical. Model: `claude-opus-5-5` with structured outputs.

## Economic design and risk assumptions (DeFi track requirement)

- **Reserve.** Funded up front in USDC (`fundReserve`). In production, funding comes from premiums, a sponsor (a municipal resilience fund, CDFI or insurer) or reinsurance capital. See [`docs/PRODUCT_THESIS.md`](docs/PRODUCT_THESIS.md).
- **Payout.** A fixed amount per policy, paid at most once per storm (`settledForEvent[policy][event]`). The status then becomes `Paid`.
- **Shortfall.** When free reserve is less than the payout, the claim is recorded as owed with the shortfall amount. `payDeferred` pays it after a top-up. `withdrawFreeReserve` can never touch owed funds.
- **Correlation.** One storm hits neighbouring policies together. Risk Analytics stress-tests the portfolio by scaling every observed reading (×0.8 / ×1.0 / ×1.25 / ×1.5) and shows obligations against the funded reserve. These are modeled scenarios, not predictions.
- **Basis risk.** The index (station wind) and the business's actual loss can disagree. We show the highest-exposure businesses that did *not* trigger, because they are the first to contact for a conventional assessment.
- **Oracle trust.** One registered signer in this prototype. The contract supports any number of oracles, revocation and pause. The production path is k-of-n independent signers (or a decentralized oracle network) over multiple data providers.
- **Not modeled.** Pricing and premiums, the legal status of the product (in most US states parametric cover is insurance and needs a licensed carrier; see RESEARCH §6), KYC, and money-transmission rules for USDC payouts.

## Blockchain

| Item | Value |
| --- | --- |
| Network | Arc testnet, chain ID `5042002`, RPC `https://rpc.testnet.arc.network`, explorer `https://explorer.testnet.arc.io` |
| Settlement token | Circle USDC, ERC-20 interface `0x3600000000000000000000000000000000000000` (6 decimals) |
| `ParametricReserve` | [`0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6`](https://explorer.testnet.arc.io/address/0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6) (deploy tx [`0x6c4bd4da…`](https://explorer.testnet.arc.io/tx/0x6c4bd4dacc6b9cef9145ac051be93cd24da6608ed6055a874debcb07ef13c940)). The current cohort and all transaction hashes are in `web/src/data/deployment.json`. |
| Example payout | [`0xd2089f66…`](https://explorer.testnet.arc.io/tx/0xd2089f6663554dbec0a1e68be0af8bf0321c08a9e315941bb94eff95ce55f7a1): one signed KPSX observation (42 kt) paid Starboard Kids Academy (RSL-0005) 0.40 USDC |

**Contract interface (summary)**

- `registerPolicy` / `registerPolicies` (POLICY_ADMIN): holder, payout, threshold (deci-knots), coverage window, approved stations.
- `submitObservation(obs, sig)` (anyone relays): EIP-712 `Observation(eventId, stationId, observedAt, sustainedDeciKnots, gustDeciKnots, sourceHash)` signed by an `ORACLE_ROLE` key. It is rejected if the signer is unauthorized, the observation was already accepted, its timestamp is in the future, or its values are implausible.
- `checkEligibility(policy, digest)` → `Eligible | PolicyNotActive | UnknownObservation | StationNotApproved | OutsideCoverageWindow | BelowThreshold | AlreadySettledForEvent`.
- `settle` / `submitAndSettle` (permissionless): pays the registered holder or records a deferral.
- `payDeferred`, `fundReserve`, `withdrawFreeReserve` (TREASURER), `pause` (PAUSER), plus views.

## Security

| Threat | Control | Tested |
| --- | --- | --- |
| Forged or unauthorized weather data | ECDSA recovery over EIP-712 digest + `ORACLE_ROLE`; API only signs records from the verified dataset | Foundry + live attack console |
| Tampered value after signing | Digest changes, so the recovered signer is not an oracle | Foundry |
| Replayed observation | Each digest is accepted once | Foundry + attack console |
| Double payout | `settledForEvent[policy][event]` + `Paid` status | Foundry + attack console |
| Redirected payout | Recipient fixed at registration; `settle` has no recipient argument | Foundry |
| Reserve drain | Reserve checks, owed funds locked, `TREASURER_ROLE` only | Foundry |
| Reentrancy | `ReentrancyGuard`, checks-effects-interactions, `SafeERC20` | Malicious-token test |
| Future or garbage timestamps, implausible winds | 5-minute future skew, 200 kt bound, gust ≥ sustained | Foundry + Vitest |
| Bad source data | Schema, METAR re-parse, quality flags, neighbour outliers; missing data never triggers | Vitest |
| LLM error or prompt injection | No tools or keys; schema + citation validation; deterministic fallback | Vitest |
| Secrets | Keys only in `web/.env.local` (gitignored); never logged or committed | — |

## Running the demo (presenter guide)

Anyone on the team can run this. It takes about 5 minutes to set up, and the walkthrough runs 2:45. No real money is involved: everything is on Arc **testnet**, and its USDC comes free from a faucet and has no value.

### 1. One-time setup

1. Install [Node.js 20+](https://nodejs.org) and [Foundry](https://book.getfoundry.sh/getting-started/installation).
2. Clone the repo and install (see [Installation](#installation)): `cd web && npm install` (everything is on `main`).
3. **Keys.** The app needs `web/.env.local`, which is not in git. Choose one:
   - **Use the existing deployment** (recommended). Get `web/.env.local` from the teammate who deployed, through a private DM, never GitHub or a public channel. The app then uses the deployed contract below.
   - **Make your own deployment.** `cp .env.example .env.local`, then run `cast wallet new` three times and paste the keys in as admin, oracle and attacker. Get free USDC for the admin address at https://faucet.circle.com (pick **Arc Testnet**). Then run `npm run chain -- deploy && npm run chain -- fund 45 && npm run chain -- cohort` and commit the updated `web/src/data/deployment.json` (it holds addresses only, no keys).

### 2. Before each run (about 1 minute)

```bash
cd web
npm run chain -- status    # admin needs ≥ 0.5 USDC for gas; check reserveBalance
npm run chain -- cohort    # registers 80 fresh, unpaid policies, so the payouts you show are new
npm run dev                # open http://localhost:3000
```

- In the header, confirm **"Arc testnet · block …"** is shown. If it says "Contract not deployed", your `.env.local` or `deployment.json` is wrong.
- Optionally, open the [reserve contract on the explorer](https://explorer.testnet.arc.io/address/0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6) in a second tab.
- **Budget.** A full Beryl replay pays about 44 USDC at demo scale. When the reserve runs out, later claims show as **Deferred** (owed on chain). That's correct behaviour and worth pointing out. To pay everyone, top up the admin from the faucet and run `npm run chain -- fund <amount>`.

### 3. The walkthrough

Full script with lines to say: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md). The clicks:

1. **Command Center.** Choose speed **45 min/s** and press **Play**. The storm moves, stations light up and business dots change colour by exposure.
2. **Settlement gate.** The replay pauses automatically when a station reading meets a policy trigger (first: Palacios KPSX, 42 kt, paying Starboard Kids Academy; the 47 kt reading that pays Gulf Coast Hardware is the second gate). The checklist turns green and a **transaction hash** appears. Click it to show the payout on the Arc explorer.
3. **Business tab.** Click a paid business (Gulf Coast Hardware) and open **"Why this business was paid"**: the rule, the reading, the raw METAR, the transaction.
4. **AI Intelligence.** Click **Analyze** on Coverage, then on Integrity. Agents cite facts and have no keys. Without `ANTHROPIC_API_KEY` they run in deterministic mode, which is labeled in the UI. Say so if asked.
5. **Contracts & Security.** Click **Simulate against Arc** on the forged-oracle attack → `UnauthorizedOracle`. Click it on the duplicate payout → `NotEligible(AlreadySettledForEvent)`. Both rejections come from the live contract.
6. **Verify independently.** In the Payout Explorer, click **Verify independently** on a payout. The page re-downloads the weather report from the public NOAA archive and shows it matches what the contract recorded. Change one character of the report, click **Recompute in my browser**, and the match fails.
7. **Payout Explorer**, then **Risk Analytics**: decoded on-chain payouts, live reserve balance, stress test (a 1.25× storm exceeds the reserve).
8. Press **Play** again to let the storm finish. Paid businesses turn green.

### 4. If something goes wrong

| Symptom | Fix |
| --- | --- |
| Gate stuck on "Settling…" | The Arc RPC is slow. Keep talking about the checklist; it usually clears in 5 to 20 s. |
| Red error at a gate | Read it out. Usually the admin is out of gas (`npm run chain -- status`). Show an earlier payout from the Payout Explorer instead. |
| "already been settled" at the first gate | You skipped `npm run chain -- cohort`. Run it and reload. |
| Map is blank | Check your internet connection (the basemap tiles load from CARTO). |
| Everything after some point is "Deferred" | The reserve is empty. That's expected behaviour; see Budget above. |

Never claim a payout the explorer doesn't show.

## QuickNode Stream configuration

| Setting | Value | Why |
| --- | --- | --- |
| Network | Arc testnet | Where `ParametricReserve` is deployed |
| Dataset | Logs | Payouts, deferrals and accepted observations are all contract events |
| Filter | [`web/quicknode/stream-filter.js`](web/quicknode/stream-filter.js) | Keeps only logs emitted by the reserve contract and returns `null` for every other block, so the app receives a few events instead of every block |
| Destination | Webhook, `POST https://resilienceos-six.vercel.app/api/stream` | Pushes each payout to the dashboard as it is mined, without waiting for the block explorer to index it |
| Security token | Set as `QUICKNODE_STREAM_TOKEN` on the host | The route recomputes HMAC-SHA256 over nonce + timestamp + body and rejects anything else with 401 |

The receiver is `web/src/lib/chain/stream.ts`. It decodes each log with the contract ABI, ignores logs from any other address, de-duplicates by transaction and log index, and merges the events into `/api/state`. Events are kept in the Vercel Runtime Cache so every function instance sees them; the cache is regional and can be evicted, so the explorer and RPC read stays as the fallback. `GET /api/stream` shows delivery counters, and the header shows a "QuickNode Stream" badge once a delivery has arrived. The Stream starts at the latest block (no backfill) and runs until paused.

## Installation

Requirements: Node 20+ (tested on 24), [Foundry](https://getfoundry.sh).

```bash
git clone https://github.com/Rebootroma/UBC-2026.git && cd UBC-2026
git checkout feat/resilienceos

# contracts
cd contracts && ./install.sh && forge test && cd ..

# app
cd web && npm install
cp .env.example .env.local      # then fill in the keys (see below)
npm run fixtures                # rebuild fixtures from data-raw (already committed)
npm run dev                     # http://localhost:3000
```

### Configuration (`web/.env.local`)

| Variable | Needed for | Notes |
| --- | --- | --- |
| `ADMIN_PRIVATE_KEY` | deploy, register, relay settlements | Testnet-only key; pays gas in USDC |
| `ORACLE_PRIVATE_KEY` | signing observations | Granted `ORACLE_ROLE` at deploy |
| `ATTACKER_PRIVATE_KEY` | attack demo | A key with **no** role |
| `ARC_RPC_URL` | optional | Defaults to `https://rpc.testnet.arc.network` |
| `ANTHROPIC_API_KEY` | optional | Without it, agents run in deterministic mode |
| `AGENTS_MODE` | optional | `deterministic` forces the no-LLM path |
| `ALLOW_BROADCAST_ATTACKS` | optional | `true` lets the attack console send real (reverting) transactions |

To create the three testnet-only keys, run `cast wallet new` three times (Foundry) and paste each private key into `web/.env.local`. Never share or commit them. Only the admin address needs faucet USDC.

### Deploy to Arc testnet

```bash
cd web
npm run chain -- status          # shows the admin's USDC balance (fund it at https://faucet.circle.com → Arc Testnet)
npm run chain -- deploy          # deploys ParametricReserve with Arc USDC, grants ORACLE_ROLE
npm run chain -- fund 40         # approve + fundReserve(40 USDC)
npm run chain -- cohort          # registers all 80 policies under a fresh cohort id
```

These commands write the addresses and transaction hashes to `web/src/data/deployment.json`. Run `cohort` again to give a fresh demo run new, unpaid policies.

## Running tests

```bash
cd contracts && forge test                    # 30 tests incl. fuzz + reentrancy
cd web && npm test                            # Vitest: 33 unit tests + Anvil parity test (240 pairs)
cd web && npx playwright install chromium && BASE_URL=http://localhost:3000 npx playwright test   # E2E (needs a running, deployed app)
cd web && npm run typecheck && npm run lint
```

Latest results are recorded in [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md).

## Data

| Data | Source | Label in UI |
| --- | --- | --- |
| Storm track, intensity, wind radii | NOAA NHC HURDAT2 best track, storm AL022024 (post-storm hindsight analysis, not a real-time forecast) | `best-track` / `interpolated` |
| Station observations | NOAA ASOS via Iowa Environmental Mesonet archive, routine and special METARs, 2024-07-07 12Z to 07-09 00Z | `observed` |
| Exposure scores, scenario stress tests | ResilienceOS model (documented in `web/src/lib/exposure.ts`) | `modeled` |
| Businesses, policies | Generated deterministically (seed 20240708), clearly fictional | `synthetic` |
| Reserve, payouts, statuses | Arc testnet contract reads and logs | `onchain` |

NHC's own Beryl report independently lists KPSX at 50 kt sustained / 77 kt peak and KIAH at 51/72 kt, matching our fixtures.

## Sponsor integrations

| Sponsor | Status |
| --- | --- |
| **Circle Arc** | Core. Settlement contract on Arc testnet paying Circle USDC. Gas is paid in USDC. |
| QuickNode Streams | ✅ Live. Stream `resilienceos-reserve-events` on Arc testnet filters every block's logs down to `ParametricReserve` events and pushes them to `/api/stream`, which verifies the HMAC signature and feeds the dashboard. Verified with a real `ReserveFunded` event delivered by the Stream. See [QuickNode Stream configuration](#quicknode-stream-configuration). |
| ElevenLabs | Not integrated. We do not claim it. |
| Grok Bot, Gemini Prediction Markets | Not used. Neither fits the product. |

## Limitations

- Prototype; businesses and policies are fictional; testnet funds at demo scale.
- The exposure model is simple and not actuarially validated. It ranks attention and never decides payouts.
- There is one oracle signer and the trusted dataset is a fixed historical archive. A live system needs multiple independent signers and providers.
- No pricing, underwriting, enrolment, KYC or legal structure. In the US, parametric cover is generally regulated insurance (see `docs/RESEARCH.md` §6).
- The replay uses hindsight best-track positions between 6-hourly fixes. The storm's position between fixes is interpolated and labeled as such.
- Settlement relies on a server relayer for gas. Anyone can relay, but the demo uses ours.

## Credits

NOAA National Hurricane Center (HURDAT2), NOAA/NWS ASOS via the Iowa Environmental Mesonet (Iowa State University), CARTO basemaps and OpenStreetMap contributors, MapLibre GL JS, OpenZeppelin Contracts, Foundry, viem, Next.js, Recharts, lucide, Anthropic Claude. All application code was written during the hackathon (from 19 Nov 2026) on the `feat/resilienceos` branch, with AI-assisted development (Claude Code).
