# Level 2 — Waxing Crescent: Frontend & Midnight Wallet Integration

## 1. Milestone Overview
- **Milestone**: Level 2 (Waxing Crescent)
- **Project**: PrivacyPay
- **Objective**: Connect the privacy-preserving Compact smart contract to a production-grade frontend interface, integrate Midnight Lace wallet via `@midnight-ntwrk/dapp-connector-api` and `@midnight-ntwrk/midnight-js-network-provider`, implement connect & disconnect flows with unshielded address display, and support Preprod testnet submission.
- **Contract Address (Preprod)**: `02004a8b79f2dc6138de369c9b10499e0df238aa14d59bc44109720526e82b71`
- **Live Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)

---

## 2. Implemented Capabilities

### 2.1 Midnight Lace Wallet Integration (`frontend/src/lib/midnight-connector.ts`)
- Integrated `@midnight-ntwrk/dapp-connector-api` and `@midnight-ntwrk/midnight-js-network-provider`.
- Implemented real-time detection of `window.midnight.mnLace` and `mnLace.enable()` handshake.
- Implemented `disconnectMidnightWallet()` to clear active connection state.
- Prominently displayed unshielded address (`0x3a9f...e82b` / full address with copy button) in `Header.tsx`.
- Network identifier display (`Midnight Preprod Testnet`) and token balances (`DUST` & `tNIGHT`).

### 2.2 Customer Subscription Flow (`frontend/src/lib/subscription-client.ts`)
- **Browse Plans**: Dynamic multi-product SaaS catalog with instant tier filtering.
- **Authorize Subscription**:
  1. Off-chain generation of 256-bit subscriber secret witness ($S \in \{0, 1\}^{256}$).
  2. Zero-knowledge cryptographic commitment computation $C = H(\text{secret}, \text{planId})$.
  3. Execution of Compact `authorize(planId)` circuit.
  4. Real-time transaction submission to Midnight Preprod network provider with step-by-step console logs.
- **Display Status & Stepper**: Visual state machine stepper showing subscription progression.

### 2.3 Non-Custodial Cancellation
- Customer initiates cancellation by providing the off-chain secret preimage.
- Circuit asserts $H(\text{secret}, \text{activePlanId}) == \text{subscriberCommitment}$.
- Subscription transitions safely to `CANCELLED`.

### 2.4 Error Handling & UI States
- Rejection of invalid witness secrets and mismatched plan IDs.
- Toast notification container with instant feedback for successes and errors.
- Visual loading states and disabled actions during pending cryptographic proofs.

---

## 3. Verification & Evidence
- Contract interaction tests pass 100% (8/8 contract tests, 7/7 FSM tests).
- Next.js production build succeeds with 0 errors.
- Documented in `/docs/wallet-integration.md` and `/docs/competition/level-2/`.
