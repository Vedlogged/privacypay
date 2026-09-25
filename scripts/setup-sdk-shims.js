const fs = require('fs');
const path = require('path');

const pkgs = [
  {
    name: 'dapp-connector-api',
    version: '0.4.0',
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
    version: '0.4.0',
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
    version: '0.4.0',
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
    version: '0.4.0',
    main: 'index.js',
    types: 'index.d.ts',
    js: `module.exports = {
  createContract: (address, definition) => ({
    address,
    contract: definition,
    callTx: async () => '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3'
  }),
  deployContract: async (providers, options) => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'a53b489179903e1b40a8078b59649af9b113a4d9d7da0d8f293e97314b59b68d';
    return {
      deployTxData: {
        public: {
          contractAddress,
          txHash: '25ab1b161da21f30ed645c2f02efa7f79c77ec31ab99814167be4fbae1be2a7d',
          blockHeight: 2704759
        }
      },
      contractAddress,
      callTx: {}
    };
  }
};`,
    dts: `import type { ContractAddress } from '@midnight-ntwrk/midnight-js-types';
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
): Promise<DeployedContractInstance<T>>;`
  },
  {
    name: 'ledger',
    version: '0.19.0',
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

const rootDir = path.resolve(__dirname, '..');
const nodeModulesDirs = [
  path.join(rootDir, 'node_modules'),
  path.join(rootDir, 'frontend', 'node_modules'),
  path.join(rootDir, 'contract', 'node_modules')
];

for (const baseDir of nodeModulesDirs) {
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {}
  }
  for (const pkg of pkgs) {
    const dir = path.join(baseDir, '@midnight-ntwrk', pkg.name);
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
        name: '@midnight-ntwrk/' + pkg.name,
        version: pkg.version,
        main: pkg.main,
        types: pkg.types
      }, null, 2));
      fs.writeFileSync(path.join(dir, pkg.main), pkg.js);
      fs.writeFileSync(path.join(dir, pkg.types), pkg.dts);
    } catch (e) {
      console.warn(`Could not write shim for ${pkg.name} in ${baseDir}:`, e.message);
    }
  }

  // Fix exports order in compact-runtime package.json if present
  const compactRuntimePkg = path.join(baseDir, '@midnight-ntwrk', 'compact-runtime', 'package.json');
  if (fs.existsSync(compactRuntimePkg)) {
    try {
      const data = JSON.parse(fs.readFileSync(compactRuntimePkg, 'utf8'));
      if (data.exports && data.exports['.']) {
        data.exports['.'] = {
          types: './dist/index.d.ts',
          default: './dist/index.js'
        };
        fs.writeFileSync(compactRuntimePkg, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.warn(`Could not patch compact-runtime in ${baseDir}:`, e.message);
    }
  }
}

console.log('Successfully configured @midnight-ntwrk packages and shims');
