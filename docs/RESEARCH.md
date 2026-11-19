# Research: disasters, small businesses, and parametric cover

This document sets out the real-world problem ResilienceOS is aimed at. Every figure below comes from a source we fetched and read, listed at the end. Figures are tagged:

- **[Established]**: an official count, a government audit, or a published peer-reviewed or central-bank figure.
- **[Estimate]**: a modelled or industry estimate, a survey with a stated sample, or a commonly repeated figure whose original source we could not trace.

If we could not confirm a number, it is not in this document.

---

## 1. Scale of US disaster losses

| Figure | Value | Tag | Source |
|---|---|---|---|
| US billion-dollar weather and climate disasters in 2024 | 27 events, second only to 28 in 2023 | Established | NOAA Climate.gov / NCEI [1] |
| Cost of those 27 events | about $182.7 billion, fourth-costliest year on record | Established | [1] |
| Deaths from those events | at least 568 | Established | [1] |
| Billion-dollar events 1980–2024 (CPI-adjusted to 2024) | 403 events, cumulative cost over $2.915 trillion | Established | [1], [2] |
| Annual average cost, 2020–2024 vs 1980–2024 | $149.3 billion vs $64.8 billion | Established | [1] |
| Tropical cyclones among 2024's 27 events | 5: Beryl, Debby, Francine, Helene, Milton | Established | [1] |

Notes:
- NCEI describes its billion-dollar series as tracked "from 1980–2024" [2], and the Climate.gov article is marked as no longer updated as of June 2025 [1]. Treat 2024 as the last year in the series. Do not quote 2025 figures from it.
- NCEI's own methodology says its estimates likely understate losses (reported in [1]); we do not quote a size for that bias.

### Global context and the protection gap

| Figure | Value | Tag | Source |
|---|---|---|---|
| Global economic losses from natural catastrophes, 2024 (Swiss Re Institute) | $318 billion, 57% uninsured | Estimate | Reinsurance News reporting Swiss Re Institute [3] |
| Global insured nat-cat losses, 2024 (Swiss Re Institute) | $137 billion; protection gap $181 billion | Estimate | [3] |
| Global overall losses, 2024 (Munich Re) | $320 billion, of which about $140 billion insured | Estimate | Munich Re [4] |
| US hurricanes 2024 (Munich Re) | $105 billion overall, $47 billion insured | Estimate | [4] |
| Hurricane Helene (Munich Re) | $56 billion overall, $16 billion insured | Estimate | [4] |
| Hurricane Milton (Munich Re) | $38 billion overall, $25 billion insured | Estimate | [4] |

The $146 billion in [3]'s headline is total insured catastrophe losses including man-made events; $137 billion is the natural catastrophe part. Swiss Re's own sigma page returned HTTP 403 to our fetch, so the Swiss Re numbers are cited through Reinsurance News's report of the Swiss Re Institute study [3]. Both reinsurers put roughly 55–57% of 2024 global losses as uninsured. Helene shows how large the gap can be in a single US hurricane: under 30% of Munich Re's overall loss estimate was insured.

---

## 2. Why small businesses are exposed

### 2.1 Thin cash buffers [Established, survey-based]

- The median US small business holds **27 cash buffer days**. A quarter hold **fewer than 13 days** (JPMorgan Chase Institute [5]).
- In practice, a closure of two to four weeks uses up the median firm's cash, before any repair costs.

### 2.2 Business interruption cover often does not respond to the loss that hurts most

- Standard business income (BI) cover pays when operations stop **because of a covered direct physical loss**, such as a fire (NAIC [6]).
- Utility service interruption is a separate clause or endorsement. It covers losses from direct physical damage to utility property, and it can carry distance limits and excluded perils (NAIC [6]).
- A common ISO form starts BI coverage **72 hours after** the physical loss. Civil authority coverage also starts 72 hours after the order and lasts up to three weeks (McLaurin, *Corporate Counsel Review*, quoting an ISO form [7]).
- The result: a business with no physical damage that loses power or customers for days may get nothing from a BI policy. Waiting periods also take up much of a short outage.

### 2.3 Few small businesses hold disruption cover, and few use insurance after a disaster [Estimate]

From the Federal Reserve's 2021 Small Business Credit Survey, as analysed by the New York Fed [8]:

