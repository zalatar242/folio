# ETHGlobal Cannes 2026: Finalist Strategy

## What Actually Wins (Data from 48+ finalists, 8 hackathons)

- **10 finalists** per event, out of 200-700 projects
- Finalists average **2.4 sponsor prizes** vs 0.9 for non-finalists
- Cannes specifically: **privacy themes dominate** (4/10 Cannes 2025 finalists were privacy-focused)
- European events (Brussels, Prague, Cannes) over-index on privacy

---

## What's Cutting Edge RIGHT NOW (April 2026)

Based on the most recent finalists (Buenos Aires, HackMoney 2026, Trifecta):

| Trend | Recent Finalists | Signal |
|-------|-----------------|--------|
| **x402 protocol** (HTTP-native payments) | payload.exchange, Paybot, zkx402 (3 Buenos Aires finalists!) | Exploding. Barely 6 months old. |
| **Agent-to-agent economy** | midcurve.live, WalletSheets, Glider, YieldSeeker, SecretAgent | THE dominant narrative. 7/12 Cannes sponsors have agent bounties. |
| **Private DeFi** | GrimSwap (privacy DEX), SoloPatty (private orderbook), truZt arKanum | Privacy + DeFi combo is fresh |
| **Physical/tap interactions** | Blip Market (tap to trade), LensMint Camera, Paybot (robot payments) | Physical demo always wows judges |
| **ZK proofs for real things** | zkSampler (audio), LensMint (photos), zkDNSSEC | ZK applied to non-financial domains |
| **Recurring/subscription payments** | AutoPay ("Stripe for crypto subscriptions") | Unsexy but validated — was a HackMoney finalist |

**What's played out:** Generic DeFi dashboards, basic token swaps, simple chatbot agents, NFT marketplaces.

---

## Cannes 2026 Sponsors ($132K total)

| Sponsor | Pool | Hottest Bounty | What They Actually Want |
|---------|------|---------------|------------------------|
| **World** | $20K | Agent Kit ($8K) | Agents where human identity improves trust |
| **0G** | $15K | OpenClaw Agent ($6K) | Agents with persistent memory on decentralized infra |
| **Arc** | $15K | Agentic Nanopayments ($6K) | Agents paying agents via gas-free stablecoin micropayments |
| **Hedera** | $15K | AI & Agentic Payments ($6K) | AI agents executing autonomous payments |
| **ENS** | $10K | AI Agent Identity ($5K) | Agents with human-readable, discoverable ENS names |
| **Uniswap** | $10K | Best API Integration ($10K) | Anything executing trades via Uniswap API |
| **Flare** | $10K | TEE Extensions ($8K) | Attested off-chain logic, confidential compute |
| **Ledger** | $10K | AI Agents x Ledger ($6K) | Human-in-the-loop hardware approvals for agents |
| **Chainlink** | $7K | CRE Workflow ($4K) | Off-chain → on-chain orchestration |
| **WalletConnect** | $5K | WalletConnect Pay ($4K) | Tap-to-pay, recurring crypto payments |
| **Unlink** | $5K | Best Private App ($3K) | Private send/receive/manage on EVM |
| **Dynamic** | $5K | Any SDK ($1.7K each) | Auth + wallet infra, easy add-on |

**The meta:** This sponsor list is screaming **"agents that pay each other"**. World, 0G, Arc, Hedera, ENS, Ledger — 6 out of 12 sponsors have agent-specific bounties. That's the thesis of this hackathon.

---

## Your Real Edge

It's not MiCA knowledge (too niche for judges). It's this:

- **You understand how money actually moves** — payments, premiums, commissions, escrow, refund logic
- **You think in business models** — not just "cool tech" but "who pays whom and why"
- **You've done cold outreach, sales, negotiations** — you can PITCH. Most devs can't.

The pitch matters as much as the code. You have an unfair advantage on stage.

---

## Project Ideas (Ranked by Finalist Potential)

### Idea 1: "Phantom" — Private Agent-to-Agent Marketplace

