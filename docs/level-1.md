# Level 1 — New Moon Report: Setup, First Contract & Compilation

## 1. Milestone Overview
- **Milestone**: Level 1 (New Moon)
- **Project**: PrivacyPay
- **Objective**: Establish the Midnight project environment, implement the core Compact subscription contract, compile contract circuits to `managed/` artifacts, develop verifiable state transition test suites, and deliver an interactive prototype demonstrating the privacy-preserving subscription flow.
- **Contract Address (Preprod)**: `02004a8b79f2dc6138de369c9b10499e0df238aa14d59bc44109720526e82b71`
- **Live Demo**: [https://privacypay-midnight.vercel.app](https://privacypay-midnight.vercel.app)

---

## 2. Key Deliverables & Implementation Status

| Component | Target Description | Status | Location |
| :--- | :--- | :--- | :--- |
| **Development Environment** | Monorepo setup with npm workspaces (`contract`, `frontend`). | `COMPLETED` | Root `package.json` |
| **Compact Smart Contract** | `subscription.compact` implementing `SubscriptionState`, `subscriberCommitment`, `witness`, `authorize()`, `cancel()`. | `COMPLETED` | `contract/src/subscription.compact` |
| **Managed Compilation** | Compiled Compact output containing `.wasm`, `.zkir`, and TypeScript runtime bindings. | `COMPLETED` | `managed/subscription/` & `contract/src/managed/` |
| **Contract State Test Suite** | TypeScript test harness verifying state transitions, authorization, secret verification, and unauthorized rejection. | `COMPLETED` | `contract/tests/subscription.test.ts` |
| **Interactive Frontend** | Next.js app with dark glassmorphic UI, Lace wallet detection, and live contract simulation console. | `COMPLETED` | `frontend/` |
| **CI/CD Configuration** | GitHub Actions workflow for automated compilation, typechecking, test execution, and frontend build. | `COMPLETED` | `.github/workflows/level-1-ci.yml` |
| **Documentation & Proposal** | Architecture specification, Privacy Model, and Level 1 evidence. | `COMPLETED` | `README.md`, `PROPOSAL.md`, `docs/` |

---

## 3. Contract Architecture & Circuit Output (`subscription.compact`)

The Level 1 Compact contract manages subscription lifecycle transitions with zero-knowledge commitment binding:

```compact
pragma language_version >= 0.20;

import CompactStandardLibrary;

export enum SubscriptionState {
    INACTIVE,
    ACTIVE,
    CANCELLED
}

export ledger state: SubscriptionState;
export ledger activePlanId: Field;
export ledger subscriberCommitment: Bytes<32>;
export ledger sequenceNumber: Counter;

witness getSubscriberSecret(): Bytes<32>;

constructor(initialPlanId: Field) {
    state = SubscriptionState.INACTIVE;
    activePlanId = initialPlanId;
    sequenceNumber.increment(1);
}

export circuit authorize(planId: Field): Bytes<32> {
    assert(state == SubscriptionState.INACTIVE || state == SubscriptionState.CANCELLED, "Subscription is already active");
    assert(planId == activePlanId, "Invalid plan ID");

    const secret = getSubscriberSecret();
    const commitment = disclose(hash(secret, planId));

    subscriberCommitment = commitment;
    state = SubscriptionState.ACTIVE;
    sequenceNumber.increment(1);

    return commitment;
}

export circuit cancel(): void {
    assert(state == SubscriptionState.ACTIVE, "Subscription is not active");

    const secret = getSubscriberSecret();
    const expectedCommitment = disclose(hash(secret, activePlanId));
    assert(subscriberCommitment == expectedCommitment, "Caller does not own subscription commitment");

    state = SubscriptionState.CANCELLED;
    sequenceNumber.increment(1);
}
```

### Compiled Managed Output Structure:
- `managed/subscription/contract/index.d.ts` & `index.cjs` & `index.mjs`: Contract runtime bindings and state type definitions.
- `managed/subscription/witness/index.d.ts` & `index.cjs`: Witness context and preimage providers.
- `managed/subscription/zkir/authorize.zkir`, `cancel.zkir`, etc.: ZK Intermediate Representation circuit files.
- `managed/subscription/subscription.wasm`: WebAssembly compiled circuit artifact.

---

## 4. Verification & Evidence
- Contract tests execute deterministically against the state transition engine (8/8 passing).
- Zero-knowledge commitment properties verified through cryptographic hash assertions.
- Compact compilation output committed under `managed/subscription/`.
- Frontend builds cleanly in strict TypeScript mode (`npm run build`).
- Evidence files archived under `/docs/competition/level-1/`.
