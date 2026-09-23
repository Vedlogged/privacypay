# PrivacyPay

> **"Privacy-first SaaS subscriptions with fiat-friendly payments on Midnight Network."**

[![CI Pipeline](https://github.com/Vedlogged/privacypay/actions/workflows/ci.yml/badge.svg)](https://github.com/Vedlogged/privacypay/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-privacypay--midnight.vercel.app-emerald.svg)](https://privacypay-midnight.vercel.app)
[![Level 1: New Moon](https://img.shields.io/badge/Progression-Level%201%3A%20New%20Moon-blue.svg)](docs/level-1.md)
[![Level 2: Waxing Crescent](https://img.shields.io/badge/Progression-Level%202%3A%20Waxing%20Crescent-blue.svg)](docs/level-2.md)
[![Level 3: First Quarter](https://img.shields.io/badge/Progression-Level%203%3A%20First%20Quarter-blue.svg)](docs/level-3.md)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Midnight Network](https://img.shields.io/badge/Midnight-Compact%20v0.23-purple.svg)](https://docs.midnight.network)

PrivacyPay is a decentralized, privacy-preserving SaaS recurring subscription protocol built on the **Midnight Network**. It combines privacy-preserving recurring authorization and state verification on Midnight with familiar, seamless fiat payment execution off-chain.

🌐 **Live Application Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)  
📄 **Product Proposal & Specification**: [PROPOSAL.md](PROPOSAL.md)

---

## Smart Contract & Preprod Deployment

PrivacyPay's Compact smart contract is deployed on the **Midnight Preprod Testnet** with compiled zero-knowledge circuit artifacts and TypeScript runtime bindings:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | `Midnight Testnet (Preprod)` |
| **Network ID** | `midnight-testnet-preprod` |
| **Contract Address** | `02004a8b79f2dc6138de369c9b10499e0df238aa14d59bc44109720526e82b71` |
| **Deployment TX Hash** | `0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3` |
| **Compact Compiler** | `v0.23.0` (Language Version `>= 0.20`) |
| **Compilation Output** | `managed/subscription/` (`.wasm`, `.zkir`, `contract/index.d.ts`, `witness/index.d.ts`) |
| **RPC Endpoint** | `https://rpc.preprod.midnight.network` |
| **Indexer Endpoint** | `https://indexer.preprod.midnight.network` |
| **Exported Circuits** | `authorize`, `activate`, `markBillingDue`, `startProcessing`, `settlePayment`, `advanceCycle`, `markPastDue`, `cancel` |

---

## Privacy Model & Data Classification

Privacy is the foundational core feature of PrivacyPay. Traditional SaaS billing leaks financial transaction graphs, user identities, and credit card metadata. PrivacyPay uses Midnight's dual-state ledger and **selective disclosure** via `disclose()` to separate subscription authorization from identity exposure.

### Data Classification Matrix

| Data Element | Storage Location | Accessibility | Classification | Privacy Guarantee & Minimization |
| :--- | :--- | :--- | :--- | :--- |
| **Subscriber Secret** | Customer Client (Local Memory / Encrypted Storage) | Customer Only | `PRIVATE` | 256-bit entropy witness input. Never leaves the client in plaintext; never written to the blockchain. |
| **Subscriber Commitment** | Midnight Public Ledger | Public Verifiable | `DERIVED / COMMITMENT` | Cryptographic hash $H(\text{secret}, \text{planId})$. Proves authorization ownership without revealing user wallet or identity. |
| **Active Plan ID** | Midnight Public Ledger & Merchant DB | Public | `PUBLIC` | Numerical identifier for the SaaS plan tier. |
| **Subscription State** | Midnight Public Ledger | Public | `PUBLIC` | 10-state lifecycle status (`CREATED`, `AUTHORIZED`, `ACTIVE`, `BILLING_DUE`, `PROCESSING`, `PAID`, `NEXT_CYCLE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`). |
| **Sequence Counter** | Midnight Public Ledger | Public | `PUBLIC` | Monotonically increasing counter preventing replay attacks. |
| **Cycle Counter** | Midnight Public Ledger | Public | `PUBLIC` | Number of successfully settled recurring billing cycles. |
| **Credit Card / Banking Data** | Payment Provider (Stripe Vault) | Payment Provider Only | `OFF-CHAIN SENSITIVE` | Regulated by PCI-DSS. Strictly isolated from Midnight contracts. ZERO financial credentials touch the chain. |
| **Merchant Business Metadata**| Off-Chain Catalog API | Public / Merchant | `OFF-CHAIN PUBLIC` | Plan descriptions, product images, marketing tiers. |

### Cryptographic Commitment Scheme

1. **Client Witness Secret Generation**:  
   The subscriber's client generates a high-entropy 256-bit random secret:
   $$S \in \{0, 1\}^{256}$$

2. **Zero-Knowledge Circuit Commitment**:  
   Inside the Compact circuit, the commitment $C$ is computed deterministically:
   $$C = \text{Hash}(S \parallel \text{planId})$$

3. **Selective Disclosure**:  
   The circuit calls `disclose(C)` to record *only* the derived commitment $C$ to the public ledger variable `subscriberCommitment`. The secret $S$ remains private to the client.

4. **Non-Custodial Cancellation**:  
   To cancel, the subscriber provides $S$ as an off-chain witness. The circuit asserts:
   $$\text{Hash}(S \parallel \text{activePlanId}) \stackrel{?}{=} \text{subscriberCommitment}$$
   If valid, the contract marks the state `CANCELLED`. Third parties without $S$ cannot tamper with or cancel the subscription.

### What Public Observers Can & Cannot Learn

- ✅ **Observers CAN Learn**: A valid subscription exists for Plan #101, its current lifecycle state (e.g. `ACTIVE`), and the sequence counter.
- ❌ **Observers CANNOT Learn**: Who owns the subscription, their Midnight wallet address, their real-world identity, their IP address, or any payment credentials.

---

## Lunar Progression Roadmap

| Level | Milestone Name | Status | Objective |
| :--- | :--- | :--- | :--- |
| **Level 1** | **New Moon** | **Completed** | Setup, core Compact contract, state verification tests, interactive prototype, and compiled `managed/` outputs. |
| **Level 2** | **Waxing Crescent** | **Completed** | Midnight Lace wallet DApp connector (`@midnight-ntwrk/dapp-connector-api`), connect/disconnect, address display, and ZK circuit flow. |
| **Level 3** | **First Quarter** | **Completed** | Production-grade dApp, multi-role Customer & Merchant portals, 10-state Subscription Engine FSM, REST API layer, 15 passing tests, CI badge. |
| **The Turn**| **Idea Submission**| **Current** | Formal competition submission & technical specification ([PROPOSAL.md](PROPOSAL.md)). |
| **Level 4** | **Waxing Gibbous** | *Pending* | Preprod MVP launch with Stripe webhook integration and recurring billing crons. |
| **Level 5** | **Full Moon** | *Pending* | User validation (50+ Preprod users) & feedback loop. |
| **Level 6** | **Supermoon** | *Pending* | Midnight Mainnet launch & production release. |

---

## Key Features

1. **True Privacy by Design**: Zero subscriber personal or payment information is stored on-chain. Subscription authorizations are recorded using zero-knowledge cryptographic commitments (`H(secret, planId)`).
2. **Multi-Role Portals**: 
   - **Customer Hub**: Manage active subscriptions, visual state machine progression, non-custodial cancellation, and fiat invoice history.
   - **Merchant Suite**: SaaS product catalog builder, dynamic pricing plans, real-time subscriber commitment tracking, and recurring billing cycle engine.
3. **Deterministic 10-State Machine**: Complete lifecycle engine coordinating off-chain fiat settlement with on-chain Compact circuits:
   $$\text{CREATED} \rightarrow \text{AUTHORIZED} \rightarrow \text{ACTIVE} \rightarrow \text{BILLING\_DUE} \rightarrow \text{PROCESSING} \rightarrow \text{PAID} \rightarrow \text{NEXT\_CYCLE}$$
4. **Midnight Lace Wallet Integration**: Real-time extension detection, connect & disconnect controls, unshielded address display, network telemetry, and DUST/tNIGHT balances.
5. **Full REST API Suite**: Next.js API route handlers for catalog management, subscriptions, billing cycles, and network health.

---

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/Vedlogged/privacypay.git
cd privacypay

# Install all monorepo workspace dependencies
npm install
```

### Compiling Compact Contracts
```bash
# Compile Compact smart contracts to managed/ directory
npm run compile
```

### Running Test Suite
```bash
# Run all 15 contract and state machine engine tests
npm test
```

### Running Local Web Application
```bash
# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
privacypay/
├── PROPOSAL.md                        # Product idea submission & architectural specification
├── README.md                          # Main project documentation, deployment & privacy model
├── LICENSE                            # Apache-2.0 License
├── package.json                       # Monorepo root configuration & SDK dependencies
├── managed/                           # Compiled Compact outputs (.wasm, .zkir, TypeScript bindings)
│   └── subscription/
├── contract/                          # Compact Smart Contract Workspace
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── subscription.compact       # Core Midnight Compact contract with circuits & witnesses
│   │   ├── types.compact              # Structs and state enum declarations
│   │   ├── simulator.ts               # State transition & cryptographic commitment simulator
│   │   ├── subscription-engine.ts     # 10-state deterministic FSM engine
│   │   ├── index.ts                   # Contract exports
│   │   └── managed/                   # Local managed compilation mirror
│   └── tests/
│       ├── subscription.test.ts       # 8 Compact contract state & commitment tests
│       └── subscription-engine.test.ts# 7 Subscription FSM lifecycle tests
├── frontend/                          # Next.js 14 Production Web Application
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Main application with multi-tab portals
│   │   │   ├── globals.css            # Dark glassmorphic design system
│   │   │   └── api/                   # REST API route handlers
│   │   │       ├── products/
│   │   │       ├── plans/
│   │   │       ├── subscriptions/
│   │   │       ├── billing/cycle/
│   │   │       └── health/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Lace wallet connect/disconnect & address display
│   │   │   ├── CustomerPortal.tsx     # Customer subscription hub & cancellation
│   │   │   ├── MerchantPortal.tsx     # Merchant catalog & billing cycle trigger
│   │   │   ├── PlanCard.tsx           # SaaS tier selection & ZK authorization trigger
│   │   │   ├── LifecycleStepper.tsx   # Interactive 10-state lifecycle visualizer
│   │   │   ├── StateInspector.tsx     # Midnight public ledger vs private witness inspector
│   │   │   └── SubscriptionConsole.tsx# Real-time ZK proof execution logs
│   │   └── lib/
│   │       ├── midnight-connector.ts  # Midnight Lace DApp connector with SDK imports
│   │       ├── subscription-client.ts # Midnight network provider & ZK circuit client
│   │       └── store.ts               # In-memory SaaS catalog and subscription store
├── docs/                              # Comprehensive Technical Documentation
│   ├── architecture.md                # Detailed system architecture & interaction diagrams
│   ├── privacy-model.md               # Privacy model, data classification & threat mitigations
│   ├── wallet-integration.md          # Midnight Lace wallet integration guide
│   ├── api.md                         # REST API specification & schemas
│   ├── security.md                    # Security architecture & threat analysis
│   ├── testing.md                     # Test strategy & coverage breakdown
│   ├── deployment.md                  # Preprod & Vercel deployment guide
│   ├── level-1.md                     # Level 1 milestone report
│   ├── level-2.md                     # Level 2 milestone report
│   ├── level-3.md                     # Level 3 milestone report
│   └── competition/                   # Verified competition evidence & test outputs
└── .github/
    └── workflows/
        ├── ci.yml                     # GitHub Actions CI pipeline (compile, test, build)
        └── level-1-ci.yml             # Level 1 verification workflow
```

---

## Documentation
- [Product Idea Submission Proposal](PROPOSAL.md)
- [System Architecture](docs/architecture.md)
- [Privacy Model & Data Classification](docs/privacy-model.md)
- [Midnight Lace Wallet Integration](docs/wallet-integration.md)
- [Subscription Engine State Machine & API](docs/api.md)
- [Security Architecture & Threat Model](docs/security.md)
- [Testing Strategy](docs/testing.md)
- [Deployment Guide](docs/deployment.md)
- [Level 1 Report](docs/level-1.md)
- [Level 2 Report](docs/level-2.md)
- [Level 3 Report](docs/level-3.md)
- [Competition Evidence](docs/competition/)
