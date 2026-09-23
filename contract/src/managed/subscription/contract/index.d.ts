import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum SubscriptionState {
    CREATED = 0,
    AUTHORIZED = 1,
    ACTIVE = 2,
    BILLING_DUE = 3,
    PROCESSING = 4,
    PAID = 5,
    NEXT_CYCLE = 6,
    FAILED = 7,
    CANCELLED = 8,
    EXPIRED = 9,
    PAST_DUE = 10
}

export type Witnesses<T> = {
    getSubscriberSecret(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
};

export type ImpureCircuits<T> = {
    authorize(context: __compactRuntime.CircuitContext<T>, planId: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
    activate(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    markBillingDue(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    startProcessing(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    settlePayment(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    advanceCycle(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    markPastDue(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
    cancel(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
};

export type PureCircuits = {};

export type Circuits<T> = {
    authorize(planId: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
    activate(): __compactRuntime.CircuitResults<T, void>;
    markBillingDue(): __compactRuntime.CircuitResults<T, void>;
    startProcessing(): __compactRuntime.CircuitResults<T, void>;
    settlePayment(): __compactRuntime.CircuitResults<T, void>;
    advanceCycle(): __compactRuntime.CircuitResults<T, void>;
    markPastDue(): __compactRuntime.CircuitResults<T, void>;
    cancel(): __compactRuntime.CircuitResults<T, void>;
};

export type Ledger = {
    readonly state: SubscriptionState;
    readonly activePlanId: bigint;
    readonly merchantAddress: Uint8Array;
    readonly subscriberCommitment: Uint8Array;
    readonly sequenceNumber: bigint;
    readonly cycleCount: bigint;
};

export type ContractReferenceLocations = {
    readonly subscriptionContract: string;
};

export declare const contractReferenceLocations: ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> implements __compactRuntime.Contract<T, W> {
    readonly witnesses: W;
    readonly circuits: Circuits<T>;
    readonly impureCircuits: ImpureCircuits<T>;
    readonly pureCircuits: PureCircuits;
    constructor(witnesses: W);
    initialState(context: __compactRuntime.ConstructorContext<T>, initialPlanId: bigint, initialMerchant: Uint8Array): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
