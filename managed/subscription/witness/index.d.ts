import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from '../contract/index.js';

export type Witnesses<T> = {
    getSubscriberSecret(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
};

export declare function createWitnessContext<T>(secret: Uint8Array): Witnesses<T>;
