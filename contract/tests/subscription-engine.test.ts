import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionEngine } from '../src/subscription-engine';
import { SubscriptionContractSimulator, SubscriptionState } from '../src/simulator';

describe('Production-Grade Subscription Engine Lifecycle & FSM Test Suite', () => {
    let engine: SubscriptionEngine;
    const PLAN_ID = 202n;
    const SUB_ID = 'sub_live_001';
    let secret: string;

    beforeEach(() => {
        engine = new SubscriptionEngine();
        secret = SubscriptionContractSimulator.generateSecret();
    });

    it('1. should create subscription in CREATED state with initial ledger state', () => {
        const sub = engine.createSubscription(SUB_ID, PLAN_ID);
        expect(sub.id).toBe(SUB_ID);
        expect(sub.contract.getLedgerState().state).toBe(SubscriptionState.CREATED);
        expect(sub.contract.getLedgerState().cycleCount).toBe(0n);
        expect(sub.invoices).toHaveLength(0);
    });

    it('2. should transition CREATED -> AUTHORIZED on-chain with witness secret', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        const auth = engine.authorize(SUB_ID, secret);

        expect(auth.state).toBe(SubscriptionState.AUTHORIZED);
        expect(auth.commitment.startsWith('0x')).toBe(true);

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.contract.getLedgerState().state).toBe(SubscriptionState.AUTHORIZED);
    });

    it('3. should transition AUTHORIZED -> ACTIVE upon initial fiat checkout confirmation', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        engine.authorize(SUB_ID, secret);

        const payment = engine.confirmInitialPayment(SUB_ID, 'inv_001', 2900);
        expect(payment.state).toBe(SubscriptionState.ACTIVE);

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.contract.getLedgerState().cycleCount).toBe(1n);
        expect(sub.invoices).toHaveLength(1);
        expect(sub.invoices[0].status).toBe('SUCCEEDED');
    });

    it('4. should process complete recurring billing cycle through all FSM states', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        engine.authorize(SUB_ID, secret);
        engine.confirmInitialPayment(SUB_ID, 'inv_001', 2900);

        // Process recurring cycle 2
        const cycleResult = engine.processRecurringCycle(SUB_ID, 'inv_002', 2900, 'SUCCESS');
        expect(cycleResult.state).toBe(SubscriptionState.ACTIVE);
        expect(cycleResult.cycle).toBe(2);

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.invoices).toHaveLength(2);
        expect(sub.invoices[1].cycle).toBe(2);
        expect(sub.invoices[1].status).toBe('SUCCEEDED');
    });

    it('5. should transition to PAST_DUE when recurring fiat payment fails', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        engine.authorize(SUB_ID, secret);
        engine.confirmInitialPayment(SUB_ID, 'inv_001', 2900);

        // Process failing recurring cycle
        const failResult = engine.processRecurringCycle(SUB_ID, 'inv_002_fail', 2900, 'FAILURE');
        expect(failResult.state).toBe(SubscriptionState.PAST_DUE);

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.contract.getLedgerState().state).toBe(SubscriptionState.PAST_DUE);
        expect(sub.invoices[1].status).toBe('FAILED');
    });

    it('6. should allow subscriber to cancel subscription with valid secret proof', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        engine.authorize(SUB_ID, secret);
        engine.confirmInitialPayment(SUB_ID, 'inv_001', 2900);

        const cancelResult = engine.cancel(SUB_ID, secret);
        expect(cancelResult.state).toBe(SubscriptionState.CANCELLED);

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.contract.getLedgerState().state).toBe(SubscriptionState.CANCELLED);
    });

    it('7. should reject cancellation attempt if unauthorized caller secret is provided', () => {
        engine.createSubscription(SUB_ID, PLAN_ID);
        engine.authorize(SUB_ID, secret);
        engine.confirmInitialPayment(SUB_ID, 'inv_001', 2900);

        const attackerSecret = SubscriptionContractSimulator.generateSecret();
        expect(() => {
            engine.cancel(SUB_ID, attackerSecret);
        }).toThrow('Caller does not own subscription commitment');

        const sub = engine.getSubscription(SUB_ID);
        expect(sub.contract.getLedgerState().state).toBe(SubscriptionState.ACTIVE);
    });
});
