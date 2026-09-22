# Level 1 Verifiable Test Execution Log

- **Project**: PrivacyPay
- **Milestone**: Level 1 (New Moon)
- **Date**: 2026-09-23
- **Test Framework**: Vitest v1.6.1 / Node.js v25.2.1
- **Target Contract**: `subscription.compact` via `SubscriptionContractSimulator`

---

## Test Execution Command

```bash
npm test
```

## Raw Test Output

```
> privacy-pay@0.1.0 test
> npm run test --workspace=contract

> @privacy-pay/contract@0.1.0 test
> vitest run

 RUN  v1.6.1 E:/project/contract

 ✓ tests/subscription.test.ts (8 tests) 4ms
   ✓ 1. should initialize contract in INACTIVE state with specified plan ID
   ✓ 2. should allow subscriber to authorize subscription with private witness secret
   ✓ 3. should generate deterministic commitment without revealing subscriber secret
   ✓ 4. should reject authorization if subscription is already ACTIVE
   ✓ 5. should reject authorization for mismatched plan ID
   ✓ 6. should allow commitment owner to cancel active subscription
   ✓ 7. should reject cancellation if caller secret does not match commitment preimage
   ✓ 8. should allow re-authorization after cancellation

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  00:55:21
   Duration  337ms (transform 49ms, setup 0ms, collect 53ms, tests 4ms, environment 0ms, prepare 90ms)
```

---

## Production Build Verification

```bash
npm run build
```

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
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    138 kB          225 kB
└ ○ /_not-found                          873 B          87.9 kB
+ First Load JS shared by all            87 kB
```
