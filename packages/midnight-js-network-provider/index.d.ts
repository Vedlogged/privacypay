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