**One-liner:** AI agents hire other AI agents for tasks, negotiate prices, and pay each other in stablecoins — all privately, so no one can see who's working with whom or what they're paying.

**Why this is cutting edge:**
- Agent-to-agent economy is THE 2026 narrative — and adding a privacy layer is novel
- No finalist has done "private agent commerce" yet
- Combines the two strongest Cannes signals: agents + privacy
- The demo is mesmerizing: watch agents discover each other, negotiate, transact — live on screen

**Sponsor fit (5 bounties, $28K potential):**
- **World Agent Kit** ($8K) — agents built on AgentKit, World ID verifies the human deploying each agent
- **Arc Agentic Nanopayments** ($6K) — agents pay each other in USDC micropayments, gas-free
- **ENS Agent Identity** ($5K) — each agent has an ENS name (e.g., data-cleaner.agent.eth), discoverable by other agents
- **Unlink Best Private App** ($3K) — all agent-to-agent transactions are private. You can prove your agent completed work without revealing the price or counterparty
- **Chainlink CRE** ($4K) — agents use Chainlink workflows to verify off-chain task completion before releasing payment
- Bonus: **0G Wildcard** ($1.5K) — agent memory stored on 0G

**Demo flow (3 min):**
1. "Meet Alice and Bob. They're AI agents." Show two agents with ENS names on screen.
2. Alice needs an image classified. She broadcasts a task request.
3. Bob (an ML agent) discovers the request, bids on it via Arc nanopayment negotiation.
4. They agree on 0.02 USDC. Bob does the work. Alice verifies via Chainlink.
5. Payment executes — privately via Unlink. On-chain you see: "A payment happened." But not who, how much, or for what.
6. "Now imagine 1,000 agents doing this. An entire economy, invisible, autonomous, private."

**Why it wins:** Judges see live agents autonomously transacting, negotiating, and paying — something that feels like the future. The privacy angle is the "oh shit" moment: an economy that runs itself where even the participants' identities are hidden.

**Score: 7/7**

---

### Idea 2: "Ghost Pay" — Private Recurring Payments

**One-liner:** Subscribe to anything, pay in crypto, and no one — not the chain, not analytics firms, not your employer — can see what you're subscribed to.

**Why this is cutting edge:**
- AutoPay ("Stripe for crypto subscriptions") was a HackMoney 2026 finalist — recurring payments is validated
- Adding privacy makes it genuinely new and relevant (Cannes loves privacy)
- Solves a real problem: on-chain payment history is public. Your employer can see your OnlyFans sub. Your insurer can see your gambling habit.
- One-sentence pitch that anyone understands instantly

**Sponsor fit (4 bounties, $18K potential):**
- **Unlink Best Private App** ($3K) — core: all subscription payments are private
- **Arc Stablecoin Logic** ($3K) — conditional escrow: funds locked per billing cycle, released on service delivery
- **WalletConnect Pay** ($4K) — tap-to-subscribe UX, recurring payment flows
- **World ID** ($8K) — prove you're a unique human subscriber (anti-sybil for free trials)
- Bonus: **Dynamic** ($1.7K) — wallet auth layer

**Demo flow (3 min):**
1. "Here's my wallet on Etherscan. You can see every transaction I've ever made. Every subscription. Every payment. That's the problem."
2. Open Ghost Pay. Subscribe to a mock service (e.g., a newsletter). Pay 5 USDC/month.
3. Show the chain: "A payment happened. That's all you can see. Not who paid, not who received, not the amount."
4. Cancel the subscription. Show the escrow releasing unused funds back.
5. "Private subscriptions. Private payments. Your money, your business."

**Why it wins:** The problem statement is instantly relatable. Everyone in the room has a public wallet. The demo is a before/after that makes people uncomfortable (seeing their own tx history exposed) and then relieved (seeing it hidden).

**Score: 6/7** (slightly less technically flashy than agents, but tighter story)

---

### Idea 3: "Tap & Duel" — NFC Tap-to-Bet with Friends

**One-liner:** Tap phones together to instantly create a private bet with a friend. Loser pays. No app download, no gas, no one else sees the bet.

