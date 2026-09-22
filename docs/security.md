# PrivacyPay Security Architecture & Threat Model

## 1. Security Principles
1. **Zero-Knowledge Privacy by Default**: Zero customer PII or raw financial credentials touch the Midnight ledger.
2. **Non-Custodial Authorization**: Only the subscriber possessing the private secret preimage $S$ can cancel or modify their subscription.
3. **Replay Protection**: Ledger sequence counter `sequenceNumber` strictly incremented upon every state transition.
4. **Separation of Concerns**: Traditional credit card processing is isolated in PCI-DSS compliant vaults off-chain.

---

## 2. Threat Analysis & Mitigations

| Threat Vector | Potential Impact | Implemented Mitigation | Verification Method |
| :--- | :--- | :--- | :--- |
| **Unauthorized Cancellation** | Attacker attempts to cancel a victim's active subscription. | Compact circuit requires proof of secret preimage $H(S \parallel P) == \text{commitment}$. | Verified in `subscription.test.ts` (Test #8). |
| **Replay Attack** | Malicious re-submission of previous proof to alter state. | Sequence number monotonic increment + state validation guards. | Verified in `subscription-engine.test.ts`. |
| **Data Leakage via Public State** | On-chain observer tracking user identity or spend. | Only one-way hash commitments disclosed to ledger; secrets remain in client memory. | Verified in `subscription.test.ts` (Test #3). |
| **Duplicate Webhook / Billing Execution** | Double charging or duplicate state progression. | Idempotent cycle progression in `SubscriptionEngine`. | Verified in API cycle endpoint. |
| **Mismatched Plan Exploit** | Attacker tries to authorize a higher-tier plan with lower-tier parameters. | On-chain assertion `assert(planId == activePlanId)`. | Verified in `subscription.test.ts` (Test #5). |
