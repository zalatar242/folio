# ETHGlobal Cannes 2026 — Submission (Copy-Paste Ready)

NOTE: Each section below is inside a code block so you can copy it cleanly.
Video must be under 4 minutes (not 5).

---

## Project Name

```
Folio
```

## Tagline

```
0% interest credit line backed by your stocks. Borrow without selling, no minimums, no taxes.
```

## Description *

```
Globally, trillions sit in brokerage accounts that people can't spend. Need cash? You either sell shares and lose up to 37% to capital gains taxes, or take a margin loan at 7-12% interest — if you even qualify. Most brokerages require $500K+ in assets.

Folio gives you a 0% interest credit line backed by your stock portfolio. No interest. No minimums. No liquidation risk. No selling, no taxes.

When you spend $50 against your $225 TSLA, Folio locks ~0.222 shares as collateral and sets a zero-cost collar — your downside is protected (floor at $213.75), your upside is temporarily capped ($258.75). You receive $50 USDC instantly. At expiry, repay $50 and get your shares back, or the collar settles automatically. The premium from capping your upside pays for the downside protection. Net cost to you: $0.

The entire experience feels like a neobank — email login, "spend" buttons, virtual cards, transaction receipts. No wallets, no hex addresses, no MetaMask. The blockchain is invisible plumbing.

Under the hood: Hedera Token Service manages all equity tokens, stablecoin advances, and NFT receipts (zero Solidity). A Chainlink CRE workflow pulls real-time prices from Data Streams and implied volatility from DoltHub, computes market-driven collar strikes, and writes them on-chain to a CollarOracle on Base Sepolia. Dynamic provides email-only auth via the JavaScript SDK and MPC server wallets via the Node SDK for automated settlement. An AI optimizer uses on-chain oracle data to recommend optimal protection ranges for every spend.

The big brokerages all offer securities-backed credit lines. Every single one requires $500K+ and charges 7-9%. Folio does the same thing for anyone, at 0%, from their phone.
```

## How it's made *

```
Folio is a Next.js 16 App Router application (TypeScript, Tailwind CSS) with three sponsor integrations running in concert. Solo build, 36 hours.

HEDERA — All financial operations run on Hedera Token Service using the @hashgraph/sdk — no Solidity anywhere on Hedera. Folio creates fungible tokens (MOCK-TSLA, MOCK-AAPL, USDC-TEST) to represent equity positions and stablecoin advances. When a user spends against their portfolio, the collateral lock is prepared as an unsigned transaction, signed client-side with their encrypted Hedera key (AES-256-CBC), then co-signed by the operator — a true non-custodial flow. Each spend mints an NFT Spend Note with IPFS metadata (via Pinata) recording the asset, shares locked, collar parameters, and expiry. Hedera Consensus Service provides an immutable audit trail logging every spend, repayment, and settlement. The app uses 4+ native Hedera services: HTS fungible tokens, HTS NFTs, HCS audit logging, and account management with KYC grants, freeze/unfreeze, and custom fee schedules.

CHAINLINK — A CRE workflow orchestrates the entire pricing pipeline. Step 1: Chainlink Data Streams (via Confidential HTTP — HMAC credentials secured in CRE's confidential compute enclave) fetches real-time asset prices at 8 decimal precision. Step 2: DoltHub SQL API fetches options implied volatility, historical volatility, and IV rank. Step 3: The workflow computes zero-cost collar strike prices using a log-symmetric approximation with real market volatility. Step 4: Results are written on-chain to a CollarOracle smart contract on Base Sepolia via EVM Write. The frontend reads collar parameters from the on-chain oracle using viem. This gives Folio DON-verified, market-data-driven protection ranges instead of hardcoded percentages. The Confidential HTTP capability keeps Data Streams API credentials secure — they never leave the enclave.

DYNAMIC — The JavaScript SDK provides email-only OTP authentication — users never see a wallet connection screen. Custom themed to match the neobank aesthetic. Server-side JWT verification via JWKS protects all API routes. The Node SDK powers server wallets with 2-of-2 MPC threshold signing for oracle maintenance on Base Sepolia and a delegation flow for automated settlement on behalf of users.

NOTABLE HACK — The zero-cost collar is the financial innovation that makes 0% possible. Selling a call option (capping upside) pays for buying a put option (protecting downside). The CRE workflow computes these strikes using real implied volatility from options markets, not hardcoded values. The AI optimizer uses a three-tier approach: (1) on-chain Chainlink oracle data as highest priority, (2) LLM-enhanced analysis with real options chain data, (3) quantitative fallback using Black-Scholes-inspired math.

Additional integrations: Plaid (real brokerage holdings), Lithic (virtual debit cards), Pinata (IPFS metadata), Supabase (user registry, spend notes), Vercel AI SDK (AI recommendation engine).
```

