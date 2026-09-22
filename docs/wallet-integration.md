# Midnight Lace Wallet Integration Guide

## 1. Overview
PrivacyPay utilizes the official **Midnight Lace Wallet** extension to authenticate users, manage identity keys, and sign transactions destined for the Midnight blockchain.

---

## 2. DApp Connector Handshake

The integration follows the standard `@midnight-ntwrk/dapp-connector-api` protocol:

```typescript
// 1. Detection
if (typeof window !== 'undefined' && window.midnight?.mnLace) {
  const mnLace = window.midnight.mnLace;
  
  // 2. Query enabled status
  const isEnabled = await mnLace.isEnabled();
  
  // 3. Request user connection authorization
  const api = await mnLace.enable();
  
  // 4. Retrieve unshielded account address
  const address = await api.getUnshieldedAddress();
}
```

---

## 3. Network Configuration

| Property | Target Environment |
| :--- | :--- |
| **Network Name** | Midnight Preprod Testnet |
| **Consensus / Prover** | Halo2 Zero-Knowledge Proof Server |
| **Base Currency / Gas** | DUST (Transaction Fees) |
| **Shielded Token** | tNIGHT (Testnet Night Tokens) |

---

## 4. Privacy Boundaries in Wallet Interaction
- **Unshielded Address**: Used exclusively for gas/fee balancing and initial connection.
- **Subscriber Identity**: Subscription authorizations **do NOT** link the user's public address to the SaaS plan. Subscriptions are anchored solely by one-way cryptographic commitments generated locally in client memory.
