import { SubscriptionContractSimulator, SubscriptionState, SubscriberWitness, ContractLedgerState } from './simulator';

export interface SubscriptionLifecycleRecord {
    id: string;
    merchantId: string;
    planId: bigint;
    contract: SubscriptionContractSimulator;
    secret?: string;
    createdAt: number;
    updatedAt: number;
    invoices: BillingInvoice[];
}

export interface BillingInvoice {
    invoiceId: string;
    cycle: number;
    amountCents: number;
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
    paidAt?: number;
    failureReason?: string;
}

/**
 * Production-Grade Subscription Engine (State Machine Orchestrator)
 * Coordinates off-chain fiat settlement events with on-chain Midnight Compact state transitions.
 */
export class SubscriptionEngine {
    private registry: Map<string, SubscriptionLifecycleRecord> = new Map();

    /**
     * Instantiates a new subscription record in CREATED state
     */
    public createSubscription(id: string, planId: bigint, merchantId: string = '0x' + '1'.repeat(64)): SubscriptionLifecycleRecord {
        if (this.registry.has(id)) {
            throw new Error(`Subscription with ID ${id} already exists`);
        }

        const contract = new SubscriptionContractSimulator(planId, merchantId);
        const record: SubscriptionLifecycleRecord = {
            id,
            merchantId,
            planId,
            contract,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            invoices: []
        };

        this.registry.set(id, record);
        return record;
    }

    public getSubscription(id: string): SubscriptionLifecycleRecord {
        const record = this.registry.get(id);
        if (!record) {
            throw new Error(`Subscription ${id} not found`);
        }
        return record;
    }

    public getAllSubscriptions(): SubscriptionLifecycleRecord[] {
        return Array.from(this.registry.values());
    }

    /**
     * Authorizes subscription on-chain via Compact authorize circuit
     */
    public authorize(id: string, secret: string): { commitment: string; state: SubscriptionState } {
        const record = this.getSubscription(id);
        const witness: SubscriberWitness = {
            getSubscriberSecret: () => secret
        };

        const result = record.contract.authorize(record.planId, witness);
        record.secret = secret;
        record.updatedAt = Date.now();

        return {
            commitment: result.commitment,
            state: result.state
        };
    }

    /**
     * Activates subscription upon initial fiat checkout confirmation
     */
    public confirmInitialPayment(id: string, invoiceId: string, amountCents: number): { state: SubscriptionState } {
        const record = this.getSubscription(id);
        record.contract.activate();

        record.invoices.push({
            invoiceId,
            cycle: 1,
            amountCents,
            status: 'SUCCEEDED',
            paidAt: Date.now()
        });
        record.updatedAt = Date.now();

        return { state: record.contract.getLedgerState().state };
    }

    /**
     * Progresses lifecycle through a complete recurring billing cycle:
     * ACTIVE -> BILLING_DUE -> PROCESSING -> PAID -> NEXT_CYCLE -> ACTIVE
     */
    public processRecurringCycle(
        id: string,
        invoiceId: string,
        amountCents: number,
        gatewayOutcome: 'SUCCESS' | 'FAILURE'
    ): { state: SubscriptionState; cycle: number } {
        const record = this.getSubscription(id);

        // 1. Mark billing due
        record.contract.markBillingDue();

        // 2. Start processing
        record.contract.startProcessing();

        if (gatewayOutcome === 'SUCCESS') {
            // 3. Settle payment on-chain
            record.contract.settlePayment();

            // 4. Advance cycle
            record.contract.advanceCycle();

            // 5. Activate next cycle
            record.contract.activate();

            record.invoices.push({
                invoiceId,
                cycle: Number(record.contract.getLedgerState().cycleCount),
                amountCents,
                status: 'SUCCEEDED',
                paidAt: Date.now()
            });
            record.updatedAt = Date.now();

            return {
                state: record.contract.getLedgerState().state,
                cycle: Number(record.contract.getLedgerState().cycleCount)
            };
        } else {
            // Payment failed: transition to PAST_DUE
            record.contract.markPastDue();

            record.invoices.push({
                invoiceId,
                cycle: Number(record.contract.getLedgerState().cycleCount) + 1,
                amountCents,
                status: 'FAILED',
                failureReason: 'Card declined / insufficient funds'
            });
            record.updatedAt = Date.now();

            return {
                state: record.contract.getLedgerState().state,
                cycle: Number(record.contract.getLedgerState().cycleCount)
            };
        }
    }

    /**
     * Cancels subscription with secret witness proof
     */
    public cancel(id: string, callerSecret?: string): { state: SubscriptionState } {
        const record = this.getSubscription(id);
        const secret = callerSecret || record.secret;
        if (!secret) {
            throw new Error('Subscriber secret is required to cancel subscription');
        }

        const witness: SubscriberWitness = {
            getSubscriberSecret: () => secret
        };

        const result = record.contract.cancel(witness);
        record.updatedAt = Date.now();

        return { state: result.state };
    }
}
