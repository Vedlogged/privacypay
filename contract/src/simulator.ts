import { createHash, randomBytes } from 'crypto';

export enum SubscriptionState {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED'
}

export interface ContractLedgerState {
    state: SubscriptionState;
    activePlanId: bigint;
    subscriberCommitment: string;
    sequenceNumber: bigint;
}

export interface SubscriberWitness {
    getSubscriberSecret: () => string; // 32-byte hex string (64 characters)
}

/**
 * Compact Subscription Contract Simulator
 * Mirrors the exact zero-knowledge logic, circuit constraints, and state transitions
 * defined in subscription.compact for the Midnight Network.
 */
export class SubscriptionContractSimulator {
    private state: SubscriptionState;
    private activePlanId: bigint;
    private subscriberCommitment: string;
    private sequenceNumber: bigint;

    constructor(initialPlanId: bigint) {
        if (initialPlanId <= 0n) {
            throw new Error('Initial plan ID must be a positive integer');
        }
        this.state = SubscriptionState.INACTIVE;
        this.activePlanId = initialPlanId;
        this.subscriberCommitment = '0x' + '0'.repeat(64);
        this.sequenceNumber = 1n;
    }

    /**
     * Computes the cryptographic commitment H(secret, planId)
     * Mirrors the Compact hash(secret, planId) circuit function.
     */
    public static computeCommitment(secretHex: string, planId: bigint): string {
        const cleanSecret = secretHex.startsWith('0x') ? secretHex.slice(2) : secretHex;
        if (cleanSecret.length !== 64) {
            throw new Error('Subscriber secret must be 32 bytes (64 hex characters)');
        }
        const planBuffer = Buffer.alloc(8);
        planBuffer.writeBigUInt64BE(planId);
        
        const secretBuffer = Buffer.from(cleanSecret, 'hex');
        const hasher = createHash('sha256');
        hasher.update(secretBuffer);
        hasher.update(planBuffer);
        return '0x' + hasher.digest('hex');
    }

    /**
     * Generates a secure client-side subscriber secret (off-chain witness input)
     */
    public static generateSecret(): string {
        return '0x' + randomBytes(32).toString('hex');
    }

    /**
     * Executes the `authorize(planId)` circuit
     */
    public authorize(planId: bigint, witness: SubscriberWitness): { commitment: string; sequenceNumber: bigint; state: SubscriptionState } {
        // Circuit Assertions
        if (this.state === SubscriptionState.ACTIVE) {
            throw new Error('Subscription is already active');
        }
        if (planId !== this.activePlanId) {
            throw new Error(`Invalid plan ID: expected ${this.activePlanId}, got ${planId}`);
        }

        // Witness invocation
        const secret = witness.getSubscriberSecret();
        const commitment = SubscriptionContractSimulator.computeCommitment(secret, planId);

        // State mutation
        this.subscriberCommitment = commitment;
        this.state = SubscriptionState.ACTIVE;
        this.sequenceNumber += 1n;

        return {
            commitment: this.subscriberCommitment,
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Executes the `cancel()` circuit
     */
    public cancel(witness: SubscriberWitness): { sequenceNumber: bigint; state: SubscriptionState } {
        // Circuit Assertions
        if (this.state !== SubscriptionState.ACTIVE) {
            throw new Error('Subscription is not active');
        }

        // Witness invocation & Preimage validation
        const secret = witness.getSubscriberSecret();
        const expectedCommitment = SubscriptionContractSimulator.computeCommitment(secret, this.activePlanId);

        if (this.subscriberCommitment !== expectedCommitment) {
            throw new Error('Caller does not own subscription commitment');
        }

        // State mutation
        this.state = SubscriptionState.CANCELLED;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Returns a copy of the current public ledger state
     */
    public getLedgerState(): ContractLedgerState {
        return {
            state: this.state,
            activePlanId: this.activePlanId,
            subscriberCommitment: this.subscriberCommitment,
            sequenceNumber: this.sequenceNumber
        };
    }
}