| Finding | Value |
|---|---|
| Small businesses with disaster-related losses that had to close temporarily | 63% |
| Small businesses with business disruption insurance (prior research cited by the NY Fed) | 30–40% |
| Disaster-affected firms that relied on insurance funds | 11% (12% white-owned, 6% Black-owned) |
| Disaster-affected firms that relied on federal disaster relief (FEMA, SBA) | 14% |
| Disaster-affected firms that relied on no external funds at all | 60% |
| Firms closed more than three months | 34% Black-owned, 23% Hispanic-owned, 16% white-owned, 6% Asian-owned |

### 2.4 Closure rates: the popular figures are poorly sourced

| Claim | Source | Our assessment |
|---|---|---|
| "Roughly 40–60 percent of all businesses affected by a major disaster never reopen" | Ready.gov / FEMA Emergency Financial First Aid Kit, 2020 [9] | Widely repeated. We could not trace it to an original study. **Do not use in the pitch as fact.** |
| "25% of small businesses never reopen after a major disaster" | SBA regional op-ed, Sept 2026 [10] | No source cited. Do not use. |
| 3% permanently closed and 5% temporarily closed one year after Hurricane Helene; 53% still need recovery support | Richmond Fed, Jan 2026, survey of 437 businesses (not statistically representative) [11] | Most recent primary data. The useful finding is the long tail of financial distress, not mass closure. |
| Katrina small-business survival and demise rates | Schrank et al., *Natural Hazards* 2013 [12] | Peer-reviewed. The abstract says it gives "more useful numbers than prior estimates". The rate itself is paywalled and we did not verify it. |

**Pitch guidance:** do not lead with "40% never reopen". The better-supported story is that most affected firms close at least temporarily [8], hold about a month of cash or less [5], and wait days to months for insurance or loan money (below). The problem is liquidity timing more than outright failure.

---

## 3. How slow the existing money is

### 3.1 SBA disaster loans [Established, GAO and SBA OIG audits]

| Event | Measured time | Source |
|---|---|---|
| Hurricane Katrina (2005) | About 74 days average processing vs a 21-day goal (as of May 2006); backlog peaked over 204,000 applications | GAO-06-860 [13] |
| Hurricane Sandy (2012) | 45 days average for physical business loans, 38 days for economic injury loans (receipt to decision) | GAO-14-760 [14] |
| Harvey, Irma, Maria (2017) | Loan processing averaged 18 days or less | GAO-20-168 [15] |
| Hurricane Milton (2024) | 17 days average processing, but **73 days on average from application to disbursement** for applications filed before or during a 68-day SBA funding lapse | SBA OIG Report 25-20 [16] |

Takeaway: SBA decision times improved after 2005, but disbursement still depends on appropriations, and SBA loans are debt. As of 8 August 2024, SBA had approved **$2.06 million in business loans** for Beryl in Texas, against **$103.5 million** in home loans [17].

### 3.2 Indemnity claims

NAIC says indemnity claims can take "months or years", while parametric payments "can be made in a matter of weeks" [18]. NCSL says parametric claims typically settle within 30 days [19]. These are general statements, not measured US small-business claim times. We did not find an authoritative dataset on commercial BI claim settlement times after Beryl.

---

## 4. Parametric insurance basics

**Definition.** A parametric contract pays "a set amount based on the magnitude of the event, as opposed to the magnitude of the losses" (NAIC [18]). The contract fixes three things: the **payout amount**, the **parameter** (for example wind speed or quake magnitude), and the **verifier**, which is usually a government agency, with a backup verifier if the first cannot report [18].

**Advantages.**
- No loss adjustment, so payment is fast [18].
- Money can be used for anything, including lost revenue with no physical damage, payroll and inventory.
- Good for liquidity in the first days, which is exactly where BI waiting periods and SBA processing leave a gap.

**Basis risk.** NAIC calls it "the most obvious downside": the payout can differ from the actual loss, and a policyholder can suffer a loss without the trigger firing [18]. Chainlink's own explainer gives the example of a weather station that records just under the threshold while a nearby farm floods [20]. Evidence on reducing it:

- Basis risk depends heavily on the distance between the insured site, the measuring station, and the event footprint. Pooling many contracts lowers portfolio basis risk (Gao, Yang & Liu, arXiv 2024 [21]).
- Finer geographic zones reduce basis risk. Pricing can be tilted towards overpayment for a higher premium (NAIC [18]).
- World Bank technical guidance: products "based on indices and model results ... inherently contain basis risk" [22].

**Implication for ResilienceOS.** A single-station trigger has real basis risk. The product must: (a) map each business to an approved nearby station and show that distance; (b) explain to the buyer that a payout is a fixed liquidity amount, not loss compensation; (c) pair parametric cover with indemnity insurance, never replace it.

