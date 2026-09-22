# PrivacyPay Privacy Model & Data Classification

## 1. Privacy Philosophy
Privacy is an architectural foundation, not a marketing claim. Traditional SaaS subscriptions leak customer transaction history, spending habits, identities, and card numbers to multiple third parties. PrivacyPay achieves **privacy-preserving recurring authorization** by separating **authorization verification** from **identity disclosure**.

---

## 2. Comprehensive Data Classification

Every data point in the PrivacyPay ecosystem is classified according to its storage location, visibility, and retention rules:

| Data Element | Storage Location | Accessibility | Classification | Privacy Rationale & Minimization |
| :--- | :--- | :--- | :--- | :--- |
| **Subscriber Secret** | Customer Client (Local Memory / Encrypted Storage) | Customer Only | `PRIVATE` | Used as off-chain witness input. Never leaves the client in plaintext; never recorded on-chain. |
| **Subscriber Commitment** | Midnight Public Ledger | Public Verifiable | `DERIVED / COMMITMENT` | Cryptographic hash `H(subscriber_secret, plan_id)`. Verifies authorization ownership without revealing user identity or address. |
| **Active Plan ID** | Midnight Public Ledger & Merchant DB | Public | `PUBLIC` | Numerical or hash identifier for the subscription plan tier. |
| **Subscription State** | Midnight Public Ledger | Public | `PUBLIC` | Current status (`INACTIVE`, `ACTIVE`, `CANCELLED`). Necessary for service provisioning verification. |
| **Sequence Counter** | Midnight Public Ledger | Public | `PUBLIC` | Prevents replay attacks and tracks lifecycle versioning. |
| **Credit Card / Banking Details** | Payment Provider (Stripe Vault) | Payment Provider Only | `OFF-CHAIN SENSITIVE` | Regulated by PCI-DSS. Strictly isolated from the Midnight blockchain. |
| **Merchant Business Metadata** | Off-chain API / DB | Public / Merchant | `OFF-CHAIN PUBLIC` | Plan descriptions, product images, marketing copy. |

---

## 3. Cryptographic Commitment Scheme

To ensure zero-knowledge authorization:

1. **Secret Generation**:
   The customer client generates a secure random 256-bit entropy value:
   $$S \in \{0, 1\}^{256}$$

2. **Commitment Computation**:
   Given an active plan identifier $P$, the commitment $C$ is computed inside the Compact circuit:
   $$C = \text{Hash}(S \parallel P)$$

3. **Selective Disclosure**:
   The circuit calls `disclose(C)` to publish only the cryptographic commitment $C$ to the public ledger variable `subscriberCommitment`. The secret $S$ remains private to the client witness.

4. **Authorized Cancellation**:
   To cancel the subscription, the customer provides $S$ via a witness. The contract verifies:
   $$\text{Hash}(S \parallel P) \stackrel{?}{=} \text{subscriberCommitment}$$
   If valid, the contract marks the subscription `CANCELLED`. A third party without knowledge of $S$ cannot cancel or tamper with the subscription.

---

## 4. Threat Model & Mitigations

| Threat | Risk | Mitigation |
| :--- | :--- | :--- |
| **On-Chain Identity Tracking** | Competitors or observers linking SaaS usage to user wallet addresses. | Subscriptions are identified solely by one-way cryptographic commitments, decoupling the user's public key from the subscription record. |
| **Replay Attacks** | Re-submitting an old authorization proof to alter contract state. | Sequence counter `sequenceNumber` incremented on every state transition. |
| **Unauthorized Cancellation** | Malicious actor attempting to cancel a user's subscription. | Proof of secret preimage $S$ required in the `cancel()` circuit. |
| **Financial Credential Leakage** | Leaking credit card or bank details on-chain. | Strict separation: ZERO financial credentials touch Midnight contracts. |
