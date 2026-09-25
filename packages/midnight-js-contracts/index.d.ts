import type { ContractAddress } from '@midnight-ntwrk/midnight-js-types';
export interface DeployedContract<T> {
  address: ContractAddress;
  contract: T;
  callTx(circuitName: string, args: any[]): Promise<string>;
}
export interface DeployedContractInstance<T = any> {
  deployTxData: {
    public: {
      contractAddress: ContractAddress;
      txHash: string;
      blockHeight?: number;
    };
  };
  contractAddress: ContractAddress;
  callTx: Record<string, (...args: any[]) => Promise<any>>;
}
export function createContract<T>(address: ContractAddress, definition: any): DeployedContract<T>;
export function deployContract<T = any>(
  providers: any,
  options: {
    compiledContract: any;
    privateStateId?: string;
    initialPrivateState?: any;
    args?: any[];
  }
): Promise<DeployedContractInstance<T>>;