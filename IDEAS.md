# ETHGlobal Cannes 2026: InvestSpend — Detailed Plan

## The Core Idea

Deposit money → gain full exposure to an investment (S&P 500) → spend from your position anytime → only pay for downside protection on what you actually spend → unlimited upside on everything else.

---

## The Math (with real numbers)

### Strategy: Pay-As-You-Spend Put Options (Unlimited Upside)

No collar. No capped upside. You only buy a put on the exact amount you spend.

**Example: $1,000 into S&P 500 (SPY ~$550, April 2026)**

**Step 1: Deposit**
| Component | Details |
|---|---|
| User deposits | $1,000 USDC |
| Protocol buys | ~1.82 shares SPY exposure via Ondo SPYon or Dinari dSPY |
| Hedge cost at deposit | $0 — no hedge until you spend |
| Upside exposure | Unlimited — full $1,000 invested, no cap |

**Step 2: User wants to spend $200**
| Component | Details |
|---|---|
| Put option bought | Covers $200 of the position at current price |
| Put premium (the "spend fee") | ~$10 (5% of spend amount) |
| spUSD minted | $190 (spend amount minus hedge cost) |
| Remaining invested | $1,000 still fully invested, $190 of it hedged |
| Upside | Still unlimited on the full position |

**Step 3: User spends another $100 later**
| Component | Details |
|---|---|
| Additional put cost | ~$5 |
| Additional spUSD | $95 |
| Total spent | $285 spUSD |
| Total hedge cost paid | $15 |
| Remaining position | $1,000 invested, $285 hedged, $715 unhedged |

**Outcomes after 3 months (on the $285 spent portion):**

| S&P 500 moves | Full position worth | Spent spUSD backed? | User experience |
|---|---|---|---|
| -30% (crash) | $700 | Yes — puts cover the $285 | Protected on what you spent. Unhedged portion drops but recovers. |
| 0% (flat) | $1,000 | Yes | Paid $15 total in spend fees |
| +20% (rally) | $1,200 | Yes, overcollateralized | Full upside. No cap. $200 unrealized gains. |
| +50% (moon) | $1,500 | Yes, overcollateralized | Full upside. No cap. $500 unrealized gains. |

### Why not just borrow on Aave?

| | Aave (Borrow $200) | InvestSpend (Spend $200) |
|---|---|---|
| Direct cost | ~$2 interest (3mo at 4%) | ~$10 put premium (5%) |
| Collateral locked | $267 needed (75% LTV) | $0 extra — comes from existing position |
| Liquidation risk | Yes — 25% drop wipes you out | No — put protects spent amount |
| Must repay? | Yes, $200 + interest | No. spUSD is not debt. |
| In a crash (March 2020) | Liquidated. Position gone. $4.5B wiped in DeFi. | Put kicks in. Spent money safe. Rest recovers. |
| Capital efficiency | Need $1.33 per $1 borrowed | $1 invested = $0.95 spendable |

**The put is ~5x more expensive in pure cost. But it buys something Aave can't sell: no liquidation, no debt, no overcollateralization.** The pitch isn't "cheaper than Aave" — it's "the first time you can spend your investment without any risk of losing it."

---

## S&P 500: Available On-Chain Infrastructure

### Price Feeds (live today)

| Oracle | Feed | Chain | Details |
|---|---|---|---|
| **Chainlink CSPX/USD** | `0xF4E1B57FB228879D057ac5AE33973e8C53e4A0e0` | Ethereum | iShares S&P 500 UCITS ETF. Public address, no setup needed. 2% deviation, 86400s heartbeat. **Use this — Chainlink is a Cannes sponsor.** |
| **Chainlink SPYon/USD** | Contact required | Ethereum | Ondo's tokenized SPY price. Available via Ondo API. |
| **Pyth SPY/USD** | `19e09bb...11cd5` | Any EVM chain | Pull oracle, 5-second updates during market hours. Also has pre-market, post-market, overnight variants. |

### Tokenized S&P 500 (the actual investment asset)

