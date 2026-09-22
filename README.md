# PrivacyPay

> **"Privacy-first SaaS subscriptions with fiat-friendly payments."**

[![Level 1: New Moon](https://img.shields.io/badge/Progression-Level%201%3A%20New%20Moon-blue.svg)](docs/level-1.md)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Midnight Network](https://img.shields.io/badge/Midnight-Compact%20v0.23-purple.svg)](https://docs.midnight.network)

PrivacyPay is a privacy-preserving SaaS subscription infrastructure built on the **Midnight Network**. It combines privacy-preserving recurring authorization and state verification on Midnight with familiar, seamless fiat payment execution off-chain.

---

## Lunar Progression Roadmap

| Level | Milestone Name | Status | Objective |
| :--- | :--- | :--- | :--- |
| **Level 1** | **New Moon** | **Completed** | Setup, core Compact smart contract, state verification tests, and interactive prototype. |
| **Level 2** | **Waxing Crescent** | *Pending* | Midnight Lace wallet integration, DApp connector, and full customer authorization flow. |
| **Level 3** | **First Quarter** | *Pending* | Production-grade dApp, merchant portal, and subscription state machine. |
| **The Turn**| **Idea Submission**| *Pending* | Formal competition submission & mentor checkpoint. |
| **Level 4** | **Waxing Gibbous** | *Pending* | Preprod MVP launch with payment gateway webhook integration. |
| **Level 5** | **Full Moon** | *Pending* | User validation (50+ Preprod users) & feedback loop. |
| **Level 6** | **Supermoon** | *Pending* | Midnight Mainnet launch & production release. |

---

## Core Value Proposition

1. **True Privacy by Design**: Zero subscriber personal or payment information is stored on-chain. Subscription authorizations are recorded using zero-knowledge cryptographic commitments (`H(secret, planId)`).
2. **Fiat-Friendly Separation**: Payment rails (Stripe / Paddle / fiat gateways) remain strictly separated from blockchain state, avoiding unnecessary blockchain friction for end-users.
3. **Verifiable State Transitions**: SaaS providers and customers can cryptographically verify subscription validity, lifecycle transitions, and active authorizations without leaking user transaction histories.

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                      CUSTOMER & MERCHANT                    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  PRIVACYPAY WEB APPLICATION                 |
|       (Next.js, TypeScript, Midnight Lace Connector)        |
+-------------------------------------------------------------+
        |                                             |
        v (Off-Chain Actions)                         v (ZK State Mutations)
+-------------------------------+             +-------------------------------+
|      PRIVACYPAY BACKEND       |             |     MIDNIGHT SMART CONTRACT   |
|   (Fiat Webhooks & Billing)   |             |   (`subscription.compact`)    |
+-------------------------------+             +-------------------------------+
        |                                             |
        v                                             v
+-------------------------------+             +-------------------------------+
|   PAYMENT GATEWAY (Stripe)    |             |       MIDNIGHT NETWORK        |
+-------------------------------+             +-------------------------------+
```

---

## Quick Start (Level 1)

### Prerequisites
- Node.js `>= 18.0.0` (Recommended: `v20+`)
- npm `>= 9.0.0`

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd privacy-pay

# Install all workspace dependencies
npm install
```

### Running Tests
```bash
# Run contract state transition and cryptographic commitment test suite
npm run test
```

### Running Frontend
```bash
# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation
- [System Architecture](docs/architecture.md)
- [Privacy Model & Data Classification](docs/privacy-model.md)
- [Level 1 Report](docs/level-1.md)
- [Competition Evidence](docs/competition/level-1/)