---

## 5. Oracle (data source) reliability

The trigger is only as good as the data. Hurricane Beryl itself shows the failure modes:

- In the NHC report's Texas observation table, sustained wind and gust records at **KHOU (Houston Hobby), KLBX (Angleton/Brazoria County), KGLS (Galveston) and KSGR (Sugar Land) are marked "i", meaning incomplete record** [23]. The station may have failed or lost data during the peak.
- NOS tide gauges at Sargent and Freeport Harbor "had outages during the storm and did not record the peak water levels" [23].
- ASOS reports a 2-minute average wind speed, updated every 5 seconds and reported once a minute (NWS [24]). The NHC table uses 2-minute sustained winds for land stations [23]. A trigger must state the averaging period exactly. A 1-minute (NHC advisory convention), 2-minute (ASOS) and 10-minute (WMO) "sustained wind" are not interchangeable.
- NHC best-track values change after the season. Beryl's Texas landfall intensity was revised to 80 kt, **10 kt above the operational estimate** [23]. A trigger tied to "operational advisory intensity" and one tied to "final best track" can give different answers.

**Design rules we take from this:**
1. Fix the data source, station list, averaging period and coverage window in the policy terms before the event.
2. Write a fallback in advance: what happens if the station's record is incomplete (backup station, or deferral to final data). NAIC describes this backup-verifier tier [18].
3. Sign observations at the oracle and check the signature onchain, so a relayer cannot change values.
4. Record which observation paid which policy, so the same data cannot pay twice.

---

## 6. Regulation (United States)

This is not legal advice. It is what the sources say, and what we would ask counsel.

- **Parametric cover sold as insurance is insurance.** NAIC: "Few jurisdictions have regulation specific to parametric insurance policies," so these products generally fall under the same framework as traditional policies, and parametric insurers are subject to the same solvency and market-conduct oversight [18].
- **Insurance vs swap.** US commentary on the CFTC/SEC product definitions describes a *product test* (insurable interest, a loss must occur and be proved, payment limited to the insurable interest) and a *provider test* (the obligor is a state-regulated insurer, government body, or qualifying reinsurer or non-admitted insurer) [25]. A wind-triggered contract sold by an unlicensed entity to a business risks being neither compliant insurance nor a permitted swap.
- **Legislators are still working it out.** NCSL reports that some state officials are unsure parametric products fall under existing insurance law, and that NAIC planned a white paper [19].
- **Industry practice.** Arbol sells insurance through a licensed general agent and also offers derivatives depending on the client [26]. Descartes runs as an MGA backed by rated insurers [27]. Jumpstart launched with a Lloyd's syndicate behind it [28].

**Workable structures for a real product:**

| Structure | How it works | Example |
|---|---|---|
| Licensed carrier / fronting + MGA | A licensed insurer issues the policy; we act as MGA or tech provider; the carrier cedes risk to reinsurers | Descartes [27], Jumpstart [28] |
| Parametric cover bought by a relief fund, paid out as grants | A nonprofit or city buys parametric cover; when it triggers, the fund pays fixed grants to eligible people or businesses | NYC pilot: Swiss Re insures, Center for NYC Neighborhoods receives up to $1.1M and grants households up to $15,000; funded by DHS [29] |
| Pre-funded relief or resilience fund (not insurance) | A chamber, CDFI or city puts money in a reserve and commits to pay grants on a published trigger; no premium, no promise of indemnity | Our demo's legal framing |

The hackathon demo uses testnet USDC and fictional businesses. It is a **prototype of the payout and accounting rails**, not an insurance product.

---

## 7. Hurricane Beryl (our replay event)

All facts from the NHC Tropical Cyclone Report (Beven, Fritz & Alaka, 1 May 2025) [23] unless noted.

| Item | Value | Source |
|---|---|---|
| Texas landfall | Near Matagorda, TX, **0840 UTC 8 July 2024** | [23] |
| Landfall intensity | **80 kt** (Category 1), 10 kt above the operational estimate | [23] |
| Landfall pressure | 978 mb | [23] |
| Track after landfall | Passed over the western Houston metro area between 1200 and 1600 UTC | [23] |
| US deaths | 14 direct (11 in Texas); 34 indirect, all in Texas, including 14 from heat during power outages | [23] |
| US damage | $7.2 billion (NCEI estimate) | [23], [1] |
| Buildings | 239 destroyed and 2,555 damaged in Texas (TDEM) | [23] |
| Power | Almost 3 million people lost power, 2.7 million in southeast Texas (media reports cited by NHC) | [23] |
| CenterPoint peak | **More than 2.26 million** CenterPoint electric customers lost power | Utility Dive [30] |
| Texas-wide peak | More than 2.6 million Texas customers lost power; hundreds of thousands still without power a week later | Texas Tribune [31] |
| SBA declaration (July 2024) | 15 counties incl. Harris, Brazoria, Galveston, Matagorda; business loans up to $2M at rates as low as 4% | SBA [32] |

