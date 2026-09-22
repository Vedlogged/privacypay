# Level 3 Verifiable Test Results & Build Log

- **Milestone**: Level 3 (First Quarter)
- **Framework**: Vitest v1.6.1 / Node.js v25.2.1
- **Target**: Contract Circuits & Subscription Engine State Machine

---

## Automated Test Results

```
> privacy-pay@0.1.0 test
> npm run test --workspace=contract

> @privacy-pay/contract@0.1.0 test
> vitest run

 RUN  v1.6.1 E:/project/contract

 ✓ tests/subscription.test.ts (8 tests) 4ms
   ✓ 1. should initialize contract in CREATED state with specified plan and merchant
   ✓ 2. should allow subscriber to authorize subscription with private witness secret
   ✓ 3. should generate deterministic commitment without revealing subscriber secret
   ✓ 4. should reject authorization if subscription is not in CREATED or CANCELLED state
   ✓ 5. should reject authorization for mismatched plan ID
   ✓ 6. should transition AUTHORIZED -> ACTIVE -> BILLING_DUE -> PROCESSING -> PAID -> NEXT_CYCLE
   ✓ 7. should allow commitment owner to cancel active subscription
   ✓ 8. should reject cancellation if caller secret does not match commitment preimage

 ✓ tests/subscription-engine.test.ts (7 tests) 4ms
   ✓ 1. should create subscription in CREATED state with initial ledger state
   ✓ 2. should transition CREATED -> AUTHORIZED on-chain with witness secret
   ✓ 3. should transition AUTHORIZED -> ACTIVE upon initial fiat checkout confirmation
   ✓ 4. should process complete recurring billing cycle through all FSM states
   ✓ 5. should transition to PAST_DUE when recurring fiat payment fails
   ✓ 6. should allow subscriber to cancel subscription with valid secret proof
   ✓ 7. should reject cancellation attempt if unauthorized caller secret is provided

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Start at  01:07:25
   Duration  354ms (transform 89ms, setup 0ms, collect 123ms, tests 8ms, environment 0ms, prepare 174ms)
```

---

## Production Build Output

```
> privacy-pay@0.1.0 build
> npm run build --workspace=frontend

> @privacy-pay/frontend@0.1.0 build
> next build

  ▲ Next.js 14.2.3

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (9/9)
   Finalizing page optimization ...

Route (app)                              Size     First Load JS
┌ ○ /                                    144 kB          231 kB
├ ○ /_not-found                          873 B          87.9 kB
├ ƒ /api/billing/cycle                   0 B                0 B
├ ○ /api/health                          0 B                0 B
├ ƒ /api/plans                           0 B                0 B
├ ƒ /api/products                        0 B                0 B
├ ƒ /api/subscriptions                   0 B                0 B
└ ƒ /api/subscriptions/[id]              0 B                0 B
```
