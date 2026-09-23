# PrivacyPay — Midnight Network Project Proposal

> **Privacy-First SaaS Subscriptions with Fiat-Friendly Payments**  
> **Submission Level**: Level 1 (New Moon) • Level 2 (Waxing Crescent) • Level 3 (First Quarter) • The Turn  
> **Network Target**: Midnight Preprod Testnet & Midnight Mainnet  
> **Repository**: [https://github.com/Vedlogged/privacypay](https://github.com/Vedlogged/privacypay)  
> **Live Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)

---

## 1. Product Description & Target Users

### 1.1 Executive Summary
**PrivacyPay** is a decentralized infrastructure protocol bridging zero-knowledge smart contracts on the **Midnight Network** with off-chain fiat recurring payment rails. It empowers software-as-a-service (SaaS) businesses, subscription publishers, and digital service providers to manage recurring customer authorizations and lifecycle states without storing or exposing customer identities, transaction graphs, or credit card metadata on a public blockchain ledger.

In current Web2 and Web3 subscription systems, users face an untenable trade-off:
- **Web2 Subscriptions (Stripe, Chargebee, Recurly)**: Force customers to surrender Personally Identifiable Information (PII), track browsing habits, and maintain vulnerable plaintext credit card databases subject to frequent data breaches.
- **Traditional Web3 Subscriptions (Ethereum / EVM smart contracts)**: Expose public wallet addresses, exact payment amounts, recurring subscription intervals, and transaction graphs to all network observers, enabling competitors and surveillance firms to deanonymize users and profile business revenues.

PrivacyPay solves this through **selective disclosure and zero-knowledge cryptographic commitments** on Midnight:
$$\text{Commitment } C = \text{Hash}(\text{subscriberSecret} \parallel \text{planId})$$
The public ledger records only the cryptographic commitment $C$ and discrete lifecycle state transitions, while the customer's private preimage $\text{subscriberSecret}$ remains securely stored within client-side memory or local encrypted storage.

```
+-----------------------------------------------------------------------------------+
|                              PRIVACYPAY ARCHITECTURE                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------------+                     +--------------------------+   |
|   |    CUSTOMER PORTAL       |                     |     MERCHANT SUITE       |   |
|   | (Private Secret Witness) |                     | (Catalog & Cycle Engine) |   |
|   +------------+-------------+                     +------------+-------------+   |
|                |                                                |                 |
|                | 1. Generate Witness Secret                     | 4. Off-Chain    |
|                |    & Compute Proof                             |    Fiat Billing |
|                v                                                v                 |
|   +------------------------------------+          +---------------------------+   |
|   |     MIDNIGHT COMPACT CONTRACT      |          |    PCI FIAT GATEWAY       |   |
|   |    (subscription.compact)          |          |  (Stripe Vault / Off-Chain|   |
|   |  - State: CREATED -> AUTHORIZED    |          +-------------+-------------+   |
|   |  - Commitment: H(secret, planId)   |                        |                 |
|   |  - 10-State Deterministic FSM      |                        | 5. Webhook      |
|   +-----------------+------------------+                        |    Settlement   |
|                     |                                           |    Confirmation |
|                     +---------------------+---------------------+                 |
|                                           |                                       |
|                                           v                                       |
|                     +-------------------------------------------+                 |
|                     |    MIDNIGHT PREPROD DEPLOYMENT LEDGER     |                 |
|                     |  Addr: 02004a8b79f2dc6138de369c9b10499e...|                 |
|                     +-------------------------------------------+                 |
+-----------------------------------------------------------------------------------+
```

### 1.2 Target Users & Market Segments

1. **B2B SaaS & Developer Tool Providers**:
   - Software companies that want to offer recurring subscriptions without managing the compliance burdens of handling sensitive customer financial identities on-chain.
   - High-compliance industries (cybersecurity tooling, VPN providers, private AI inference APIs, private hosting) where subscribers demand absolute financial metadata confidentiality.

2. **Privacy-Conscious Global Consumers**:
   - Individuals subscribing to privacy software, VPNs, encrypted communications, cloud storage, or journalistic publications who do not want their recurring financial profile exposed to public block explorers or advertisers.

3. **Enterprise Merchants Seeking Fraud Protection**:
   - Merchants who want mathematical certainty of authorized recurring subscriptions and non-repudiation via zero-knowledge proofs without custodying private customer encryption keys.

---

## 2. Why Midnight?

The **Midnight Network** is fundamentally unique in the distributed ledger space because of its dual public-private state model, Compact smart contract language, and native zero-knowledge circuit integration:

