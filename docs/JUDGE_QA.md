# Judge Q&A

**Why is blockchain necessary? Why not a database?**
A database records what the operator says happened, and the operator can edit it. Here the reserve is held by a contract that can only pay the registered holder, only once per storm, and only for an observation signed by an authorized oracle that meets the predefined rule. Anyone can verify every payout and the reserve balance without trusting us. Shortfalls are recorded as owed on chain rather than quietly dropped. Arc adds USDC-denominated gas and instant settlement in a stablecoin the business can spend.

**Why AI instead of ordinary automation?**
The *payout* uses ordinary, deterministic automation, on purpose. AI does the job automation is bad at: explaining an event across a portfolio in plain language. That covers who is exposed and why, why a business was or wasn't paid, which data looks wrong, and how solvent the reserve is. The agents have no tools or keys, must cite facts, and the payout outcome is identical without them.

**What is new? How is this different from Arbol, FloodFlash or Etherisc?**
Automated parametric payouts are not new and we don't claim they are. Arbol and Descartes sell to large commercial clients through brokers. FloodFlash uses its own sensor, installed per building. Etherisc built on-chain products mostly for farmers and travelers. Our contribution is the combination aimed at small businesses: exposure intelligence, a validated observation pipeline (hashing and independent re-parsing of the raw station report), an on-chain trigger with oracle authorization and replay protection, transparent solvency, and explanations a shop owner can read. See docs/COMPETITIVE_ANALYSIS.md.

**Who funds the reserve?**
In the prototype, we do, with testnet USDC. In production, the likely funders are a municipal or state resilience fund, a CDFI, a philanthropic relief fund (paying grants, not insurance), or a licensed insurer or MGA with reinsurance behind it. Premiums would fund it in an insurance version.

**What if the reserve is insufficient?**
The contract records the claim as owed (`PayoutDeferred`, with the shortfall), and the policy status becomes Deferred. Owed funds cannot be withdrawn by the treasurer. Once the reserve is topped up, anyone can call `payDeferred`. Risk Analytics shows this case: Beryl at 1.25× wind would exceed the funded reserve.

**What happens if an oracle is wrong?**
Before signing, we check the source hash, re-parse the raw METAR, apply quality flags (missing, gust below sustained, implausible) and compare against neighbouring stations. A key can be revoked and the contract paused. The prototype has one signer. Production needs k-of-n independent signers across providers, plus a dispute window for borderline readings.

**How are weather observations verified?**
Each one is a NOAA ASOS METAR from the public archive. We hash the exact text, so the on-chain observation commits to it. We parse the wind group independently and require it to match the dataset value. The oracle signs EIP-712 typed data, and the contract recovers the signer. Our values match NHC's post-storm report (KPSX 50/77 kt, KIAH 51/72 kt).

**How do you prevent unauthorized payouts?**
Three layers. The API refuses anything not in the verified dataset. The contract rejects any signature not from `ORACLE_ROLE`. The payout recipient is fixed at registration and `settle` has no recipient argument. The attack console demonstrates the forged-oracle case against the live contract.

**How do you prevent double payments?**
`settledForEvent[policy][event]` plus the `Paid` status. Each signed observation is also accepted only once. Both are shown live and covered by tests.

**False positives and basis risk?**
Basis risk is the gap between the index (wind at a station) and the actual loss. Our station-based trigger is transparent about it. Risk Analytics lists the high-exposure businesses that did not trigger so a team can reach them first. Station choice (nearest one or two within 35 km) and tiered thresholds reduce basis risk. Multi-station or gust-based triggers are possible extensions.

**How do businesses enroll?**
Not built. The plan is that a partner (chamber of commerce, CDFI, insurer) onboards businesses. We pick approved stations by location, set a threshold and amount, and register the policy with the business's wallet. A Circle wallet can hide the crypto from the business owner.

**What regulations apply?**
In most US states, parametric cover sold for a premium is insurance and needs a licensed carrier or an MGA with fronting. A sponsor-funded relief grant is not insurance but has its own rules. USDC payouts may raise money-transmission questions. We have not resolved these; see docs/RESEARCH.md §6.

**How does this scale?**
Policy registration is batched (20 per transaction). One settlement transaction can pay every policy one observation triggers. Agents work from compact fact sheets. The data pipeline needs live feeds and more stations, and indexing moves from polling to a QuickNode Stream.

**Business model?**
A per-policy annual platform fee to the risk carrier or fund, a basis-point fee on settled payouts, and analytics (exposure and reserve stress testing) for the funder.

**What is real and what is simulated?**
Real: NOAA best track and station reports, the contract and its tests, Arc testnet transactions, the validation pipeline, and the agent outputs. Simulated: the 80 businesses and their policies (fictional), the dollar amounts (testnet USDC at 1:10,000 scale), and the exposure model (simplified and not actuarially validated). The hurricane is replayed from history, not live.

**What did you build during the hackathon?**
Everything in `contracts/` and `web/` and every doc in `docs/`, on Nov 19, on branch `feat/resilienceos`. Earlier commits in the repo are planning documents only. Commit history: docs/BUILD_STATUS.md.