| Protocol | Token | Chain | Access |
|---|---|---|---|
| **Ondo SPYon** | Tokenized SPDR S&P 500 ETF | Ethereum, BNB | Instant mint/burn. Total return (dividends reinvested). Not US persons. Has Chainlink feed. |
| **Dinari dSPY/dVOO** | Tokenized SPY and VOO | Arbitrum, Base, Ethereum | SEC-registered transfer agent. API + SDK (JS, Python, Go). 25K+ users, 80 countries. KYC required. |
| **Backed/xStocks SPYx** | Tokenized S&P 500 | Multiple chains | Swiss DLT compliant. Not US persons. |

### Interactive Brokers Integration

You have an IB account. Here's how it could work as a **backend service** (not user-facing):

**The architecture:**
- Users deposit USDC on-chain → your smart contract holds it
- Your backend (with YOUR IB account) buys SPY + put options on IB
- Chainlink price feed tracks the position value on-chain
- Smart contract mints spUSD based on the on-chain price feed
- When user redeems: backend sells on IB, sends USDC back on-chain

**Why this actually works for a hackathon:**
- You're not letting users trade on IB — YOUR account is the backend
- It's like how Ondo/Dinari work: one entity holds the TradFi assets, tokens represent claims
- IB has real SPY options with deep liquidity — no need to mock the put options
- You can buy ACTUAL put options, not simulated ones
- The IB API is REST-based, well documented, and you already have an account

**Why this is risky for a hackathon:**
- Adds off-chain complexity (IB API calls, settlement delay)
- If IB API goes down during demo, you're dead
- Judges may question the centralization (one IB account = single point of failure)
- T+1 settlement means the buy isn't instant

**Recommendation:** Use IB as the REAL backend but have the on-chain contract work with Chainlink price feeds regardless. The smart contract doesn't care WHERE the S&P exposure comes from — it just needs the Chainlink CSPX/USD feed to value the position. For the demo, you can pre-load the IB position and show: "this on-chain position is backed by real SPY shares in a brokerage account, with a real put option hedging it."

### On-Chain Options for S&P 500

**None exist today.** No on-chain protocol offers put options on S&P 500 or tokenized equities. Derive/Lyra, Hegic, Premia only do crypto.

**Ostium** has S&P 500 perpetuals on Arbitrum (up to 200x leverage), but perps ≠ options.

**This means:** The put option either comes from IB (real, off-chain) or is simulated in your smart contract (mocked, on-chain). Both are valid for a hackathon — Chainlink said mocking is fine.

| Feature | Details |
|---|---|
| What is it | Tokenized US equities (real stocks, 1:1 backed) |
| Available assets | 150+ stocks/ETFs including likely SPY, AAPL, GOOGL, etc. |
| Chains | Ethereum, Arbitrum, Base, Avalanche, Blast, Plume |
| How it works | "Tokenization-on-demand" — order placed on real market, then token minted |
| API | SDKs for JS/TS, Python, Go, Java |
| Users | 25K+ across 80 countries |
| For hackathon | Register at partners.dinari.com, get API key, use sandbox |

**Dinari is the play.** User deposits USDC → Dinari API buys SPY dShare → you hold the dShare + hedge it → mint spUSD. All on-chain, all ERC-20, no brokerage license needed.

**Risk:** Dinari has geographic restrictions. Some hackathon judges may not be able to use it. Have the ETH-backed version as a fallback.

---

## Brutally Honest: Can You Build This Solo?

You're one person. 36 hours. Let's be real about what's possible.

### What you MUST build (MVP):
1. **Smart contract** — deposit USDC, buy investment asset, mint spUSD, redeem. (~8 hours)
2. **Frontend** — deposit page, dashboard (balance, investment value, hedge status), spend page. (~10 hours)
3. **One sponsor integration done well** — Arc stablecoin logic OR Chainlink price feeds. (~6 hours)

### What you CANNOT build solo:
- Real options trading integration (no on-chain options protocol is easy to integrate in hours)
- Multiple deep sponsor integrations
- A polished multi-page app with animations
- Real Dinari API integration + real options hedging + real spending

### The Hard Truth About Options

There is no easy way to programmatically buy put options on tokenized equities on-chain today. Options protocols (Derive/Lyra, Hegic, Premia) exist for ETH/BTC, not for dShares. You would need to:

a) Build your own simplified put option contract (a "vault" that acts as counterparty), OR
b) Mock it with Chainlink price feeds (Chainlink said this is OK), OR
c) Use a covered call vault pattern that already exists

