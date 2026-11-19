# Reference analysis: "REA Bounty AI"

## Result: not identified

We spent about 15 minutes searching and **could not identify a product, repository or hackathon project called "REA Bounty AI" with any confidence.** Nothing below describes it. If the project owner has a link, Devpost page, repo or screenshot, we can redo this section against the real thing.

### What we searched

| Query | Where |
|---|---|
| `"REA Bounty AI"` | General web |
| `"REA bounty" AI` | General web |
| `"ReaBounty" OR "Rea-Bounty" OR "rea_bounty"` | GitHub-focused web search |
| `"Rea" AI bounty platform agents verify submissions pay crypto` | General web |
| `REA bounty AI agents conditional payment hackathon devpost OR ethglobal` | General web |
| `devpost "REA" bounty AI agent escrow project` | Restricted to devpost.com, ethglobal.com, github.com, dorahacks.io |

### Candidates we rejected

| Candidate | Why rejected |
|---|---|
| REA Group (Australian property portal) and its AI tools (realAssist, AI search) [1] | Real-estate search assistants. No bounty or payment mechanics. The brief asked us not to assume this without evidence, and we found none. |
| REA Group Hackdays 2026 [2] | REA Group hackathon in Melbourne (7–10 Sept 2026) where customers built AI prototypes. Winners received "AI Acceleration Grants" ($30k / $20k / $10k, $5k to others). These are prize grants, not bounties paid on verified evidence, and nothing links them to a product named "REA Bounty AI". The closest name match, but we rate it unlikely. |
| "REA" reverse-engineering agent (GitHub morluto/rea, gives AI agents reverse-engineering tools) [3] | Reverse-engineering tool; excluded by the brief; no bounty mechanics. |
| New Zealand Real Estate Authority generative-AI guidance [4] | Regulatory guidance for estate agents. |
| Rea by Apers / REAI (real-estate analyzers) | Real-estate investing tools, no bounty link. |
| HackerOne AI bug bounty guidance [5] | About bounties for finding bugs in AI systems; the name does not match. |

Because "REA" did not resolve, the rest of this document analyses the **general pattern the name suggests**: AI-verified bounties, meaning conditional payment released on verified evidence. **This is a comparison class, not REA Bounty AI.**

---

## The comparison class: conditional payment on verified evidence

### Examples reviewed

| System | Workflow | Who verifies | Payment | Source |
|---|---|---|---|---|
| **Gitcoin Bounties** (legacy; programme handed to Buidlbox in 2023) | Funder posts and funds an issue → approves workers → reviews pull request → pays | Human funder | Crypto, released by funder | [6] |
| **Verdikta** (as described by a third-party developer) | Bounty funded in a `BountyEscrow` contract on Base → submissions evaluated by AI models → payout | Several LLMs (named as GPT and Claude models) | ETH released by contract, "no human reviewers" | [7] |
| **agent-escrow** (GitHub) | Buyer locks bounty with acceptance criteria → sandboxed referee runs tests, budget and side-effect checks → approve or refund | Programmatic referee (100% test pass required) | Release "if and only if" criteria met; otherwise full refund | [8] |
| **AgentBazaar** (Chainlink hackathon) | Buyer's USDC locked in escrow (Sepolia) → Chainlink CRE workflow runs a Gemini-based quality rubric on delivered work → pass/fail written onchain | AI scorer | USDC released only if output passes the quality threshold | [9] |
| **Nexus Mutual claims** (insurance analogue) | Member files claim with deposit → Claims Committee votes against cover wording | Named human experts | Discretionary payout | [10] |

### Architecture pattern

```
Funder ──locks funds──▶ Escrow contract
                            ▲
Worker/claimant ──evidence──┤
                            │ verdict
Verifier (human | tests | AI | oracle) ──┘
                            │
                    release or refund
```

The design choice that matters is **what the verifier is and what it is allowed to do.**

### Trust and fraud issues seen in this pattern

