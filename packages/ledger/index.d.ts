export type LedgerState = Record<string, any>;
export function serializeState(state: any): Uint8Array;
export function deserializeState(bytes: Uint8Array): any;