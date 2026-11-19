# Competitive analysis

**Automated parametric payouts are not new.** Reinsurers, MGAs and insurtechs have paid on measured triggers for years, some within hours. Others have already put parametric payouts onchain, with Chainlink oracles and USDC. ResilienceOS does not claim to have invented any of this. Section 3 states what we actually add, and section 4 lists where incumbents are clearly ahead of us.

Facts below come from sources we fetched (listed at the end). Company claims are self-reported unless stated otherwise.

---

## 1. Landscape

| Player | What it solves | Who it serves | Trigger / data | Onchain? | Regulatory form |
|---|---|---|---|---|---|
| **Arbol** | Weather and climate risk transfer: rainfall, hurricane, temperature | Agriculture, energy, construction, hospitality and similar businesses; insurers (via reinsurance) [1][2] | Indexed climate data (NOAA, ECMWF, USDA). Hurricane reinsurance pays on distance from the NHC track and max sustained wind [1][2] | Partly. Uses dClimate, "a decentralized, blockchain-enabled warehouse" for data [2]. Payments are not described as onchain | Licensed general agent for insurance; derivatives for some clients [2] |
| **Descartes Underwriting** | Parametric climate, cyber and emerging-risk cover | Corporates and public bodies; self-reports "600+ large corporations and public entities". Does not mention SMEs [3] | Satellite, IoT and 80+ data sources [3] | No | Global MGA backed by A+ insurers; Descartes Insurance is a licensed insurer in Europe [3] |
| **FloodFlash** (UK) | Fast flood cover for small businesses and landlords | UK SMEs, property portfolios, municipalities [4] | Own flood-depth sensor on the property, reading every 5 minutes [4] | No | Insurer / MGA model; capacity provider not named in our source |
| **Jumpstart** (now part of Neptune Flood) | Earthquake liquidity for households and small businesses | California households (up to $10k) and small businesses (up to $20k) [5] | Earthquake intensity [5] | No | Launched with SCOR's Channel Syndicate at Lloyd's [5] |
| **Raincoat** | Instant small payouts after hurricanes, quakes, floods | Families, smallholder farmers, small businesses, through governments, banks and insurers [6] | Wind speed, seismic data and similar [6] | No | White-label with insurance partners; Puerto Rico, Mexico, Jamaica, Colombia [6] |
| **Etherisc** – FlightDelay | Flight delay cover | Air travellers | Chainlink oracles on flight data; pays on delays over 45 minutes or cancellation [7] | **Yes.** Gnosis Chain, USDC, risk pool staked in DIP token [7] | Not stated in our source |
| **Etherisc** – crop (with ACRE Africa) | Weather-index crop cover | Kenyan smallholder farmers, over 17,000 covered [8] | Weather index | Yes, payouts via M-Pesa mobile money [8] | Through ACRE Africa, a microinsurance issuer [8] |
| **Lemonade Crypto Climate Coalition** | Weather cover for subsistence farmers | Nearly 7,000 Kenyan farmers, Oct 2022–Jan 2023 season [9] | Weather data models triggering smart contracts [9] | **Yes.** Avalanche; partners Etherisc, Chainlink, DAOstack, Hannover Re, Pula [9] | Lemonade Foundation-led coalition |
| **Nexus Mutual** | Cover for crypto/DeFi protocol losses | Crypto holders (KYC'd members) [10] | Claims Committee vote against cover wording; not parametric [10] | Yes (Ethereum) | "Not a contract of insurance"; discretionary mutual [10] |
| **Chainlink-based demos** | Hackathon and tutorial parametric contracts | Mostly farmers (drought, rainfall) | E.g. WeatherShield: median of three weather APIs via Chainlink CRE, Arbitrum Sepolia [11]; Chainlink explainer lists wind-speed triggers [12] | Yes, testnets | None (demos) |
| **NYC parametric flood pilot** (public sector) | Fast cash to low- and moderate-income households after floods | Center for NYC Neighborhoods gives grants up to $15k; $1.1M cover [13] | ICEYE flood extent; Swiss Re pays when flooded share of a neighbourhood passes a threshold [13] | No | Swiss Re Corporate Solutions insures; funded by DHS [13] |

### Speed benchmarks already achieved

- Arbol: $10M parametric reinsurance payout to Centauri Insurance about three weeks after Hurricane Ian [1].
- FloodFlash: claims record of 3 hours 50 minutes [4].
- Raincoat: an automatic $75 payout two days after Hurricane Fiona [6].

Instant payout is therefore not our differentiator.

---

## 2. Gaps we see

| Gap | Evidence |
|---|---|
| Little SME-focused hurricane parametric cover on the US Gulf Coast | FloodFlash is UK-only [4]; Jumpstart is California earthquake [5]; Raincoat is Latin America and the Caribbean [6]; Descartes targets large corporates and public bodies [3]; Arbol's hurricane product is reinsurance [1]. We did not find a Texas SME hurricane parametric product in our search. We have not verified that none exists. |
| Onchain parametric pilots are farmers or crypto-native | Etherisc and LCCC served Kenyan farmers [8][9]; FlightDelay serves travellers [7]; Nexus covers DeFi [10]. None is a small-business disaster product in the US. |
| Reserve and solvency are opaque to buyers | Offchain providers do not publish live reserves. Onchain pools such as Etherisc's are funded by a volatile governance token (DIP) [7], not dollars. |
| Basis risk is rarely shown to the buyer | Most products say "fast payout". Few show the buyer which station decides their payout and how far away it is. NAIC and the World Bank both name basis risk as the main weakness (see RESEARCH.md §4). |
| Trigger authenticity in hackathon demos | Demos such as WeatherShield read public weather APIs directly [11]. There is no signed-observation model, no replay protection across policies, and no reserve accounting. |
| AI in insurance mostly means underwriting or claims automation | No incumbent we reviewed separates "AI explains" from "code pays". This matters for trust and for regulators. |

---

## 3. What ResilienceOS adds

The pieces exist separately. We integrate them for one customer, the small business, and make every step checkable.

| Component | What it is | Why it matters |
|---|---|---|
| **Geospatial exposure intelligence** | Map of each business, its coverage and its distance to the approved ASOS station that decides its payout | Makes basis risk visible before purchase, not after the storm |
| **Deterministic, onchain-enforced trigger** | "2-minute sustained wind ≥ threshold kt at an approved station within the coverage window", checked by the `ParametricReserve` contract | Payout logic is public code, not an adjuster's decision or an AI's judgement |
| **Authorized oracle signatures** | Contract accepts only EIP-712 observations signed by registered oracle keys | A relayer or front end cannot invent or change readings |
| **Replay protection** | Each observation used once; each policy paid at most once per event | The same reading cannot drain the reserve twice |
| **Reserve and solvency accounting in USDC** | Reserve checks before payout; deferred payouts recorded when the reserve is short; pause and role-based access | Buyer, fund manager and regulator see the same live solvency position in dollars, not a volatile token |
| **Bounded AI agents** | Disaster intel, exposure, coverage, integrity and financial agents that explain events, exposure and payouts | They cannot sign, trigger or move funds. Explanations help owners and fund managers; money moves only through the contract |
| **Circle Arc** | USDC is the native gas token on Arc [14]; testnet chain ID 5042002 [14] | Premiums, reserves, gas and payouts all in one dollar unit |
| **Deterministic replay** | Hurricane Beryl replayed from NHC best track and real ASOS/METAR observations | The demo can be re-run and audited; anyone gets the same result from the same data |

**In one sentence:** existing products prove parametric payouts work. ResilienceOS is the operating layer around them for small-business disaster finance: who is exposed, which data decides, can the fund pay, and why did this business get paid or not, with the money path enforced onchain and the AI kept out of it.

---

## 4. Where incumbents beat us (honest view)

- **Capacity and licensing.** Descartes, Arbol, Jumpstart and Swiss Re have licensed carriers or reinsurers behind them [1][3][5][13]. We have a testnet contract.
- **Data.** FloodFlash has property-level sensors [4]; Descartes uses satellite imagery [3]. A single ASOS station per policy carries more basis risk.
- **Track record.** Real payouts have been made (Arbol after Ian [1], Raincoat after Fiona [6], Etherisc and ACRE Africa [8]). We replay a past event.
- **Oracle decentralization.** Chainlink-based designs aggregate several nodes and data providers [7][11]. Our MVP uses registered signer keys, which is simpler and easier to audit but more centralized. Adding multi-signer thresholds is a clear next step.

---

## Sources

1. Arbol, "$10 million payout executed less than one month after Ian's landfall": https://www.arbol.io/post/arbols-parametric-catastrophe-reinsurance-solution-delivers-its-first-payouts-for-hurricane-ian-damages
2. Arbol, "Parametric 101": https://arbol.io/help/agents-brokers/the-basics
3. Descartes Underwriting (homepage): https://descartesunderwriting.com/
4. Reinsurance News, "FloodFlash's parametric coverage ensures rapid payouts to UK clients after floods": https://www.reinsurancene.ws/floodflashs-parametric-coverage-ensures-rapid-payouts-to-uk-clients-after-floods/
5. Artemis, "Neptune Flood acquires parametric California quake specialist Jumpstart": https://www.artemis.bm/news/neptune-flood-acquires-parametric-california-quake-specialist-jumpstart/
6. Insurance Journal, on Raincoat (Jul 2023): https://www.insurancejournal.com/news/national/2023/07/11/729423.htm
7. Insurance Innovation Reporter, "Etherisc Launches Blockchain-Backed Parametric Flight Delay Insurance": https://iireporter.com/etherisc-launches-blockchain-backed-parametric-flight-delay-insurance/
8. Cointelegraph, "Etherisc onboards 17K Kenyan farmers covered by blockchain-based crop insurance": https://cointelegraph.com/news/etherisc-onboards-17k-kenyan-farmers-covered-by-blockchain-based-crop-insurance
9. Reinsurance News, "Lemonade Crypto Climate Coalition protects nearly 7,000 Kenyan farmers": https://www.reinsurancene.ws/lemonade-crypto-climate-coalition-protects-nearly-7000-kenyan-farmers/
10. Nexus Mutual docs, FAQ: https://docs.nexusmutual.io/resources/faq
11. Chainlink Convergence hackathon, WeatherShield project: https://chain.link/hack-26/projects/weathershield
12. Chainlink, "Understanding Parametric Insurance on the Blockchain": https://chain.link/article/what-is-parametric-insurance
13. Insurance Journal, "New York City Launches Parametric Flood Program" (Mar 2023): https://www.insurancejournal.com/news/east/2023/03/08/711441.htm
14. Arc docs, "Connect to Arc": https://docs.arc.io/arc/references/connect-to-arc
15. Etherisc GIF core contracts (Apache-2.0): https://github.com/etherisc/gif-contracts