**Why this is cutting edge:**
- Physical NFC interaction = judges can try it RIGHT THERE
- Combines: tap-to-pay (WalletConnect), privacy (Unlink), stablecoins (Arc), identity (World)
- Gaming/social betting was a Cannes 2025 finalist theme (livestakes)
- The demo is literally: "You. Me. Tap phones. Who wins the next hackathon demo? 5 USDC."

**Sponsor fit (4 bounties, $19K potential):**
- **WalletConnect Pay** ($4K) — NFC tap initiates the bet creation
- **Unlink Best Private App** ($3K) — bet details are private (amount, participants, outcome)
- **Arc Stablecoin Logic** ($3K) — conditional escrow holds both stakes, releases to winner
- **World ID** ($8K) — prove both participants are unique humans (no bot farming bets)
- Bonus: **Dynamic Mobile** ($1.7K) — mobile-first UX

**Demo flow (3 min):**
1. Pull out two phones. "Want to bet 5 USDC that my demo is better than yours?"
2. Tap phones together. Both see the bet appear. Confirm with World ID.
3. Show the escrow: 10 USDC locked in Arc stablecoin contract.
4. Resolve the bet (mock outcome). Winner gets paid instantly.
5. Check the chain: "A bet happened. You can't see who, how much, or what about."
6. "We just created a private, trustless bet in 4 seconds with a phone tap."

**Why it wins:** The most interactive demo possible. Judges PARTICIPATE. Physical wow moment. Simple enough to explain to your mom. Cannes vibes (think: tapping phones at a yacht party to bet on the F1 race).

**Score: 7/7** — possibly the highest "wow factor per line of code" ratio.

---

## Honest Assessment

| Idea | Cutting Edge? | Demo Wow? | Bounty Ceiling | Build Difficulty | Finalist? |
|------|:---:|:---:|:---:|:---:|:---:|
| **Phantom** (private agent marketplace) | 10/10 | 8/10 | $28K | Hard | Strong yes |
| **Ghost Pay** (private subscriptions) | 7/10 | 8/10 | $18K | Medium | Likely yes |
| **Tap & Duel** (NFC betting) | 7/10 | 10/10 | $19K | Medium | Strong yes |

**Phantom** is the most technically impressive and hits the most sponsor bounties, but it's the hardest to build in 36 hours (agent orchestration + privacy + payments + ENS discovery).

**Tap & Duel** has the best demo moment (judges physically participate) and is the most buildable, but it's less technically deep.

**Ghost Pay** is the most "real product" feeling but might not have enough flash for the stage.

**My honest take:** If you have a strong technical teammate, go Phantom. If you're building solo or with a small team, go Tap & Duel — the physical demo alone gets you halfway to the finalist stage.

---

## Pre-Hackathon Prep Checklist

### For any idea:
- [ ] Get accounts set up: World Developer Portal, Arc SDK, Unlink SDK, ENS testnet
- [ ] Build a working "hello world" with World Agent Kit or MiniKit
- [ ] Understand Arc's nanopayment/stablecoin escrow flow
- [ ] Test Unlink's private transaction SDK on testnet
- [ ] Prepare a clean frontend template (Next.js + Tailwind, nothing fancy)

### For Phantom specifically:
- [ ] Build a basic agent-to-agent communication protocol
- [ ] Define 2-3 "agent skills" that can be demoed (image classification, data lookup, text generation)
- [ ] Wire up ENS name registration for agents
- [ ] Get Chainlink CRE workflow running for task verification

### For Tap & Duel specifically:
- [ ] Get WalletConnect Pay NFC working on two test phones
- [ ] Build the escrow smart contract (simple: lock, resolve, release)
- [ ] Test World ID verification flow on mobile
- [ ] Design the "bet card" UI (clean, one-screen, instant)

### For either:
- [ ] Write your 3-minute demo script word-for-word
- [ ] Practice it 5 times
- [ ] Have a backup plan if one sponsor SDK doesn't work (skip it, still hit 3 others)
