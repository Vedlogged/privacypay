'use strict';

const SubscriptionState = {
    CREATED: 0,
    AUTHORIZED: 1,
    ACTIVE: 2,
    BILLING_DUE: 3,
    PROCESSING: 4,
    PAID: 5,
    NEXT_CYCLE: 6,
    FAILED: 7,
    CANCELLED: 8,
    EXPIRED: 9,
    PAST_DUE: 10
};

const contractReferenceLocations = {
    subscriptionContract: 'managed/subscription/subscription.wasm'
};

class Contract {
    constructor(witnesses) {
        this.witnesses = witnesses;
        this.circuits = {
            authorize: (planId) => ({ result: new Uint8Array(32), context: {} }),
            activate: () => ({ result: undefined, context: {} }),
            markBillingDue: () => ({ result: undefined, context: {} }),
            startProcessing: () => ({ result: undefined, context: {} }),
            settlePayment: () => ({ result: undefined, context: {} }),
            advanceCycle: () => ({ result: undefined, context: {} }),
            markPastDue: () => ({ result: undefined, context: {} }),
            cancel: () => ({ result: undefined, context: {} })
        };
        this.impureCircuits = { ...this.circuits };
        this.pureCircuits = {};
    }

    initialState(context, initialPlanId, initialMerchant) {
        return {
            currentContractState: {
                data: {
                    state: SubscriptionState.CREATED,
                    activePlanId: initialPlanId,
                    merchantAddress: initialMerchant,
                    subscriberCommitment: new Uint8Array(32),
                    sequenceNumber: 1n,
                    cycleCount: 0n
                }
            },
            currentZswapLocalState: {}
        };
    }
}

function ledger(state) {
    return state.data;
}

module.exports = {
    SubscriptionState,
    Contract,
    contractReferenceLocations,
    ledger
};
