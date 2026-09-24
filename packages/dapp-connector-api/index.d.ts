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