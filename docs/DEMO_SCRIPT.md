# Demo script (2:45)

Before recording, check:

1. `cd web && npm run chain -- status`. The reserve must hold enough USDC for the run (Beryl at demo scale needs about 44 USDC to pay everyone; with less, later claims show as **deferred**, which is also a valid story).
2. Run `npm run chain -- cohort` to register a fresh, unpaid cohort, so the payouts in the video are new transactions.
3. `npm run dev`, open http://localhost:3000, and reset the replay. Pick 45 min/s.
4. Optional: open the Arc explorer in a second tab.

| Time | Screen | Say |
| --- | --- | --- |
| 0:00 | Command Center, map at 07/07 12Z | "When a hurricane hits, a small business can lose its income overnight. The median one has 27 days of cash, and disaster loans have taken weeks to months. ResilienceOS links verified disaster conditions to programmable financial protection, so eligible businesses get paid in minutes." |
| 0:15 | Point at the map | "This is Hurricane Beryl, July 2024, replayed from NOAA's best track and 1,300 real weather-station reports. Each dot is one of 80 fictional covered businesses on the Texas coast, colored by modeled exposure." |
| 0:30 | Press Play | "As the storm comes ashore the stations light up with the winds they actually measured, and exposure rises." |
| 0:45 | The replay pauses at a settlement gate | "Here Palacios station KPSX reports 47 knots sustained. Gulf Coast Hardware's policy pays at 45 knots at that station. Before any money moves, we hash the raw METAR, re-parse it independently, check data quality, and our oracle signs it." |
| 1:05 | Green checks, then the tx hash | "That signed observation goes to our contract on Circle's Arc chain. The contract checks the signer, the station, the time window and the threshold itself, and pays USDC straight to the business. Here's the transaction." Click it to open the explorer. |
| 1:20 | Business tab → "Why this business was paid" | "Every payout explains itself: the rule, the reading, the raw METAR and the transaction. No adjuster, no claim form." |
| 1:35 | AI Intelligence → run Coverage, then Integrity | "Five AI agents brief the response team. They only see verified facts and must cite them. They have no keys and no write access. Notice Integrity caught that Palacios went silent at 10:22, mid-storm. Missing data never triggers a payout." |
| 1:55 | Contracts & Security → forged oracle | "Now an attacker. They sign a fake 95-knot reading at Galveston and send it straight to the contract. Rejected: UnauthorizedOracle. That rejection comes from the contract on Arc, not from our UI." |
| 2:10 | Duplicate payout | "And trying to get paid twice for the same storm: NotEligible, AlreadySettledForEvent. Replaying the same signed observation is rejected too." |
| 2:20 | Payout Explorer / Risk Analytics | "Every payout is a decoded on-chain log, and the reserve is live. Risk Analytics stress-tests the portfolio. A stronger storm would exceed the reserve, and the contract records those claims as owed instead of hiding them." |
| 2:35 | Back to the map, all paid businesses green | "Disaster, exposure, verification, protection, settlement. ResilienceOS: financial first responders for a changing climate." |

**Fallbacks.** If the RPC is slow, the gate shows "Settling…". Keep talking about the checks list. If settlement fails, the error appears in red, so say what failed and open a previously settled transaction from the Payout Explorer. Never claim a payout the explorer doesn't show.
