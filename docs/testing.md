# PrivacyPay Comprehensive Testing Strategy

## 1. Testing Pyramid

```
                /  End-to-End Tests  \       (Multi-Role Lifecycle Flow)
               /----------------------\
              /   API Route Tests      \     (REST Validation & Errors)
             /--------------------------\
            /  State Machine Engine Tests \  (SubscriptionEngine FSM)
           /-------------------------------\
          /   Compact Contract Unit Tests   \ (Circuits & Witnesses)
```

---

## 2. Running Automated Tests

```bash
# Run all unit and state machine integration tests
npm test

# Run tests in watch mode
npm run test:watch --workspace=contract
```

## 3. Test Coverage Matrix
- **`subscription.test.ts`**:
  - `SubscriptionState` initialization
  - `authorize(planId)` circuit assertions
  - Witness entropy & commitment generation
  - Non-custodial cancellation & preimage verification
  - Unauthorized cancellation rejection
  - Multi-cycle progression
- **`subscription-engine.test.ts`**:
  - `CREATED` -> `AUTHORIZED` -> `ACTIVE` transitions
  - Recurring billing cycle progression through `BILLING_DUE` -> `PROCESSING` -> `PAID` -> `NEXT_CYCLE`
  - Payment failure transitions to `PAST_DUE`
  - Re-authorization lifecycle