## Tech Stack

### Ethereum developer tools * (select all applicable)

```
Foundry
Viem
```

### Blockchain networks * (select all applicable)

```
Hedera (Testnet)
Base (Sepolia Testnet)
```

### Programming languages * (select all applicable)

```
TypeScript
Solidity
```

### Web frameworks * (select all applicable)

```
Next.js
React
Tailwind CSS
```

### Databases * (select all applicable)

```
Supabase (PostgreSQL)
IPFS (Pinata)
```

### Design tools * (select all applicable)

```
Figma (if you used it — otherwise skip)
```

### Other technologies/libraries/frameworks

```
@hashgraph/sdk
hedera-agent-kit
Vercel AI SDK
Chainlink CRE
Chainlink Data Streams
Dynamic JavaScript SDK
Dynamic Node SDK
Plaid
Lithic
Pinata
viem
```

## Describe how AI tools were used in your project

```
AI is used in two places within the product itself:

1. Hedera AI Agent — An autonomous agent built with the Hedera Agent Kit and MiniMax M1 via Vercel AI SDK. It executes on-chain Hedera operations via natural language: checking token balances, transferring tokens, minting NFTs, and submitting HCS audit messages. Runs in autonomous mode (AgentMode.AUTONOMOUS) with scoped tools and a step limit of 10. Used for pre-flight checks (e.g. verifying treasury USDC balance before recommending a collar) and as a freeform agent endpoint at /api/ai/agent.

2. AI Collar Optimizer — Uses the Vercel AI SDK with a three-tier approach to recommend optimal protection parameters for each spend. The highest-priority source is on-chain Chainlink oracle data (DON-verified prices and volatility from the CRE workflow). If an LLM API key is available, it enhances recommendations by analyzing real options chain data — implied volatility, IV skew, put/call ratios, and historical volatility — to suggest floor/cap percentages and duration. Falls back to a quantitative model using Black-Scholes-inspired volatility math. Now includes an agentic pre-flight step that calls the Hedera AI Agent to verify treasury balance before recommending.

3. AI Chat Bubble — A floating assistant (Vercel AI SDK) that helps users understand the trade-offs of their active collars. Users can ask questions like "should I repay early?" or "what does this collar mean for my TSLA position?" and get contextual answers based on their portfolio and current market data.

For development: Claude Code was used as a coding assistant throughout the 36-hour build for implementation, debugging, and architecture decisions.
```

## Submission type *

```
Top 10 Finalist & Partner Prizes
```

## Partner prizes (select 3 max) *

```
1. Hedera ($15,000)
2. Chainlink ($7,000)
3. Dynamic ($5,000)
```

## Which other partners' technologies have you used?

```
(none beyond the 3 selected)
```

---

## Partner Prize Questions

### Chainlink ($7,000) — How are you using this Protocol / API? *

```
Folio uses a CRE workflow as its core pricing engine. The workflow fetches real-time asset prices from Chainlink Data Streams via Confidential HTTP (HMAC credentials secured in the enclave), pulls options implied volatility from DoltHub, computes zero-cost collar strike prices using log-symmetric math, and writes the results on-chain to a CollarOracle smart contract on Base Sepolia via EVM Write. The frontend reads these DON-verified collar parameters to set market-driven protection ranges for every spend transaction. Without this workflow, we'd use hardcoded percentages — with it, floor/cap ranges reflect real market volatility.
```

### Chainlink — How easy is it to use the API / Protocol?

```
7
```

