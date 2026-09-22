import { createHash, randomBytes } from 'crypto';

export enum SubscriptionState {
    CREATED = 'CREATED',
    AUTHORIZED = 'AUTHORIZED',
    ACTIVE = 'ACTIVE',
    BILLING_DUE = 'BILLING_DUE',
    PROCESSING = 'PROCESSING',
    PAID = 'PAID',
    NEXT_CYCLE = 'NEXT_CYCLE',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    PAST_DUE = 'PAST_DUE'
}

export interface ContractLedgerState {
    state: SubscriptionState;
    activePlanId: bigint;
    merchantAddress: string;
    subscriberCommitment: string;
    sequenceNumber: bigint;
    cycleCount: bigint;
}

export interface SubscriberWitness {
    getSubscriberSecret: () => string; // 32-byte hex string (64 hex characters)
}

/**
 * Compact Subscription Contract Simulator (Level 2 & 3 Production Grade)
 * Implements the complete verifiable zero-knowledge state machine,
 * witness preimage assertions, access control, and multi-cycle lifecycle transitions.
 */
export class SubscriptionContractSimulator {
    private state: SubscriptionState;
    private activePlanId: bigint;
    private merchantAddress: string;
    private subscriberCommitment: string;
    private sequenceNumber: bigint;
    private cycleCount: bigint;

    constructor(initialPlanId: bigint, initialMerchant: string = '0x' + '1'.repeat(64)) {
        if (initialPlanId <= 0n) {
            throw new Error('Initial plan ID must be a positive integer');
        }
        this.state = SubscriptionState.CREATED;
        this.activePlanId = initialPlanId;
        this.merchantAddress = initialMerchant.startsWith('0x') ? initialMerchant : '0x' + initialMerchant;
        this.subscriberCommitment = '0x' + '0'.repeat(64);
        this.sequenceNumber = 1n;
        this.cycleCount = 0n;
    }

    /**
     * Computes the cryptographic commitment H(secret, planId)
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
     * Authorizes a subscription (CREATED -> AUTHORIZED)
     */
    public authorize(planId: bigint, witness: SubscriberWitness): { commitment: string; sequenceNumber: bigint; state: SubscriptionState } {
        if (
            this.state !== SubscriptionState.CREATED &&
            this.state !== SubscriptionState.CANCELLED &&
            this.state !== SubscriptionState.EXPIRED
        ) {
            throw new Error(`Subscription is already in ${this.state} state`);
        }
        if (planId !== this.activePlanId) {
            throw new Error(`Invalid plan ID: expected ${this.activePlanId}, got ${planId}`);
        }

        const secret = witness.getSubscriberSecret();
        const commitment = SubscriptionContractSimulator.computeCommitment(secret, planId);

        this.subscriberCommitment = commitment;
        this.state = SubscriptionState.AUTHORIZED;
        this.sequenceNumber += 1n;

        return {
            commitment: this.subscriberCommitment,
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Activates subscription upon initial payment confirmation (AUTHORIZED -> ACTIVE)
     */
    public activate(): { sequenceNumber: bigint; cycleCount: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.AUTHORIZED && this.state !== SubscriptionState.NEXT_CYCLE) {
            throw new Error(`Subscription must be AUTHORIZED or NEXT_CYCLE to activate, current: ${this.state}`);
        }
        this.state = SubscriptionState.ACTIVE;
        this.sequenceNumber += 1n;
        this.cycleCount += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            cycleCount: this.cycleCount,
            state: this.state
        };
    }

    /**
     * Transitions ACTIVE -> BILLING_DUE
     */
    public markBillingDue(): { sequenceNumber: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.ACTIVE) {
            throw new Error(`Subscription must be ACTIVE to mark billing due, current: ${this.state}`);
        }
        this.state = SubscriptionState.BILLING_DUE;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Transitions BILLING_DUE -> PROCESSING
     */
    public startProcessing(): { sequenceNumber: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.BILLING_DUE) {
            throw new Error(`Subscription must be BILLING_DUE to start processing, current: ${this.state}`);
        }
        this.state = SubscriptionState.PROCESSING;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Transitions PROCESSING -> PAID
     */
    public settlePayment(): { sequenceNumber: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.PROCESSING) {
            throw new Error(`Subscription must be PROCESSING to settle payment, current: ${this.state}`);
        }
        this.state = SubscriptionState.PAID;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Transitions PAID -> NEXT_CYCLE
     */
    public advanceCycle(): { sequenceNumber: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.PAID) {
            throw new Error(`Subscription must be PAID to advance cycle, current: ${this.state}`);
        }
        this.state = SubscriptionState.NEXT_CYCLE;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Transitions PROCESSING or BILLING_DUE -> PAST_DUE
     */
    public markPastDue(): { sequenceNumber: bigint; state: SubscriptionState } {
        if (this.state !== SubscriptionState.PROCESSING && this.state !== SubscriptionState.BILLING_DUE) {
            throw new Error(`Invalid state for past due: ${this.state}`);
        }
        this.state = SubscriptionState.PAST_DUE;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Cancels the active subscription with secret witness preimage verification
     */
    public cancel(witness: SubscriberWitness): { sequenceNumber: bigint; state: SubscriptionState } {
        const cancellableStates = [
            SubscriptionState.AUTHORIZED,
            SubscriptionState.ACTIVE,
            SubscriptionState.BILLING_DUE,
            SubscriptionState.PAID,
            SubscriptionState.NEXT_CYCLE,
            SubscriptionState.PAST_DUE
        ];

        if (!cancellableStates.includes(this.state)) {
            throw new Error(`Subscription cannot be cancelled in current state: ${this.state}`);
        }

        const secret = witness.getSubscriberSecret();
        const expectedCommitment = SubscriptionContractSimulator.computeCommitment(secret, this.activePlanId);

        if (this.subscriberCommitment !== expectedCommitment) {
            throw new Error('Caller does not own subscription commitment');
        }

        this.state = SubscriptionState.CANCELLED;
        this.sequenceNumber += 1n;

        return {
            sequenceNumber: this.sequenceNumber,
            state: this.state
        };
    }

    /**
     * Returns current public ledger state
     */
    public getLedgerState(): ContractLedgerState {
        return {
            state: this.state,
            activePlanId: this.activePlanId,
            merchantAddress: this.merchantAddress,
            subscriberCommitment: this.subscriberCommitment,
            sequenceNumber: this.sequenceNumber,
            cycleCount: this.cycleCount
        };
    }
}