### 2.1 Private Witnesses & Selective Disclosure
Traditional blockchains require all contract parameters to be submitted as public calldata. Midnight’s **Compact** language enables private `witness` functions:
```compact
witness getSubscriberSecret(): Bytes<32>;
```
The witness function executes strictly within the user’s local browser or client environment. The witness preimage is fed into the Compact ZK circuit, and the circuit uses `disclose()` to publish *only* the derived commitment to the ledger:
```compact
const secret = getSubscriberSecret();
const commitment = disclose(hash(secret, planId));
subscriberCommitment = commitment;
```
No observer, validator, or indexer ever sees `secret`.

### 2.2 Dual-State Ledger (Shielded + Public Verifiable)
Midnight allows smart contracts to maintain verifiable public state (`state`, `sequenceNumber`, `cycleCount`, `activePlanId`) alongside private client inputs. This enables:
- Public verification that a subscription is active and in good standing.
- Zero leakage regarding which specific person, wallet, or credit card owns that subscription.

### 2.3 Regulatory & Compliance Compatibility
Unlike obfuscation mixers or anonymity coins that obscure all ledger data and invite regulatory friction, Midnight’s selective disclosure architecture is inherently compliance-ready:
- On-chain data contains **zero credit card or bank account credentials** (complying strictly with PCI-DSS data minimization).
- Zero customer PII is stored on-chain (aligning with GDPR and CCPA "Right to be Forgotten" mandates).
- Merchants can produce verifiable cryptographic proofs of authorized recurring revenue for auditing without exposing individual customer preimages.

---

## 3. Data Model & System Architecture

### 3.1 On-Chain Compact Ledger State (`subscription.compact`)

| Field | Type | Storage | Visibility | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `SubscriptionState` (enum) | Ledger | Public | Current lifecycle status (`CREATED`, `AUTHORIZED`, `ACTIVE`, `BILLING_DUE`, `PROCESSING`, `PAID`, `NEXT_CYCLE`, `PAST_DUE`, `FAILED`, `CANCELLED`, `EXPIRED`). |
| `activePlanId` | `Field` | Ledger | Public | Numeric identifier for the active pricing plan. |
| `merchantAddress` | `Bytes<32>` | Ledger | Public | 32-byte merchant identifier / settlement address. |
| `subscriberCommitment` | `Bytes<32>` | Ledger | Public Verifiable | Cryptographic hash $H(\text{secret}, \text{planId})$. Proves ownership and validity without disclosing subscriber identity. |
| `sequenceNumber` | `Counter` | Ledger | Public | Monotonically increasing counter preventing replay attacks. |
| `cycleCount` | `Counter` | Ledger | Public | Number of completed recurring billing cycles. |

### 3.2 Private Client Witness
```compact
witness getSubscriberSecret(): Bytes<32>;
```
- **Generation**: High-entropy 256-bit cryptographic random generator ($S \in \{0, 1\}^{256}$).
- **Storage**: Client browser encrypted session storage / hardware key.
- **Proof Mechanism**: Used to construct authorization proofs and cancellation assertions ($H(S, P) == \text{subscriberCommitment}$).

### 3.3 10-State Deterministic Subscription Engine FSM
The complete subscription lifecycle is governed by an on-chain and TypeScript-verified finite state machine:

$$\begin{aligned}
\text{CREATED} &\xrightarrow{\text{authorize()}} \text{AUTHORIZED} \xrightarrow{\text{activate()}} \text{ACTIVE} \\
\text{ACTIVE} &\xrightarrow{\text{markBillingDue()}} \text{BILLING\_DUE} \xrightarrow{\text{startProcessing()}} \text{PROCESSING} \\
\text{PROCESSING} &\xrightarrow{\text{settlePayment()}} \text{PAID} \xrightarrow{\text{advanceCycle()}} \text{NEXT\_CYCLE} \xrightarrow{\text{activate()}} \text{ACTIVE} \\
\text{PROCESSING} &\xrightarrow{\text{paymentFailed}} \text{PAST\_DUE} \xrightarrow{\text{retrySuccess}} \text{PAID} \\
\text{ACTIVE} &\xrightarrow{\text{cancel() w/ Witness}} \text{CANCELLED}
\end{aligned}$$

