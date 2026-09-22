# PrivacyPay Architecture Specification

## 1. System Vision
PrivacyPay is an end-to-end privacy-preserving SaaS subscription infrastructure designed for the Midnight blockchain. It merges two essential models:
1. **SaaS Subscription Protocol**: On-chain verifiable authorization, commitment tracking, and state lifecycle management without revealing subscriber identities or balances.
2. **Fiat-Direct Execution Service**: Off-chain recurring payment processing through standard fiat gateways (e.g., credit cards, SEPA, ACH) that notifies the protocol upon validated settlement.

---

## 2. Layered Architecture

```
                                  +------------------------+
                                  |     Customer Client    |
                                  +------------------------+
                                              |
                                              v
+----------------------------------------------------------------------------------------+
|                               PRIVACYPAY WEB APPLICATION                               |
|  - UI Component Layer (Next.js, React, Vanilla CSS)                                    |
|  - Midnight Lace DApp Connector (`window.midnight.mnLace` / `@midnight-ntwrk/...`)      |
|  - Local Witness & Proof Orchestrator                                                  |
|  - Ledger State Subscription Client                                                    |
+----------------------------------------------------------------------------------------+
                               |                                            |
        (Fiat Checkout Request)|                                            |(ZK Proof & Contract Calls)
                               v                                            v
+--------------------------------------------------+     +-------------------------------+
|                 PRIVACYPAY API                   |     |    MIDNIGHT SMART CONTRACT    |
|  - Merchant Product & Plan Manager               |     |  - `subscription.compact`     |
|  - Webhook Listener (Signature Verification)     |     |  - `SubscriptionState` Ledger |
|  - Off-Chain Idempotency Engine                  |     |  - Commitment Registry        |
|  - Ephemeral Session Dispatcher                  |     |  - Transition Verification    |
+--------------------------------------------------+     +-------------------------------+
                       |                                                |
                       v                                                v
+--------------------------------------------------+     +-------------------------------+
|             PAYMENT SERVICE PROVIDER             |     |        MIDNIGHT LEDGER        |
|  - Traditional Cards / Direct Debit (Stripe)     |     |  - Preprod / Mainnet Ledger   |
|  - PCI-DSS Secure Credential Vaulting            |     |  - Shielded State Protection  |
+--------------------------------------------------+     +-------------------------------+
```

---

## 3. Core Architectural Boundaries

### 3.1 Frontend Responsibilities
- Rendering merchant plans, pricing options, and subscription details.
- Interacting with Midnight Lace Wallet extension via `@midnight-ntwrk/dapp-connector-api`.
- Generating local private entropy/secrets in client memory for witness injection.
- Invoking Compact circuits (`authorize`, `cancel`).
- Displaying real-time ledger status without exposing secret data.

### 3.2 Smart Contract Responsibilities (`subscription.compact`)
- Maintaining verifiable state of subscription authorizations.
- Storing cryptographic commitments `H(subscriberSecret, planId)` rather than plaintext user identities.
- Verifying transitions (`INACTIVE` -> `ACTIVE` -> `CANCELLED`).
- Enforcing authorization rules: only the holder of the secret preimage can authorize or cancel the subscription commitment.

### 3.3 Backend API Responsibilities (Levels 3-6)
- Storing off-chain merchant catalog metadata (plan titles, pricing descriptions, localized currency).
- Managing payment gateway webhooks with cryptographic HMAC signatures.
- Reconciling fiat invoice completion with protocol state.
- Strictly ensuring ZERO credit card credentials or PII ever touch the blockchain.

### 3.4 Payment Provider Responsibilities
- Handling PCI-compliant credit card input, 3D-Secure authentication, and settlement.
- Firing webhook events upon recurring charge success or failure.

---

## 4. State Machine Definition

The subscription lifecycle on Midnight transitions through well-defined deterministic states:

```
                  +--------------+
                  |   INACTIVE   | <----+ (Initial Constructor)
                  +--------------+      |
                         |              |
                         | authorize()  |
                         v              |
                  +--------------+      |
                  |    ACTIVE    |      |
                  +--------------+      |
                         |              |
                         | cancel()     |
                         v              |
                  +--------------+      |
                  |  CANCELLED   | -----+
                  +--------------+
```

1. **INACTIVE**: The registry is initialized with an active plan ID. No active subscriber commitment is bound.
2. **ACTIVE**: A subscriber provides a private secret witness, creates a verifiable commitment `H(secret, planId)`, and binds it to the ledger.
3. **CANCELLED**: The commitment owner proves knowledge of the secret preimage to transition the state to `CANCELLED`.
