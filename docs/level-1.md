# Level 1 — New Moon Report: Setup & First Contract

## 1. Milestone Overview
- **Milestone**: Level 1 (New Moon)
- **Project**: PrivacyPay
- **Objective**: Establish the Midnight project environment, implement the core Compact subscription contract, develop verifiable state transition test suites, and deliver an interactive prototype demonstrating the privacy-preserving subscription flow.

---

## 2. Key Deliverables & Implementation Status

| Component | Target Description | Status |
| :--- | :--- | :--- |
| **Development Environment** | Monorepo setup with npm workspaces (`contract`, `frontend`). | `COMPLETED` |
| **Compact Smart Contract** | `subscription.compact` implementing `SubscriptionState`, `subscriberCommitment`, `witness`, `authorize()`, `cancel()`. | `COMPLETED` |
| **Contract State Test Suite** | TypeScript test harness verifying state transitions, authorization, secret verification, and unauthorized rejection. | `COMPLETED` |
| **Interactive Frontend** | Next.js app with dark glassmorphic UI, Lace wallet detection, and live contract simulation console. | `COMPLETED` |
| **CI/CD Configuration** | GitHub Actions workflow for automated typechecking, test execution, and frontend build. | `COMPLETED` |
| **Documentation** | Architecture specification, Privacy Model, and Level 1 evidence. | `COMPLETED` |

---

## 3. Contract Architecture (`subscription.compact`)

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

---

## 4. Verification & Evidence
- Contract tests execute deterministically against the simulated state transition engine.
- Zero-knowledge commitment properties verified through cryptographic hash assertions.
- Frontend builds cleanly in strict TypeScript mode with responsive, accessible styling.
- Evidence files archived under `/docs/competition/level-1/`.
