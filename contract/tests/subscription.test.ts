import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionContractSimulator, SubscriptionState } from '../src/simulator';

describe('PrivacyPay Compact Subscription Contract Test Suite (Level 2 & 3)', () => {
    const PLAN_ID = 101n;
    const MERCHANT_ID = '0x' + '2'.repeat(64);
    let contract: SubscriptionContractSimulator;
    let subscriberSecret: string;
    let witness: { getSubscriberSecret: () => string };

    beforeEach(() => {
        contract = new SubscriptionContractSimulator(PLAN_ID, MERCHANT_ID);
        subscriberSecret = SubscriptionContractSimulator.generateSecret();
        witness = {
            getSubscriberSecret: () => subscriberSecret
        };
    });

    it('1. should initialize contract in CREATED state with specified plan and merchant', () => {
        const state = contract.getLedgerState();
        expect(state.state).toBe(SubscriptionState.CREATED);
        expect(state.activePlanId).toBe(PLAN_ID);
        expect(state.merchantAddress).toBe(MERCHANT_ID);
        expect(state.subscriberCommitment).toBe('0x' + '0'.repeat(64));
        expect(state.sequenceNumber).toBe(1n);
        expect(state.cycleCount).toBe(0n);
    });

    it('2. should allow subscriber to authorize subscription with private witness secret', () => {
        const result = contract.authorize(PLAN_ID, witness);
        const expectedCommitment = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);

        expect(result.commitment).toBe(expectedCommitment);
        expect(result.state).toBe(SubscriptionState.AUTHORIZED);
        expect(result.sequenceNumber).toBe(2n);

        const ledger = contract.getLedgerState();
        expect(ledger.state).toBe(SubscriptionState.AUTHORIZED);
        expect(ledger.subscriberCommitment).toBe(expectedCommitment);
    });

    it('3. should generate deterministic commitment without revealing subscriber secret', () => {
        const commitment1 = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);
        const commitment2 = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);

        expect(commitment1).toBe(commitment2);
        expect(commitment1).not.toContain(subscriberSecret.slice(2)); // Secret preimage remains confidential
        expect(commitment1.startsWith('0x')).toBe(true);
        expect(commitment1.length).toBe(66);
    });

    it('4. should reject authorization if subscription is not in CREATED or CANCELLED state', () => {
        contract.authorize(PLAN_ID, witness);
        contract.activate();

        const anotherSecret = SubscriptionContractSimulator.generateSecret();
        const anotherWitness = { getSubscriberSecret: () => anotherSecret };

        expect(() => {
            contract.authorize(PLAN_ID, anotherWitness);
        }).toThrow('Subscription is already in ACTIVE state');
    });

    it('5. should reject authorization for mismatched plan ID', () => {
        const wrongPlanId = 999n;
        expect(() => {
            contract.authorize(wrongPlanId, witness);
        }).toThrow(`Invalid plan ID: expected ${PLAN_ID}, got ${wrongPlanId}`);
    });

    it('6. should transition AUTHORIZED -> ACTIVE -> BILLING_DUE -> PROCESSING -> PAID -> NEXT_CYCLE', () => {
        contract.authorize(PLAN_ID, witness);
        
        // Activate
        const actResult = contract.activate();
        expect(actResult.state).toBe(SubscriptionState.ACTIVE);
        expect(actResult.cycleCount).toBe(1n);

        // Mark Billing Due
        const dueResult = contract.markBillingDue();
        expect(dueResult.state).toBe(SubscriptionState.BILLING_DUE);

        // Start Processing
        const procResult = contract.startProcessing();
        expect(procResult.state).toBe(SubscriptionState.PROCESSING);

        // Settle Payment
        const settleResult = contract.settlePayment();
        expect(settleResult.state).toBe(SubscriptionState.PAID);

        // Advance Cycle
        const cycleResult = contract.advanceCycle();
        expect(cycleResult.state).toBe(SubscriptionState.NEXT_CYCLE);

        // Re-activate for cycle 2
        const act2 = contract.activate();
        expect(act2.state).toBe(SubscriptionState.ACTIVE);
        expect(act2.cycleCount).toBe(2n);
    });

    it('7. should allow commitment owner to cancel active subscription', () => {
        contract.authorize(PLAN_ID, witness);
        contract.activate();

        const cancelResult = contract.cancel(witness);
        expect(cancelResult.state).toBe(SubscriptionState.CANCELLED);

        const ledger = contract.getLedgerState();
        expect(ledger.state).toBe(SubscriptionState.CANCELLED);
    });

    it('8. should reject cancellation if caller secret does not match commitment preimage', () => {
        contract.authorize(PLAN_ID, witness);
        contract.activate();

        const attackerSecret = SubscriptionContractSimulator.generateSecret();
        const attackerWitness = { getSubscriberSecret: () => attackerSecret };

        expect(() => {
            contract.cancel(attackerWitness);
        }).toThrow('Caller does not own subscription commitment');

        expect(contract.getLedgerState().state).toBe(SubscriptionState.ACTIVE);
    });
});
