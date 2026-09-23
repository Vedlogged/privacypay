declare module '@midnight-ntwrk/dapp-connector-api' {
  export interface DAppConnectorWalletState {
    isEnabled: boolean;
    networkId: string;
    unshieldedAddress?: string;
    shieldedBalances?: Record<string, bigint>;
    dustBalance?: bigint;
  }

  export interface ConnectedAPI {
    getUnshieldedAddress(): Promise<string>;
    getShieldedBalances(): Promise<Record<string, bigint>>;
    submitTx(txBytes: Uint8Array): Promise<string>;
  }

  export interface InitialAPI {
    name: string;
    apiVersion: string;
    icon?: string;
    isEnabled(): Promise<boolean>;
    enable(): Promise<ConnectedAPI>;
  }

  export interface DAppConnectorAPI {
    mnLace: InitialAPI;
  }
}

declare module '@midnight-ntwrk/midnight-js-network-provider' {
  export enum NetworkId {
    Testnet = 'midnight-testnet-preprod',
    Preview = 'midnight-preview',
    Mainnet = 'midnight-mainnet',
    Local = 'midnight-local'
  }

  export interface NetworkProviderConfig {
    indexerUrl: string;
    indexerWsUrl: string;
    nodeRpcUrl: string;
    networkId: NetworkId;
  }

  export class MidnightNetworkProvider {
    readonly config: NetworkProviderConfig;
    constructor(config: NetworkProviderConfig);
    fetchContractState(contractAddress: string): Promise<any>;
    submitTransaction(tx: Uint8Array): Promise<string>;
  }
}

declare module '@midnight-ntwrk/midnight-js-types' {
  export type ContractAddress = string;
  export type TransactionHash = string;
  export type Proof = Uint8Array;
  export type ShieldedBalance = bigint;
}

declare module '@midnight-ntwrk/midnight-js-contracts' {
  import type { ContractAddress, Proof } from '@midnight-ntwrk/midnight-js-types';

  export interface DeployedContract<T> {
    address: ContractAddress;
    contract: T;
    callTx(circuitName: string, args: any[]): Promise<string>;
  }

  export function createContract<T>(address: ContractAddress, definition: any): DeployedContract<T>;
}

declare module '@midnight-ntwrk/ledger' {
  export type LedgerState = Record<string, any>;
  export function serializeState(state: any): Uint8Array;
  export function deserializeState(bytes: Uint8Array): any;
}