**Option (b) is the hackathon move.** You build a contract where:
- The protocol holds the investment asset
- Chainlink price feed monitors the price
- If price drops below the put strike, the contract has a reserve pool that covers the difference
- The "call" side is simulated by capping the user's redeemable value

This is not a REAL options market — it's a smart contract that BEHAVES like a collar using price oracles. For a hackathon demo, this is fine. Chainlink literally told you they're OK with mocking.

---

## Revised Solo Build Plan

### What to actually build (36 hours)

**Architecture: One smart contract, one frontend, two sponsor integrations.**

```
User deposits USDC
       │
       ▼
┌──────────────────────────┐
│   InvestSpend Contract    │
│                          │
│  1. Swap USDC → wstETH   │  (or mock dShare)
│     via Uniswap           │
│  2. Register collar:      │
│     - floor = 95% of      │
│       deposit value        │
│     - cap = 110% of       │
│       deposit value        │
│  3. Mint spUSD = floor     │
│     value                  │
│  4. Chainlink price feed   │
│     monitors position      │
│  5. Redeem: burn spUSD,    │
│     get min(position, cap) │
│     back in USDC           │
└──────────────────────────┘
       │
       ▼
  User has spUSD
  (ERC-20, transferable,
   spendable anywhere)
```

### Hour-by-hour plan

**Hours 0-2: Setup**
- Scaffold Next.js app + Foundry/Hardhat
- Deploy to testnet (Arbitrum Sepolia or Base Sepolia)
- Get Chainlink price feed working for ETH/USD

**Hours 2-10: Smart Contract (THE CORE)**
- `deposit(uint256 amount)` — takes USDC, swaps to wstETH via Uniswap, calculates floor/cap, mints spUSD
- `redeem(uint256 spUsdAmount)` — burns spUSD, calculates current position value (clamped between floor and cap), returns USDC
- `getPositionHealth(address user)` — returns current value, floor, cap, hedge status
- Chainlink price feed integration for ETH/USD (or mock stock price)
- Events for all state changes

**Hours 10-12: Chainlink CRE Integration**
- Set up a CRE workflow: "when ETH price drops below user's floor, trigger the hedge mechanism"
- This is where the mocked Chainlink Streams data could come in — show real-time price monitoring
- Even if mocked, the ARCHITECTURE is correct, which is what Chainlink judges care about

**Hours 12-20: Frontend**
- Page 1: Deposit flow — enter amount, see breakdown (investment: $X, floor: $Y, cap: $Z, spUSD minted: $Y)
- Page 2: Dashboard — position value gauge (green/yellow/red), current price vs floor vs cap, spUSD balance
- Page 3: Spend — simple transfer of spUSD to a merchant address (or QR code)
- Use a clean template (shadcn/ui). Polish > features.

**Hours 20-26: Arc Integration**
- Integrate Arc's stablecoin infrastructure for the spUSD mint/burn flow
- Use Arc's escrow logic for the deposit → investment → mint pipeline
- This replaces your custom ERC-20 with Arc's infra (more credible, hits the bounty)

**Hours 26-30: Unlink Privacy (if time)**
- Make the spend transactions private via Unlink
- "You can see I have spUSD. You can see I invested. But you can't see what I spent it on."

**Hours 30-34: Polish + Demo Prep**
- Fix bugs
- Make the dashboard look beautiful
- Record backup video demo (in case live demo fails)
- Write the 3-minute script

**Hours 34-36: Submit**
- Deploy to production testnet
- GitHub repo clean
- Submission video
- Write sponsor-specific descriptions for each bounty

---

## Sponsor Strategy (Revised for Solo)

### Tier 1: Go deep (these are your bounty targets)

**Arc ($6K-$9K)** — Stablecoin Logic + possibly Nanopayments
- spUSD mint/burn flow built on Arc's stablecoin infra
- Conditional escrow: user's USDC is held until investment + hedge are confirmed
- This is your biggest integration. Arc IS the product.

**Chainlink ($4K-$7K)** — CRE Workflow + Price Feeds (+ mocked Streams)
- Price feeds for the investment asset
- CRE workflow: automated hedge trigger when price crosses floor
- Mock the Streams data to show real-time price monitoring architecture
- They said mocking is fine. Do it correctly.

