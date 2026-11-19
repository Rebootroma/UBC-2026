# Product thesis

## The problem in one paragraph

When a hurricane hits the Texas coast, a small business can lose weeks of revenue without serious physical damage: power is out, customers stay away, staff cannot get to work. Standard business income cover usually needs direct physical loss and starts 72 hours after it [1][2]. SBA disaster loans are debt and can take weeks to months to disburse [3]. The median small business has 27 days of cash [4]. Hurricane Beryl (July 2024) is the clearest recent case: a Category 1 storm that cut power to more than 2.26 million CenterPoint customers [5] and caused $7.2 billion in US damage [6]. See `RESEARCH.md` for the full evidence.

## Initial market

**Hurricane-exposed small businesses on the upper Texas coast: Houston, Galveston, Brazoria and Matagorda counties.**

Why here first:
- Texas has 3.5 million small businesses employing 5.1 million people [7].
- Repeated events (Harvey 2017, Beryl 2024) and dense ASOS coverage (KHOU, KIAH, KGLS, KLBX, KPSX, KSGR and others [6]) make station-based triggers practical.
- Beryl gives us a real, well-documented replay with official observations [6].

## Customer vs buyer

The **customer** (who benefits) is the small business owner: restaurants, shops, clinics, service firms with under about 50 staff.

The **buyer** (who pays and holds the risk) is usually not the business itself, at least at first:

| Buyer | Why they would buy | What they buy from us |
|---|---|---|
| Insurer or MGA | Wants a parametric SME add-on without building the stack | Trigger engine, exposure maps, payout rails, reserve dashboard (software licence) |
| Municipal resilience fund / city | Wants to get cash to local businesses in days, with a public audit trail | Fund operating system: eligibility, trigger, grant disbursement in USDC or via bank off-ramp |
| CDFI | Already lends to these businesses; a fast grant protects its loan book | Bridge-grant programme run on our rails; exposure data for its portfolio |
| Chamber of commerce relief fund | Raises relief money after every storm and disburses it slowly by hand | Pre-funded relief pool with published triggers and transparent reserves |

The NYC flood pilot shows the funded-relief model already works with public money: Swiss Re insures, a nonprofit receives the payout, and households get grants of up to $15,000 [8].

## Business model options

| Option | Revenue | Notes |
|---|---|---|
| SaaS for funds | Annual platform fee per fund plus per-enrolled-business fee | Simplest; no risk on our balance sheet; not insurance |
| Programme administration fee | % of funds administered or disbursed | Fits city and CDFI grant programmes |
| MGA commission | Commission on premium written via a licensed carrier | Needs licensing and a capacity partner; highest upside |
| Data / exposure intelligence | Portfolio exposure reports for lenders and insurers | Byproduct of the map and station data |

We would start with SaaS and programme administration, which need no insurance licence, and move to MGA commission once a carrier partner exists.

## Regulatory path

1. **Now (hackathon):** testnet USDC, fictional businesses. Not insurance and not a financial product.
2. **Pilot:** a pre-funded **relief grant** programme run by a chamber, CDFI or city. Grants on a published trigger, no premium and no promise to indemnify. Counsel to confirm this falls outside Texas insurance law and money transmission rules. We have not verified Texas-specific treatment.
3. **Insurance product:** partner with a licensed carrier (fronting) and operate as MGA or technology provider, as Descartes and Jumpstart do [9][10]. NAIC says parametric policies fall under the normal insurance framework, including solvency and market-conduct oversight [11].
4. **Onchain settlement** stays as the payout and audit layer in every stage. Whether USDC payouts to businesses need a licensed money transmitter or bank partner is an open legal question.

## Path to a real company

| Stage | Milestone | Proof point |
|---|---|---|
| 0 | Beryl replay demo on Arc testnet | Deterministic replay; signed observations; reserve accounting |
| 1 | Back-test triggers on Harvey, Ike, Nicholas and Beryl for 50–100 real Houston businesses (with consent) | Measured basis risk: how often the trigger matched real disruption |
| 2 | One pilot with a Houston-area chamber or CDFI relief fund, small pool | Time from trigger to cash in hand; owner feedback |
| 3 | Carrier or MGA partnership for an SME parametric add-on | Licensed product; first premium |
| 4 | Expand along the Gulf Coast (Louisiana, Florida panhandle) and to other perils (flood depth, heat) | Same rails, new triggers |

## Key risks

- **Basis risk:** a nearby station may not reflect the business's real experience. Beryl's own data shows incomplete records at Hobby and Galveston [6].
- **Regulatory:** selling to businesses directly before a carrier partnership would be unlicensed insurance.
- **Oracle trust:** our MVP uses registered signer keys. A production version needs multiple signers and a published fallback rule.
- **Distribution:** funds and insurers buy slowly. Starting with one champion (a chamber or CDFI) is critical.

## Sources

1. NAIC, business income coverage: https://content.naic.org/article/small-business-insight-what-business-income-loss-coverages-are-out-there-learn-endorsements-can-help-lost-business-income
2. McLaurin, "An Overview of Business Interruption Insurance" (ISO 72-hour period of restoration): https://www.propertyinsurancecoveragelaw.com/wp-content/uploads/2024/03/AN-OVERVIEW-OF-BUSINESS-INTERRUPTION-INSURANCE.pdf
3. SBA OIG Report 25-20 (Hurricane Milton): https://legacy.sba.gov/document/report-25-20-hurricane-milton-initial-disaster-assistance-recovery-response
4. JPMorgan Chase Institute, cash buffer days: https://www.jpmorganchase.com/institute/all-topics/business-growth-and-entrepreneurship/report-cash-flows-balances-and-buffer-days
5. Utility Dive, Beryl restoration: https://www.utilitydive.com/news/texas-restoration-efforts-underway-beryl-almost-3-million-without-power/720816/
6. NOAA NHC Tropical Cyclone Report, Hurricane Beryl: https://www.nhc.noaa.gov/data/tcr/AL022024_Beryl.pdf
7. SBA Office of Advocacy, Texas 2025 Small Business Profile: https://advocacy.sba.gov/wp-content/uploads/2025/06/Texas_2025-State-Profile.pdf
8. Insurance Journal, NYC parametric flood programme: https://www.insurancejournal.com/news/east/2023/03/08/711441.htm
9. Descartes Underwriting: https://descartesunderwriting.com/
10. Artemis, Neptune Flood acquires Jumpstart: https://www.artemis.bm/news/neptune-flood-acquires-parametric-california-quake-specialist-jumpstart/
11. NAIC, Parametric Disaster Insurance: https://content.naic.org/insurance-topics/parametric-disaster-insurance
