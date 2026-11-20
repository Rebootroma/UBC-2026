# Devpost submission

**Title:** ResilienceOS

**Tagline:** Financial first responders for a changing climate. Verified hurricane data triggers USDC payouts to small businesses on Arc, in minutes.

**Track:** DeFi & Onchain Applications · **Chain award:** Arc · **Bounties:** QuickNode Streams

**Repository:** https://github.com/Rebootroma/UBC-2026 (branch `main`)

## What did you build?
ResilienceOS is a disaster financial-response system for small businesses. It replays Hurricane Beryl (Texas, July 2024) from NOAA's best track and 1,360 real weather-station reports, on an interactive command-center map of 80 fictional covered businesses. Each business holds a predefined parametric policy, for example *"pay $5,000 if station KPSX reports ≥ 45 kt sustained wind."* When a verified station report meets a policy's trigger, the platform validates the raw report, an authorized oracle signs it, and our `ParametricReserve` smart contract on Arc testnet checks the rule itself and pays the business in USDC. Five AI agents explain the event, the exposure, the coverage, data integrity and the reserve's solvency. They cannot move money.

## What problem does it solve?
Small businesses run out of cash long before disaster money arrives. The median US small business holds 27 days of cash (JPMorgan Chase Institute). Business-interruption insurance usually requires physical damage and a waiting period. SBA disaster loans averaged about 74 days after Katrina, and Hurricane Milton applicants caught in a 2024 funding lapse waited 73 days. Parametric cover can pay in minutes, but small businesses rarely get it, and they have no way to verify why a payout happened or didn't.

## How does it work?
1. **Data:** NOAA NHC HURDAT2 best track plus Iowa Environmental Mesonet ASOS METARs, committed as raw files. Each record is schema-checked, hashed (keccak256 of the raw METAR), independently re-parsed, quality-flagged and compared with neighbouring stations.
2. **Exposure:** a transparent model (modeled wind from the best track, a surge proxy, industry sensitivity and proximity) ranks who needs attention. It never decides payouts.
3. **Trigger:** a deterministic evaluator mirrors the contract. A parity test proves the two agree on 240 real policy/observation pairs.
4. **Settlement:** the oracle signs an EIP-712 observation. `submitAndSettle` on Arc verifies `ORACLE_ROLE`, replay protection, station, window and threshold, then pays the registered holder in USDC. If the reserve is short, the claim is recorded as owed.
5. **Explanation:** five AI agents (Google Gemini) get server-computed fact sheets, return schema-validated output and must cite fact IDs. Uncited findings are dropped. They have no tools and no keys.
6. **Security console:** a forged observation from an unauthorized key and a duplicate payout attempt are sent to the live contract. Both are rejected by its own reverts.

## What makes it unique?
- The rule binds the operator: funds can only go to the registered business, once per storm, and only on an authorized observation.
- Every observation commits on chain to the exact public weather report it came from.
- Solvency is honest: deferred claims are on chain and owed funds can't be withdrawn.
- The AI is useful but powerless over funds: it explains and cites, and the payout is identical without it.
- Every number in the UI is labeled observed, best-track, interpolated, modeled, synthetic or on-chain.

## Challenges
- Arc's USDC moves balances through a native precompile that a local Anvil fork can't emulate. We tested settlement end to end on a fork with a 6-decimal test token, then deployed on Arc with real testnet USDC.
- Getting real station data right: one station (Palacios) went silent mid-storm, and some records disagree with their own METAR text. These became integrity features rather than bugs.
- Keeping the off-chain explanation in exact agreement with the contract, which led to the parity test.

## What's next?
k-of-n oracle signers over multiple data providers; live NWS feeds instead of a replay; QuickNode Streams for event-driven updates; Circle Wallets so businesses never see crypto; a partner pilot with a Gulf Coast CDFI or resilience fund; and a licensed carrier partner for an insurance version.

## Built with
Solidity, Foundry, OpenZeppelin, Circle Arc testnet, USDC, viem, Next.js, React, TypeScript, Tailwind, MapLibre GL, Recharts, Zod, Google Gemini (structured outputs), ElevenLabs text-to-speech, QuickNode Streams, Vitest, Playwright. Data: NOAA NHC HURDAT2, NOAA ASOS via Iowa Environmental Mesonet, CARTO/OSM basemap.

## Contract addresses
- Live demo: https://resilienceos-six.vercel.app
- `ParametricReserve` (Arc testnet): https://explorer.testnet.arc.io/address/0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6
- Example payout: https://explorer.testnet.arc.io/tx/0xd2089f6663554dbec0a1e68be0af8bf0321c08a9e315941bb94eff95ce55f7a1
- USDC: `0x3600000000000000000000000000000000000000`