### Tier 2: Add if time allows

**Unlink ($3K-$5K)** — Private spending
- Wrap the spUSD → merchant transfer in Unlink's privacy layer
- 2-3 hours to integrate if their SDK is clean
- "Invest and spend — privately" is a better pitch than "invest and spend"

### Tier 3: Mention in pitch but don't force

**World ID** — Could gate the deposit flow (anti-sybil). Quick integration if their SDK is easy. Don't force it.

**WalletConnect Pay** — If the spend page can use WC Pay for the transfer, fine. If not, a simple "send spUSD to address" works.

### Skip entirely:

**Hedera** — Different chain, different tooling. Not worth the context switch solo.
**Flare TEE** — You can't justify why TEE is needed here, and they told you as much.
**Dynamic** — Nice-to-have auth layer but won't move the needle for finalist.
**Uniswap** — The swap is a small part of the product, hard to justify $10K bounty for one swap call.

**Realistic bounty target: $10K-$16K across 2-3 sponsors.**

---

## The Pitch (3 minutes, solo)

**[0:00-0:20] The hook**
"Right now you have two options with your money. Invest it — and it's locked. Or spend it — and you miss the gains. What if I told you there's a third option?"

**[0:20-0:50] The deposit**
*Live demo.* Deposit 1,000 USDC. Show the breakdown:
- "950 dollars of S&P 500 exposure. A put option at $950 protecting my downside. A call sold at $1,100 to pay for the put. Zero net cost."
- 950 spUSD appears in wallet.
- "I now have $950 I can spend. And my investment is still working."

**[0:50-1:20] The spend**
Transfer 100 spUSD to a merchant address.
- "Just paid for dinner. My investment? Still there. Still growing."
- Show dashboard: position value $1,000, spUSD remaining: $850, spent: $100.

**[1:20-1:50] The hedge**
Show a simulated crash scenario (or pull up historical data):
- "March 2020. S&P drops 34%. On Aave, you get liquidated. On InvestSpend..."
- Dashboard shows: position drops, but floor holds. spUSD still backed.
- "The put option activated. Every spUSD is still worth a dollar."
- "Chainlink CRE detected the price breach and executed the hedge automatically."

**[1:50-2:20] Why it's different**
"This is NOT borrowing. On Aave, you need $1,500 collateral to borrow $1,000. You get liquidated if the price drops. You OWE the money back."
"On InvestSpend: deposit $1,000, get $950 spUSD. No overcollateralization. No liquidation. No debt. The put option IS the backing."

**[2:20-2:50] The vision**
"$3 trillion sits in stablecoins earning nothing. $100 trillion is locked in investments you can't touch. InvestSpend bridges that gap with a zero-cost collar and a spendable stablecoin."
"Every price feed: Chainlink. Every stablecoin operation: Arc. Every spend: private via Unlink."

**[2:50-3:00] Close**
"Invest and spend. The same dollar. At the same time. Thank you."

---

## Open Questions to Resolve

- [ ] Does Arc's SDK actually support custom stablecoin minting, or is it only for USDC/EURC operations?
- [ ] Can Dinari dShares be bought programmatically in a hackathon sandbox? Or stick with wstETH?
- [ ] What Chainlink CRE workflow templates exist? How long does setup actually take?
- [ ] Does Unlink work on testnet? What chains?
- [ ] Can you pre-register for all sponsor developer portals before the hackathon?

---

## What Makes This a Finalist (or Not)

**For:**
- Genuinely novel primitive — nobody has built this across 16,619 ETHGlobal projects
- Clean, explainable concept — "invest and spend the same dollar"
- Real financial engineering — zero-cost collar is intellectually impressive
- Solves a real problem everyone in the room has
- Strong Chainlink + Arc alignment

**Against:**
- Solo build = less polish than 4-person teams
- The options mechanism is mocked, not real — sharp judges may call this out
- No physical "wow moment" (no NFC tap, no game, no live agent)
- DeFi structured products can feel abstract on stage
- Spend side is just "transfer spUSD" — not as exciting as buying a gift card

**Honest finalist odds: 15-25%.** The idea is strong enough. The question is whether solo execution can be polished enough to compete with teams of 4. The pitch has to be FLAWLESS to compensate for less polish in the product.
