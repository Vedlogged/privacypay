# PrivacyPay

> **"Privacy-first SaaS subscriptions with fiat-friendly payments."**

[![Level 1: New Moon](https://img.shields.io/badge/Progression-Level%201%3A%20New%20Moon-blue.svg)](docs/level-1.md)
[![Level 2: Waxing Crescent](https://img.shields.io/badge/Progression-Level%202%3A%20Waxing%20Crescent-blue.svg)](docs/level-2.md)
[![Level 3: First Quarter](https://img.shields.io/badge/Progression-Level%203%3A%20First%20Quarter-blue.svg)](docs/level-3.md)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Midnight Network](https://img.shields.io/badge/Midnight-Compact%20v0.23-purple.svg)](https://docs.midnight.network)

PrivacyPay is a privacy-preserving SaaS subscription infrastructure built on the **Midnight Network**. It combines privacy-preserving recurring authorization and state verification on Midnight with familiar, seamless fiat payment execution off-chain.

---

## Lunar Progression Roadmap

| Level | Milestone Name | Status | Objective |
| :--- | :--- | :--- | :--- |
| **Level 1** | **New Moon** | **Completed** | Setup, core Compact smart contract, state verification tests, and interactive prototype. |
| **Level 2** | **Waxing Crescent** | **Completed** | Midnight Lace wallet integration, DApp connector, and full customer authorization flow. |
| **Level 3** | **First Quarter** | **Completed** | Production-grade dApp, multi-role Customer & Merchant portals, 10-state Subscription Engine FSM, REST API layer. |
| **The Turn**| **Idea Submission**| *Pending* | Formal competition submission & mentor checkpoint. |
| **Level 4** | **Waxing Gibbous** | *Pending* | Preprod MVP launch with payment gateway webhook integration. |
| **Level 5** | **Full Moon** | *Pending* | User validation (50+ Preprod users) & feedback loop. |
| **Level 6** | **Supermoon** | *Pending* | Midnight Mainnet launch & production release. |

---

## Core Value Proposition

1. **True Privacy by Design**: Zero subscriber personal or payment information is stored on-chain. Subscription authorizations are recorded using zero-knowledge cryptographic commitments (`H(secret, planId)`).
2. **Multi-Role Portals**: 
   - **Customer Hub**: Manage active subscriptions, visual state machine progression, non-custodial cancellation, and fiat invoice history.
   - **Merchant Suite**: SaaS product catalog builder, dynamic pricing plans, real-time subscriber commitment tracking, and recurring billing cycle engine.
3. **Deterministic State Machine**: Complete 10-state lifecycle engine coordinating off-chain fiat settlement with on-chain Compact circuits.

---

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/Vedlogged/privacypay.git
cd privacypay

# Install all workspace dependencies
npm install
```

### Running Tests
```bash
# Run all contract and state machine engine tests
npm test
```

### Running Web Application
```bash
# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation
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
