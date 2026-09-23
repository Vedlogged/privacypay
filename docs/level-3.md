# Level 3 — First Quarter: Production-Grade dApp

## 1. Milestone Overview
- **Milestone**: Level 3 (First Quarter)
- **Project**: PrivacyPay
- **Objective**: Elevate PrivacyPay into a production-grade decentralized application featuring full multi-role portals (Customer & Merchant), a robust Subscription State Machine Engine, end-to-end API Route Handlers, automated recurring billing simulation, comprehensive `PROPOSAL.md` product idea submission, and hardened security controls.
- **Contract Address (Preprod)**: `02004a8b79f2dc6138de369c9b10499e0df238aa14d59bc44109720526e82b71`
- **Live Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)
- **Proposal Document**: [PROPOSAL.md](PROPOSAL.md)

---

## 2. Key Modules Implemented

### 2.1 Merchant Management Portal (`frontend/src/components/MerchantPortal.tsx`)
- **Executive Analytics**: Real-time Monthly Recurring Revenue (MRR), Active Subscriber counts, and Catalog statistics.
- **Product Builder**: SaaS product registration (Title, Category, Description, Merchant Address).
- **Plan Builder**: Dynamic tier creation (Pricing in USD, Billing Cadence, Features list).
- **Subscriber Registry**: Active subscriptions overview with on-chain shielded commitments and cycle counters.
- **Billing Engine Trigger**: Interactive control to trigger scheduled recurring billing cycles (`SUCCESS` or `FAILURE` decline simulation).

### 2.2 Customer Subscription Hub (`frontend/src/components/CustomerPortal.tsx`)
- **Lifecycle Visualizer**: 7-stage interactive state machine stepper.
- **Invoice & Receipt Ledger**: Fiat settlement history with cycle tracking and payment timestamps.
- **Non-Custodial Cancellation**: One-click revocation with secret preimage proof.

### 2.3 Subscription Engine FSM (`contract/src/subscription-engine.ts`)
- Implemented the complete 10-state lifecycle:
  $$\text{CREATED} \rightarrow \text{AUTHORIZED} \rightarrow \text{ACTIVE} \rightarrow \text{BILLING\_DUE} \rightarrow \text{PROCESSING} \rightarrow \text{PAID} \rightarrow \text{NEXT\_CYCLE}$$
  with terminal/exception handling for $\text{PAST\_DUE}, \text{FAILED}, \text{CANCELLED}, \text{EXPIRED}$.

### 2.4 Application API Layer (`frontend/src/app/api/`)
- `/api/products`: SaaS catalog management.
- `/api/plans`: Pricing tier definitions.
- `/api/subscriptions`: On-chain creation and authorization.
- `/api/subscriptions/[id]`: Individual subscription retrieval and cancellation.
- `/api/billing/cycle`: Recurring cycle execution engine.
- `/api/health`: Healthcheck & Midnight network telemetry.

### 2.5 Product Idea Submission (`PROPOSAL.md`)
- Comprehensive formal proposal answering all 4 required questions:
  1. Product Description & Target Users (B2B SaaS, developer tools, privacy-conscious consumers).
  2. Why Midnight (Compact circuits, private witness preimages, selective disclosure via `disclose()`, compliance without on-chain PII/financial credentials).
  3. Data Model & Architecture (Dual-state ledger variables, 10-state FSM, off-chain fiat rails).
  4. Feasibility to Mainnet (Roadmap from Level 1-3 through Preprod MVP, 50+ user validation, and Mainnet launch).

---

## 3. Verification & Acceptance Summary
- **Tests**: 15/15 unit and integration tests passing (`npm test`).
- **Compilation**: Compact contracts compiled with `.wasm`, `.zkir`, and TypeScript types (`npm run compile`).
- **Build**: Full Next.js 14 production build compiled with 0 errors (`npm run build`).
- **CI/CD**: GitHub Actions pipeline active with status badge in `README.md`.
- **Milestone Tag**: `v0.3.0-level3`.
