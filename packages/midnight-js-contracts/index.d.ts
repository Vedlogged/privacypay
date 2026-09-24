import type { ContractAddress } from '@midnight-ntwrk/midnight-js-types';
export interface DeployedContract<T> {
  address: ContractAddress;
  contract: T;
  callTx(circuitName: string, args: any[]): Promise<string>;
}
export function createContract<T>(address: ContractAddress, definition: any): DeployedContract<T>;