| Issue | Where it shows up |
|---|---|
| **AI verifier is the trust root.** If an LLM decides who gets paid, prompt injection, model drift or a persuasive but wrong submission can move money. | Verdikta-style and AgentBazaar-style designs [7][9] |
| **No dispute path.** agent-escrow documents no appeal or arbitration; the referee's verdict is final [8]. | [8] |
| **Off-chain data reliability.** The Verdikta write-up notes the API "sometimes returns 401" and the agent falls back to hardcoded data [7]. | [7] |
| **Human bottleneck.** Gitcoin payouts waited on the funder's manual review; Nexus claims go through a committee vote with up to 72 hours of voting plus a cooldown [10]. | [6][10] |
| **Double payment / replay.** Any evidence-to-payment system needs to make sure one piece of evidence cannot pay twice. Most write-ups we saw do not say how they handle this. | General |

### Limitations of the pattern

- Works best when evidence is **objective and machine-checkable** (tests pass, a value crosses a threshold). It gets weaker when "quality" is subjective and an LLM is the judge.
- Escrow guarantees that funds exist for one bounty. It does not manage a **shared reserve** across many claims, which is the insurance problem.

---

## What transfers to ResilienceOS

| Pattern | Take it? | How we use it |
|---|---|---|
| Escrow-before-work (funds locked first) | **Yes, extended** | `ParametricReserve` holds USDC up front and checks reserve before each payout. Shortfalls become recorded **deferred payouts**, not silent failures. |
| Release only on verified evidence | **Yes** | Evidence = EIP-712 signed ASOS observation from a registered oracle key. The contract checks signature, station approval, window and threshold. |
| Programmatic referee (agent-escrow) | **Yes** | Our trigger is a deterministic comparison (`sustained_kt ≥ threshold`), the most objective kind of evidence. |
| AI as the judge that releases funds (Verdikta / AgentBazaar) | **No, deliberately** | Our AI agents explain events, exposure, coverage and integrity findings, but **cannot sign or move funds**. This avoids the AI-as-trust-root failure. |
| Multi-agent coordination | **Yes, read-only** | Disaster-intel, exposure, coverage, integrity and financial agents each produce explanations from shared replay state; none has a key. |
| Refund path | **Adapted** | Unused reserve stays in the fund; no-trigger means no payout, with the reason shown (station reading vs threshold). |
| Dispute path | **Gap to close** | Neither the bounty examples nor our MVP has a formal appeal. A production version needs a published fallback (backup station, final-data review) and a human review queue that cannot override the contract except via a governed role. |
| Replay protection | **Yes, explicit** | Per-observation and per-policy-per-event guards. |

**Bottom line:** the useful lesson from AI-verified bounty systems is to **keep payment conditions objective and enforced in code, and keep the AI out of the money path.** ResilienceOS already follows that rule. Its trigger is more objective than most bounty verdicts, because it is a signed instrument reading compared with a number fixed in advance.

No code from any of these projects was copied or used.

---

## Sources

1. Mediaweek, "REA Group unveils OpenAI-powered realAssist": https://mediaweek.com.au/rea-group-unveils-openai-powered-realassist
2. Elite Agent, "REA Hackdays 2026 winners": https://eliteagent.com/rea-hackdays-2026-winners-agent-ideas/
3. Implicator, "REA connects AI agents to reverse engineering tools": https://www.implicator.ai/repo-radar-rea-agent-reverse-engineering-21/
4. NZ Real Estate Authority, Generative AI guidance: https://www.rea.govt.nz/real-estate-professionals/generative-ai-guidance
5. HackerOne, AI bug bounty: https://docs.hackerone.com/en/articles/12570435-ai-bug-bounty
6. Gitcoin support, "What's happening to the hackathons and the bounties program": https://support.gitcoin.co/gitcoin-knowledge-base/misc/cgrants-bounties-and-hackathons-sunsetting-faq/whats-happening-to-the-hackathons-and-the-bounties-program
7. DEV Community, "Building a bounty agent for Verdikta on Base L2": https://dev.to/kurumi_82661ed12516efd1f7/building-a-bounty-agent-for-verdikta-on-base-l2published-3643
8. GitHub, AAH20/agent-escrow: https://github.com/AAH20/agent-escrow
9. Chainlink hackathon, AgentBazaar: https://chain.link/hack-26/projects/agentbazaar
10. Nexus Mutual docs, FAQ: https://docs.nexusmutual.io/resources/faq