**Selected Texas ASOS observations (NHC TCR Table 3; 2-minute sustained; "i" = incomplete record) [23]:**

| Station | Sustained (kt) | Gust (kt) | Time of sustained (UTC, 8 July) |
|---|---|---|---|
| KPSX Palacios | 50 | 77 | 0942 |
| KLBX Brazoria County (Angleton) | 46i | 74i | 1036 |
| KHOU Houston Hobby | 47i | 73i | 1353 |
| KIAH Houston Intercontinental | 51 | 72 | 1515 |
| KGLS Galveston | 45i | 62i | 1010 |
| KSGR Sugar Land | 42i | 66i | 1119 |
| KMCJ Houston Dunn Helistop (69 m elevation) | 50 | 77 | 1435 |

Note for the demo: KIAH, far inland, recorded a slightly higher 2-minute sustained wind (51 kt) than KPSX near landfall (50 kt), and several coastal stations have incomplete records. A threshold of 50 kt would trigger at KPSX and KIAH but not KHOU, even though Hobby was hit hard. This is basis risk in the real data, and the demo should show it, not hide it. The replay uses IEM's archive of the METAR reports [33], so its values may differ slightly from the NHC table, which uses quality-controlled station data.

**Why Beryl suits the problem:** A Category 1 storm with modest physical damage per business, but millions of customers without power for days in July heat [23][31]. That is a liquidity shock that standard BI cover, which needs physical loss and has a 72-hour waiting period, often does not cover [6][7].

---

## 8. Summary for the pitch

1. US billion-dollar disasters cost about $182.7B across 27 events in 2024 [1]; over half of global 2024 losses were uninsured [3][4].
2. The median small business has 27 days of cash [5]; 63% of disaster-hit small firms closed at least temporarily [8].
3. SBA money is debt and can be slow: 73 days from application to disbursement for Milton applicants caught in a funding lapse [16].
4. Parametric cover pays fast on a measured trigger but carries basis risk [18][21] and is regulated as insurance when sold as insurance [18][25].
5. Beryl: Cat 1, 80 kt at landfall near Matagorda [23], more than 2.26M CenterPoint customers without power [30], $7.2B damage [23].

---

## Sources