### Dynamic ($5,000) — How are you using this Protocol / API? *

```
Folio uses both Dynamic SDKs. The JavaScript SDK provides email-only OTP authentication — no wallet screens, no MetaMask, no crypto UX. It's custom themed to match our neobank aesthetic and every API route is protected via server-side JWT verification against Dynamic's JWKS endpoint. The Node SDK powers 2-of-2 MPC server wallets for backend operations like oracle maintenance on Base Sepolia, plus a delegation flow that lets the backend execute automated collar settlement on behalf of users without them needing to be online. Dynamic is what makes the blockchain layer completely invisible to end users.
```

### Dynamic — How easy is it to use the API / Protocol?

```
9
```

### Hedera ($15,000) — How are you using this Protocol / API? *

```
Folio runs entirely on Hedera Token Service via the @hashgraph/sdk — zero Solidity. I create fungible tokens (MOCK-TSLA, MOCK-AAPL, USDC-TEST) representing equity positions and stablecoin advances. Each spend locks collateral via a non-custodial flow (unsigned TX prepared server-side, signed client-side with encrypted keys, co-signed by operator), mints an NFT Spend Note with IPFS metadata, transfers USDC, and logs to a Hedera Consensus Service audit trail. I use 4+ native services: HTS fungible tokens, HTS NFTs, HCS audit logging, and account management with KYC grants, freeze/unfreeze, and custom fee schedules.

Folio also integrates the Hedera Agent Kit with MiniMax M1 via Vercel AI SDK for an autonomous AI agent that can check balances, transfer tokens, mint NFTs, and submit HCS audit messages — all via natural language. The agent runs in autonomous mode with scoped tools (token transfers, balance queries, HCS audit, account queries) and is used for pre-flight checks like verifying treasury USDC balance before recommending a collar. This qualifies for the AI & Agentic Payments bounty.
```

### Hedera — How easy is it to use the API / Protocol?

```
8
```

---

## Source Code URL

```
https://github.com/zalatar242/folio
```

## Links to include

```
GitHub: https://github.com/zalatar242/folio
Live Demo: (your Vercel deployment URL)
CollarOracle (Base Sepolia): https://sepolia.basescan.org/address/0x00A3cF51bA20eA6f1754BaFcecA6d144e3d1D00f
Hedera Testnet Explorer: https://hashscan.io/testnet
Demo Video: (upload to YouTube/Loom, unlisted — MUST be under 4 minutes)
```

---

## Demo Video Script (UNDER 4 MINUTES — not 5)

### 0:00–0:20 — The Problem
"Trillions sit in brokerage accounts that people can't spend. If you need cash, you sell shares and lose up to 37% to taxes, or take a margin loan at 7-12% interest — if you even qualify."

### 0:20–0:40 — The Solution
"Folio gives you a 0% interest credit line backed by your stocks. No interest, no minimums, no selling. Your upside is temporarily capped while the line is open — that cap pays for the downside protection. Net cost: zero."

### 0:40–1:10 — Demo: Sign In (Dynamic)
- Show email login (no wallet, no MetaMask)
- "Dynamic JavaScript SDK — email OTP only. No crypto UX."
- Show the neobank-style dashboard

### 1:10–2:00 — Demo: Spend Against Your Portfolio
- Select TSLA, enter $50
- Show collar visualization (floor/cap range)
- "These protection ranges come from on-chain Chainlink oracle data"
- Sign the transaction (client-side Hedera key)
- Show confirmation: USDC advance + Spend Note minted

### 2:00–2:40 — Under the Hood: Hedera
- Hashscan: token transfers (collateral lock + USDC advance)
- NFT Spend Note with IPFS metadata
- HCS audit trail messages
- "Four native Hedera services, zero Solidity"

### 2:40–3:15 — Under the Hood: Chainlink
- CRE workflow: Data Streams + DoltHub + collar math + EVM Write
- CollarOracle contract on Base Sepolia
- "Confidential HTTP keeps Data Streams credentials in the enclave"

### 3:15–3:35 — Under the Hood: Dynamic
- Server wallet (Node SDK) for oracle maintenance
- Delegation flow for automated settlement
- "Server wallets + delegation = users never touch crypto"

