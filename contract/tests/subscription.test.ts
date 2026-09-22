import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionContractSimulator, SubscriptionState } from '../src/simulator';

describe('PrivacyPay Compact Subscription Contract Test Suite', () => {
    const PLAN_ID = 101n;
    let contract: SubscriptionContractSimulator;
    let subscriberSecret: string;
    let witness: { getSubscriberSecret: () => string };

    beforeEach(() => {
        contract = new SubscriptionContractSimulator(PLAN_ID);
        subscriberSecret = SubscriptionContractSimulator.generateSecret();
        witness = {
            getSubscriberSecret: () => subscriberSecret
        };
    });

    it('1. should initialize contract in INACTIVE state with specified plan ID', () => {
        const state = contract.getLedgerState();
        expect(state.state).toBe(SubscriptionState.INACTIVE);
        expect(state.activePlanId).toBe(PLAN_ID);
        expect(state.subscriberCommitment).toBe('0x' + '0'.repeat(64));
        expect(state.sequenceNumber).toBe(1n);
    });

    it('2. should allow subscriber to authorize subscription with private witness secret', () => {
        const result = contract.authorize(PLAN_ID, witness);
        const expectedCommitment = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);

        expect(result.commitment).toBe(expectedCommitment);
        expect(result.state).toBe(SubscriptionState.ACTIVE);
        expect(result.sequenceNumber).toBe(2n);

        const ledger = contract.getLedgerState();
        expect(ledger.state).toBe(SubscriptionState.ACTIVE);
        expect(ledger.subscriberCommitment).toBe(expectedCommitment);
        expect(ledger.sequenceNumber).toBe(2n);
    });

    it('3. should generate deterministic commitment without revealing subscriber secret', () => {
        const commitment1 = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);
        const commitment2 = SubscriptionContractSimulator.computeCommitment(subscriberSecret, PLAN_ID);

        expect(commitment1).toBe(commitment2);
        expect(commitment1).not.toContain(subscriberSecret.slice(2)); // Secret preimage remains confidential
        expect(commitment1.startsWith('0x')).toBe(true);
        expect(commitment1.length).toBe(66); // 0x + 64 hex chars
    });

    it('4. should reject authorization if subscription is already ACTIVE', () => {
        contract.authorize(PLAN_ID, witness);

        const anotherSecret = SubscriptionContractSimulator.generateSecret();
        const anotherWitness = { getSubscriberSecret: () => anotherSecret };

        expect(() => {
            contract.authorize(PLAN_ID, anotherWitness);
        }).toThrow('Subscription is already active');
    });

    it('5. should reject authorization for mismatched plan ID', () => {
        const wrongPlanId = 999n;
        expect(() => {
            contract.authorize(wrongPlanId, witness);
        }).toThrow(`Invalid plan ID: expected ${PLAN_ID}, got ${wrongPlanId}`);
    });

    it('6. should allow commitment owner to cancel active subscription', () => {
        contract.authorize(PLAN_ID, witness);
        expect(contract.getLedgerState().state).toBe(SubscriptionState.ACTIVE);

        const cancelResult = contract.cancel(witness);
        expect(cancelResult.state).toBe(SubscriptionState.CANCELLED);
        expect(cancelResult.sequenceNumber).toBe(3n);

        const ledger = contract.getLedgerState();
        expect(ledger.state).toBe(SubscriptionState.CANCELLED);
    });

    it('7. should reject cancellation if caller secret does not match commitment preimage', () => {
        contract.authorize(PLAN_ID, witness);

        const attackerSecret = SubscriptionContractSimulator.generateSecret();
        const attackerWitness = { getSubscriberSecret: () => attackerSecret };

        expect(() => {
            contract.cancel(attackerWitness);
        }).toThrow('Caller does not own subscription commitment');

        // State remains ACTIVE
        expect(contract.getLedgerState().state).toBe(SubscriptionState.ACTIVE);
    });

    it('8. should allow re-authorization after cancellation', () => {
        contract.authorize(PLAN_ID, witness);
        contract.cancel(witness);
        expect(contract.getLedgerState().state).toBe(SubscriptionState.CANCELLED);

        const newSecret = SubscriptionContractSimulator.generateSecret();
        const newWitness = { getSubscriberSecret: () => newSecret };

        const reauthResult = contract.authorize(PLAN_ID, newWitness);
        const expectedNewCommitment = SubscriptionContractSimulator.computeCommitment(newSecret, PLAN_ID);

        expect(reauthResult.state).toBe(SubscriptionState.ACTIVE);
        expect(reauthResult.commitment).toBe(expectedNewCommitment);
        expect(contract.getLedgerState().sequenceNumber).toBe(4n);
    });
});