1. NOAA Climate.gov, "2024: An active year of U.S. billion-dollar weather and climate disasters": https://www.climate.gov/news-features/blogs/beyond-data/2024-active-year-us-billion-dollar-weather-and-climate-disasters
2. NOAA NCEI, U.S. Billion-Dollar Weather and Climate Disasters (overview), DOI 10.25921/stkw-7w73: https://www.ncei.noaa.gov/access/billions/
3. Reinsurance News, "Global insured losses reach $146bn in 2024 ... Swiss Re" (reporting Swiss Re Institute): https://www.reinsurancene.ws/global-insured-losses-reach-146bn-in-2024-driven-by-hurricanes-scs-swiss-re/
4. Munich Re, natural disaster figures 2024: https://www.munichre.com/en/company/media-relations/media-information-and-corporate-news/media-information/2025/natural-disaster-figures-2024.html
5. JPMorgan Chase Institute, "Cash Flows, Balances, and Buffer Days": https://www.jpmorganchase.com/institute/all-topics/business-growth-and-entrepreneurship/report-cash-flows-balances-and-buffer-days
6. NAIC, "What Business Income Loss Coverages Are Out There?": https://content.naic.org/article/small-business-insight-what-business-income-loss-coverages-are-out-there-learn-endorsements-can-help-lost-business-income
7. J. McLaurin, "An Overview of Business Interruption Insurance," 38 Corp. Couns. Rev. 233 (2019): https://www.propertyinsurancecoveragelaw.com/wp-content/uploads/2024/03/AN-OVERVIEW-OF-BUSINESS-INTERRUPTION-INSURANCE.pdf
8. Federal Reserve Bank of New York, Liberty Street Economics, "Small Business Recovery after Natural Disasters" (2022): https://libertystreeteconomics.newyorkfed.org/2022/09/small-business-recovery-after-natural-disasters
9. Ready.gov / FEMA, Emergency Financial First Aid Kit (2020): https://www.ready.gov/sites/default/files/2020-03/ready_emergency-financial-first-aid-toolkit.pdf
10. SBA, "Protecting Main Street Before Disaster Strikes" (Sept 2026): https://legacy.sba.gov/article/2026/09/23/protecting-main-street-disaster-strikes-practical-survival-guide-small-business-owners
11. Federal Reserve Bank of Richmond, "How Are Small Businesses Faring in the Aftermath of Hurricane Helene?" (Jan 2026): https://www.richmondfed.org/region_communities/regional_data_analysis/regional_matters/2026/how_small_businesses_faring_in_aftermath_hurricane_helene
12. Schrank et al., "Small-business demise and recovery after Katrina," *Natural Hazards* 65(3), 2013: https://econpapers.repec.org/RePEc:spr:nathaz:v:65:y:2013:i:3:p:2353-2374
13. GAO-06-860, SBA disaster loan program after the Gulf Coast hurricanes: https://www.govinfo.gov/content/pkg/GAOREPORTS-GAO-06-860/html/GAOREPORTS-GAO-06-860.htm
14. GAO-14-760, SBA disaster loans after Hurricane Sandy: https://www.gao.gov/products/GAO-14-760
15. GAO-20-168, SBA disaster loans after the 2017 hurricanes: https://gao.gov/products/GAO-20-168
16. SBA OIG Report 25-20, Hurricane Milton initial disaster assistance response: https://legacy.sba.gov/document/report-25-20-hurricane-milton-initial-disaster-assistance-recovery-response
17. SBA, "SBA tops $105 million in disaster assistance loans for Hurricane Beryl" (8 Aug 2024): https://legacy.sba.gov/article/2024/08/08/sba-tops-105-million-disaster-assistance-loans-hurricane-beryl
18. NAIC, Parametric Disaster Insurance: https://content.naic.org/insurance-topics/parametric-disaster-insurance
19. NCSL, "Parametric Insurance Can Offer Prompt Payout When Disaster Strikes": https://www.ncsl.org/resources/details/parametric-insurance-can-offer-prompt-payout-when-disaster-strikes
20. Chainlink, "Understanding Parametric Insurance on the Blockchain": https://chain.link/article/what-is-parametric-insurance
21. Gao, Yang & Liu, "Managing Basis Risks in Weather Parametric Insurance," arXiv:2409.16599: https://arxiv.org/abs/2409.16599
22. World Bank, "Developing Parametric Insurance for Weather Related Risks for Indonesia" (Technical Note, 2018): https://documents1.worldbank.org/curated/en/704171524632990898/pdf/Technical-Note.pdf
23. NOAA NHC, Tropical Cyclone Report: Hurricane Beryl (AL022024), 1 May 2025: https://www.nhc.noaa.gov/data/tcr/AL022024_Beryl.pdf
24. NWS, ASOS Wind Sensor: https://www.weather.gov/asos/WindSensor.html
25. Business Insurance, "Perspectives: In parametric, it's essential to define whether a contract is insurance or a swap": https://www.businessinsurance.com/perspectives-in-parametric-it%c2%92s-essential-to-define-whether-a-contract-is-insu/
26. Arbol, "Parametric 101": https://arbol.io/help/agents-brokers/the-basics
27. Descartes Underwriting: https://descartesunderwriting.com/
28. Artemis, "Neptune Flood acquires parametric California quake specialist Jumpstart": https://www.artemis.bm/news/neptune-flood-acquires-parametric-california-quake-specialist-jumpstart/
29. Insurance Journal, "New York City Launches Parametric Flood Program" (Mar 2023): https://www.insurancejournal.com/news/east/2023/03/08/711441.htm
30. Utility Dive, Texas restoration after Beryl: https://www.utilitydive.com/news/texas-restoration-efforts-underway-beryl-almost-3-million-without-power/720816/
31. Texas Tribune, PUC report on CenterPoint's Beryl response (25 Jul 2024): https://www.texastribune.org/2024/07/25/texas-power-grid-puc-centerpoint-hurricane-beryl/
32. SBA, "SBA stands ready to assist Texas businesses and residents affected by Hurricane Beryl" (12 Jul 2024): https://legacy.sba.gov/article/2024/07/12/sba-stands-ready-assist-texas-businesses-residents-affected-hurricane-beryl
33. Iowa Environmental Mesonet, ASOS/AWOS/METAR download: https://mesonet.agron.iastate.edu/request/download.phtml