```
+---------+  authorize()   +------------+  activate()   +--------+
| CREATED | -------------> | AUTHORIZED | ------------> | ACTIVE | <------+
+---------+                +------------+               +---+----+        |
                                                            |             |
                                                            | markBilling | advanceCycle()
                                                            | Due()       |
                                                            v             |
                                                   +-------------+        |
                                                   | BILLING_DUE |        |
                                                   +------+------+        |
                                                          |               |
                                                          | start         |
                                                          | Processing()  |
                                                          v               |
                                                   +------------+         |
                                                   | PROCESSING |         |
                                                   +---+----+---+         |
                                                       |    |             |
                                       settlePayment() |    | markPast    |
                                         (Fiat Succeeded)   | Due()       |
                                                       |    v             |
                                                       |  +----------+    |
                                                       |  | PAST_DUE |    |
                                                       |  +----------+    |
                                                       v                  |
                                                   +------+               |
                                                   | PAID | --------------+
                                                   +------+
```

### 3.4 API Layer & Integration Interface
- `POST /api/products`: Register merchant SaaS products.
- `POST /api/plans`: Publish pricing tiers and recurring intervals.
- `POST /api/subscriptions`: Initiate zero-knowledge subscription authorizations.
- `DELETE /api/subscriptions/[id]`: Prove ownership via witness preimage and revoke subscription.
- `POST /api/billing/cycle`: Process recurring cycles with fiat webhook simulation.
- `GET /api/health`: Midnight Preprod node RPC and indexer telemetry.

---

## 4. Feasibility & Mainnet Roadmap

PrivacyPay is structured as a 6-phase engineering milestone progression:

```
[Level 1: New Moon]   ---> [Level 2: Waxing Crescent] ---> [Level 3: First Quarter]
   Compact Contract           Lace Wallet & UI                 Production dApp & FSM
      (COMPLETED)               (COMPLETED)                         (COMPLETED)
          |
          v
[The Turn: Idea Submission] -> [Level 4: Waxing Gibbous] -> [Level 5: Full Moon] -> [Level 6: Supermoon]
   Proposal & Architecture        Preprod MVP & Stripe         50+ User Testnet         Midnight Mainnet
          |                           Webhook                      Validation                Launch
          +-------------------------------+----------------------------+------------------------+
```

### 4.1 Milestone Breakdown

| Milestone | Stage Name | Target Timeline | Core Objectives | Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | **New Moon** | *Completed* | Compact contract, simulator, test harness, managed compilation. | `subscription.compact`, 8 state tests, `managed/` compilation artifacts. |
| **Level 2** | **Waxing Crescent** | *Completed* | Midnight Lace DApp connector, client ZK proof formulation, UI console. | `@midnight-ntwrk/dapp-connector-api` integration, Lace connect/disconnect, Plan cards. |
| **Level 3** | **First Quarter** | *Completed* | Multi-role portals (Customer & Merchant), 10-state FSM, 15 tests, REST APIs. | Customer Portal, Merchant Suite, Billing Engine, CI/CD pipeline. |
| **The Turn**| **Idea Submission**| **Current** | Formal competition submission, technical specification, and review. | `PROPOSAL.md`, verified repository evidence, Preprod deployment records. |
| **Level 4** | **Waxing Gibbous** | Q4 2026 | Live Preprod MVP with real Stripe webhook integration and automated billing crons. | Stripe Elements embedded checkout, webhooks to Midnight Preprod transaction submitter. |
| **Level 5** | **Full Moon** | Q1 2027 | Testnet user validation with 50+ real SaaS test subscribers and feedback iterations. | Merchant analytics dashboard, gas sponsorship relayer, user feedback study. |
| **Level 6** | **Supermoon** | Q2 2027 | Security audit, formal verification of Compact circuits, and Midnight Mainnet launch. | Mainnet contract deployment, SDK npm package, merchant Stripe App plugin. |

### 4.2 Economic & Operational Viability
- **Transaction Costs (DUST & Gas)**: On-chain operations are limited to state-changing events (authorization, cycle settlement, cancellation). By batching billing cycle updates off-chain and submitting zero-knowledge state updates, per-subscriber monthly ledger fees are estimated at $< \$0.01$.
- **Merchant Monetization**: PrivacyPay operates as an open-source protocol with an optional $0.25\%$ processing fee on settled fiat subscription volume for hosted relayers.
- **Security & Formal Verification**: The deterministic Compact state machine will undergo automated formal verification using Midnight proof tooling to ensure zero state deadlock or commitment collisions.

---

## 5. Summary & Verification Reference

- **Contract Address (Preprod)**: `02004a8b79f2dc6138de369c9b10499e0df238aa14d59bc44109720526e82b71`
- **Network ID**: `midnight-testnet-preprod`
- **Compact Compiler**: `v0.23.0`
- **Test Suite**: 15/15 passing tests (`npm test`)
- **License**: Apache-2.0
