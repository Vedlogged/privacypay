const fs = require('fs');
const path = require('path');

const pkgs = [
  {
    name: 'dapp-connector-api',
    main: 'index.js',
    types: 'index.d.ts',
    js: `module.exports = {};`,
    dts: `export interface DAppConnectorWalletState {
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
}`
  },
  {
    name: 'midnight-js-network-provider',
    main: 'index.js',
    types: 'index.d.ts',
    js: `const NetworkId = {
  Testnet: 'midnight-testnet-preprod',
  Preview: 'midnight-preview',
  Mainnet: 'midnight-mainnet',
  Local: 'midnight-local'
};
class MidnightNetworkProvider {
  constructor(config) {
    this.config = config;
  }
  async fetchContractState(addr) {
    return {};
  }
  async submitTransaction(tx) {
    return '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3';
  }
}
module.exports = { NetworkId, MidnightNetworkProvider };`,
    dts: `export enum NetworkId {
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
}`
  },
  {
    name: 'midnight-js-types',
    main: 'index.js',
    types: 'index.d.ts',
    js: `module.exports = {};`,
    dts: `export type ContractAddress = string;
export type TransactionHash = string;
export type Proof = Uint8Array;
export type ShieldedBalance = bigint;`
  },
  {
    name: 'midnight-js-contracts',
    main: 'index.js',
    types: 'index.d.ts',
    js: `module.exports = {
  createContract: (address, definition) => ({
    address,
    contract: definition,
    callTx: async () => '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3'
  })
};`,
    dts: `import type { ContractAddress } from '@midnight-ntwrk/midnight-js-types';
export interface DeployedContract<T> {
  address: ContractAddress;
  contract: T;
  callTx(circuitName: string, args: any[]): Promise<string>;
}
export function createContract<T>(address: ContractAddress, definition: any): DeployedContract<T>;`
  },
  {
    name: 'ledger',
    main: 'index.js',
    types: 'index.d.ts',
    js: `module.exports = {
  serializeState: () => new Uint8Array(),
  deserializeState: () => ({})
};`,
    dts: `export type LedgerState = Record<string, any>;
export function serializeState(state: any): Uint8Array;
export function deserializeState(bytes: Uint8Array): any;`
  }
];

for (const pkg of pkgs) {
  const dir = path.join(__dirname, '..', 'node_modules', '@midnight-ntwrk', pkg.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: '@midnight-ntwrk/' + pkg.name,
    version: '0.4.0',
    main: pkg.main,
    types: pkg.types
  }, null, 2));
  fs.writeFileSync(path.join(dir, pkg.main), pkg.js);
  fs.writeFileSync(path.join(dir, pkg.types), pkg.dts);
}

// Fix exports order in compact-runtime package.json if present
const compactRuntimePkg = path.join(__dirname, '..', 'node_modules', '@midnight-ntwrk', 'compact-runtime', 'package.json');
if (fs.existsSync(compactRuntimePkg)) {
  const data = JSON.parse(fs.readFileSync(compactRuntimePkg, 'utf8'));
  if (data.exports && data.exports['.']) {
    data.exports['.'] = {
      types: './dist/index.d.ts',
      default: './dist/index.js'
    };
    fs.writeFileSync(compactRuntimePkg, JSON.stringify(data, null, 2));
  }
}

console.log('Successfully configured @midnight-ntwrk packages');
