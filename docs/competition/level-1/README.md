# Level 1 Competition Evidence: New Moon

## Milestone Metadata
- **Project**: PrivacyPay
- **Tagline**: *"Privacy-first SaaS subscriptions with fiat-friendly payments."*
- **Competition**: New Moon to Full: Monthly Moonshots on Midnight
- **Milestone**: Level 1 — New Moon
- **Date**: 2026-09-23
- **Version**: `v0.1.0-level1`
- **Preprod Contract Address**: `a53b489179903e1b40a8078b59649af9b113a4d9d7da0d8f293e97314b59b68d`
- **Live Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)

---

## Evidence Checklist

| Item | Evidence Description | Location |
| :--- | :--- | :--- |
| **1. Repository & Workspace** | Monorepo structure with npm workspaces (`contract`, `frontend`). | Root `package.json` |
| **2. Compact Contract** | `subscription.compact` implementing privacy commitment scheme. | `contract/src/subscription.compact` |
| **3. Compiled Managed Outputs** | `.wasm` circuit bytecode, `.zkir` intermediate files, TypeScript type bindings. | `managed/subscription/` |
| **4. Automated Test Suite** | 8 comprehensive test cases verifying lifecycle transitions and security. | `contract/tests/subscription.test.ts` |
| **5. Test Execution Results** | Verifiable test execution logs (8/8 passed). | `docs/competition/level-1/test-results.md` |
| **6. Web Application** | Next.js interactive interface with Lace wallet detection & state inspector. | `frontend/` |
| **7. CI Pipeline** | Automated GitHub Actions workflow for compile, test, and build. | `.github/workflows/level-1-ci.yml` |
| **8. Architecture & Privacy Docs** | Formal technical architecture and data classification specifications. | `docs/architecture.md`, `docs/privacy-model.md`, `PROPOSAL.md` |

---

## Level 1 Completion Summary

```
LEVEL: Level 1 (New Moon)
STATUS: COMPLETED
VERSION: v0.1.0-level1
CONTRACT ADDRESS: a53b489179903e1b40a8078b59649af9b113a4d9d7da0d8f293e97314b59b68d
COMPILATION: managed/subscription/ (subscription.wasm, zkir/, contract/index.d.ts)
FEATURES:
  - Compact Subscription State Machine (INACTIVE, ACTIVE, CANCELLED)
  - Zero-Knowledge Hash Commitment Binding (H(secret, planId))
  - Witness Secret Injection & Preimage Validation
  - Lace Wallet Extension Detection
  - Live Ledger State Inspector
TESTS: 8/8 Passed (100% Coverage of contract transitions)
SECURITY: Zero on-chain personal data, cryptographic commitment access control
NEXT LEVEL: Level 2 — Waxing Crescent (Full Wallet & Preprod Integration)
```