### 3:35–3:55 — Why This Matters
"Every big brokerage offers securities-backed credit lines. They all require $500K+ and charge 7-9%. Folio does the same thing for anyone, at 0%, from their phone. The blockchain makes it possible. The UX makes it invisible."

---

## Screenshots Needed (at least 3 required)

1. Dashboard — Portfolio view with holdings, total value, available to spend
2. Spend Flow — Amount input with collar visualization (floor/cap range)
3. Confirmation — Spend Note receipt with transaction details
4. Hashscan — Token transfer on Hedera testnet
5. Hashscan — NFT Spend Note with metadata
6. Blockscout — CollarOracle contract on Base Sepolia
7. Mobile View — Bottom nav, responsive design

---

## Prize Track Notes (for partner judging conversations)

### When talking to Hedera judges:

```
Folio uses 4+ native Hedera services with zero Solidity:

1. HTS Fungible Tokens — MOCK-TSLA, MOCK-AAPL, USDC-TEST with custom fee schedules
2. HTS NFTs — Spend Note collection, each mint records collar params in IPFS metadata
3. Hedera Consensus Service — Immutable audit trail for every spend, repayment, settlement
4. Account Management — User account creation, token associations, KYC grants, freeze/unfreeze

Plus a Hedera Agent Kit integration — an autonomous AI agent (MiniMax M1 via Vercel AI SDK) that can check balances, transfer tokens, mint NFTs, and submit HCS messages via natural language. Runs in AgentMode.AUTONOMOUS with scoped tools. Used for pre-flight treasury checks and as a freeform agent endpoint. This qualifies for the AI & Agentic Payments bounty ($6K).

Non-custodial flow: collateral lock transactions are prepared server-side as unsigned bytes, signed client-side with the user's encrypted Hedera key (AES-256-CBC), then co-signed by the operator.

The full token lifecycle is demonstrated: creation → distribution → collateral lock → NFT mint → settlement/repayment.

Key files: src/lib/hedera.ts (549 lines of pure SDK operations), src/lib/hedera-agent.ts (Agent Kit), src/app/api/ai/agent/route.ts, src/app/api/spend/prepare/route.ts, src/app/api/spend/execute/route.ts
```

### When talking to Chainlink judges:

```
Folio's CRE workflow is the core pricing engine — not a demo integration.

Pipeline: Chainlink Data Streams (Confidential HTTP) → DoltHub options volatility → zero-cost collar strike computation → CollarOracle.updateCollars() on Base Sepolia via EVM Write.

Why Confidential HTTP matters: Data Streams requires HMAC authentication. These credentials are processed inside CRE's confidential compute enclave — never exposed in code, logs, or on-chain. The prices fetched directly determine how much collateral users lock, so credential security and price integrity are critical.

The CollarOracle stores price, floor, cap, volatility, and updatedAt per symbol. The frontend reads on-chain data as the highest-priority source for collar recommendations.

Without this workflow, we'd use hardcoded 5%/15% floor/cap. With it, protection ranges are market-data-driven using real implied volatility from options markets.

Key files: chainlink/my-workflow/workflow.ts, chainlink/contracts/CollarOracle.sol, src/lib/chainlink.ts
```

### When talking to Dynamic judges:

```
Folio uses both Dynamic SDKs — JavaScript and Node:

JavaScript SDK: Email-only OTP authentication. No wallet connection, no MetaMask, no crypto UX at all. Custom themed to match neobank aesthetic (emerald accent, dark mode). Server-side JWT verification via JWKS on every API route.

Node SDK: Server wallets (2-of-2 MPC) for backend operations — oracle maintenance on Base Sepolia. Delegation flow allows automated settlement on behalf of users without them needing to be online.

The key insight: Dynamic makes blockchain invisible. Users sign in with email, spend against their stocks, and never know they have a Hedera account or that transactions are being signed. That's the entire product thesis — "Goldman Sachs for everyone" means zero crypto UX.

Key files: src/lib/dynamic-provider.tsx, src/lib/auth.ts, src/lib/dynamic-server.ts, src/lib/dynamic-delegation.ts
```
