# Pitch (5 minutes + 2 minutes Q&A)

## 0:00 Hook (30 s)
"On July 8, 2024, Hurricane Beryl came ashore near Matagorda, Texas. 2.26 million homes and businesses in Houston lost power. For a hardware store in Palacios, the storm took a week of sales. The money to recover takes longer: the median small business holds 27 days of cash, and federal disaster loans have taken anywhere from weeks to more than two months to arrive. ResilienceOS is built for those first days."

## 0:30 What it is (30 s)
"ResilienceOS is a disaster financial-response system. Businesses hold simple, predefined protection: *if the official weather station near you measures hurricane-force wind, you get paid.* We verify the measurement, and a smart contract on Circle's Arc chain pays the business in dollars, in minutes, with a public receipt."

## 1:00 Live demo (2 min 30 s)
Follow docs/DEMO_SCRIPT.md from 0:15 to 2:20: replay → trigger → checks → Arc transaction → explanation → agents → forged oracle rejected → duplicate rejected.

## 3:30 Why this design (45 s)
- "**Blockchain** because the rule must bind us, the operator. Funds can only go to the registered business, only once per storm, only on an authorized observation. Shortfalls are recorded on chain, not hidden."
- "**AI** because a response team needs to understand 80, or 80,000, businesses at once. The agents explain; they can't pay. Remove the model and every payout is identical."
- "**Real data.** 1,360 NOAA station reports. Our numbers match NOAA's own post-storm report."

## 4:15 Where it goes (30 s)
"First customers: municipal resilience funds, CDFIs and community relief funds that already want to put money out fast after a storm but have no rails for it. Next: licensed insurers and MGAs who use our engine for parametric products. We charge per policy per year plus a fee on settled payouts."

## 4:45 Close (15 s)
"Disaster, exposure, verification, protection, settlement, in one system. ResilienceOS: financial first responders for a changing climate."

**Be honest in every answer:** the businesses are fictional, the funds are testnet USDC at demo scale, and we have insured no one.
