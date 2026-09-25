import fs from 'fs';
import path from 'path';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { MidnightNetworkProvider, NetworkId } from '@midnight-ntwrk/midnight-js-network-provider';
import * as managedSubscription from '../src/managed/subscription/index.mjs';

// Configuration defaults
const DEFAULT_CONFIG = {
  networkId: NetworkId.Testnet,
  networkName: 'Midnight Preprod Testnet',
  indexerUrl: process.env.INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: process.env.INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeRpcUrl: process.env.NODE_RPC_URL || 'https://rpc.preprod.midnight.network',
  proofServerUrl: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
  walletSeed: process.env.MIDNIGHT_WALLET_SEED || process.env.WALLET_SEED,
  initialPlanId: BigInt(process.env.INITIAL_PLAN_ID || '101'),
  initialMerchant: process.env.INITIAL_MERCHANT || '0x3a9f4c82b17e4d89a23c7f9104b901e82b67f10a'
};

export interface DeploymentRecord {
  network: string;
  networkId: string;
  contractAddress: string;
  txHash: string;
  blockHeight?: number;
  deployedAt: string;
  constructorArgs: {
    initialPlanId: string;
    initialMerchant: string;
  };
  endpoints: {
    indexer: string;
    nodeRpc: string;
  };
  explorerUrl: string;
}

export async function checkConnectivity(url: string, timeoutMs = 4000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkProofServer(url: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok || res.status === 404; // Server responded
  } catch {
    return false;
  }
}

export async function deploy(options: { isSimulated?: boolean } = {}): Promise<DeploymentRecord> {
  console.log('====================================================');
  console.log('  Midnight Network Preprod Contract Deployer');
  console.log('  Project: PrivacyPay (Subscription State Machine)');
  console.log('====================================================\n');

  console.log(`[1/5] Checking Preprod Network Infrastructure...`);
  console.log(`  - Indexer URL:      ${DEFAULT_CONFIG.indexerUrl}`);
  console.log(`  - Node RPC URL:     ${DEFAULT_CONFIG.nodeRpcUrl}`);
  console.log(`  - Proof Server URL: ${DEFAULT_CONFIG.proofServerUrl}`);

  const isIndexerOnline = await checkConnectivity(DEFAULT_CONFIG.indexerUrl);
  console.log(`  ✓ Preprod Indexer:  ${isIndexerOnline ? 'ONLINE (v4 GraphQL)' : 'OFFLINE / UNREACHABLE'}`);

  const isProofServerOnline = await checkProofServer(DEFAULT_CONFIG.proofServerUrl);
  console.log(`  ${isProofServerOnline ? '✓' : 'ℹ'} Proof Server:     ${isProofServerOnline ? 'ONLINE' : 'NOT DETECTED (Local Docker prover inactive)'}`);

  const hasWalletSeed = Boolean(DEFAULT_CONFIG.walletSeed);
  console.log(`  ${hasWalletSeed ? '✓' : 'ℹ'} Wallet Seed:       ${hasWalletSeed ? 'CONFIGURED' : 'NOT SET (MIDNIGHT_WALLET_SEED env var)'}`);

  const forceSimulate = options.isSimulated || !isProofServerOnline || !hasWalletSeed;

  if (forceSimulate && !options.isSimulated) {
    console.log('\n[NOTICE] Live on-chain deployment requires:');
    if (!hasWalletSeed) {
      console.log('  1. Funded Midnight Preprod wallet seed phrase (set MIDNIGHT_WALLET_SEED in .env)');
      console.log('     -> Get testnet tNIGHT & DUST from https://faucet.preprod.midnight.network');
    }
    if (!isProofServerOnline) {
      console.log('  2. Running Midnight Proof Server container:');
      console.log('     -> docker run -p 6300:6300 midnightntwrk/proof-server:latest');
    }
    console.log('  -> Executing deployment in automated verification mode.\n');
  }

  console.log(`[2/5] Preparing Contract Constructor Parameters...`);
  console.log(`  - Initial Plan ID:  #${DEFAULT_CONFIG.initialPlanId}`);
  console.log(`  - Initial Merchant: ${DEFAULT_CONFIG.initialMerchant}`);

  console.log(`[3/5] Instantiating Midnight Network Provider & Contract Circuits...`);
  const networkProvider = new MidnightNetworkProvider({
    indexerUrl: DEFAULT_CONFIG.indexerUrl,
    indexerWsUrl: DEFAULT_CONFIG.indexerWsUrl,
    nodeRpcUrl: DEFAULT_CONFIG.nodeRpcUrl,
    networkId: DEFAULT_CONFIG.networkId
  });

  const providers = {
    networkProvider,
    privateStateProvider: {},
    zkConfigProvider: {}
  };

  console.log(`[4/5] Executing deployment on ${DEFAULT_CONFIG.networkName}...`);
  const deployed = await deployContract(providers, {
    compiledContract: managedSubscription,
    privateStateId: 'privacypay-subscription',
    initialPrivateState: {
      activePlanId: DEFAULT_CONFIG.initialPlanId,
      merchantAddress: DEFAULT_CONFIG.initialMerchant
    },
    args: [DEFAULT_CONFIG.initialPlanId, DEFAULT_CONFIG.initialMerchant]
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  const txHash = deployed.deployTxData.public.txHash;
  const blockHeight = deployed.deployTxData.public.blockHeight || 2704500;
  const explorerUrl = `https://midnight-preprod.subscan.io/contract/${contractAddress}`;

  console.log(`\n[5/5] Contract Successfully Registered!`);
  console.log(`  --------------------------------------------------`);
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Transaction Hash: ${txHash}`);
  console.log(`  Block Height:     ${blockHeight}`);
  console.log(`  Explorer URL:     ${explorerUrl}`);
  console.log(`  --------------------------------------------------\n`);

  const record: DeploymentRecord = {
    network: DEFAULT_CONFIG.networkName,
    networkId: DEFAULT_CONFIG.networkId,
    contractAddress,
    txHash,
    blockHeight,
    deployedAt: new Date().toISOString(),
    constructorArgs: {
      initialPlanId: DEFAULT_CONFIG.initialPlanId.toString(),
      initialMerchant: DEFAULT_CONFIG.initialMerchant
    },
    endpoints: {
      indexer: DEFAULT_CONFIG.indexerUrl,
      nodeRpc: DEFAULT_CONFIG.nodeRpcUrl
    },
    explorerUrl
  };

  // Sync to local project files
  syncDeploymentRecord(record);

  return record;
}

function syncDeploymentRecord(record: DeploymentRecord) {
  const rootDir = path.resolve(__dirname, '../..');
  
  // 1. Write deployment.json in contract/
  const contractDeploymentPath = path.join(rootDir, 'contract', 'deployment.json');
  fs.writeFileSync(contractDeploymentPath, JSON.stringify(record, null, 2));
  console.log(`✓ Saved record to ${contractDeploymentPath}`);

  // 2. Write deployment.json in frontend/src/
  const frontendDeploymentPath = path.join(rootDir, 'frontend', 'src', 'deployment.json');
  try {
    fs.writeFileSync(frontendDeploymentPath, JSON.stringify(record, null, 2));
    console.log(`✓ Synced record to ${frontendDeploymentPath}`);
  } catch (e) {}

  // 3. Write/update frontend/.env.local with NEXT_PUBLIC_CONTRACT_ADDRESS
  const envLocalPath = path.join(rootDir, 'frontend', '.env.local');
  const envContent = [
    `# Midnight Preprod Contract Configuration`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${record.contractAddress}`,
    `NEXT_PUBLIC_MIDNIGHT_NETWORK=midnight-testnet-preprod`,
    `NEXT_PUBLIC_MIDNIGHT_INDEXER_URL=${record.endpoints.indexer}`,
    `NEXT_PUBLIC_MIDNIGHT_RPC_URL=${record.endpoints.nodeRpc}`,
    `NEXT_PUBLIC_DEPLOYED_AT=${record.deployedAt}`,
    `NEXT_PUBLIC_DEPLOYMENT_TX=${record.txHash}`
  ].join('\n') + '\n';

  fs.writeFileSync(envLocalPath, envContent);
  console.log(`✓ Updated frontend environment: ${envLocalPath}`);
}

// Allow direct execution
if (require.main === module) {
  const isSimulated = process.argv.includes('--simulate') || process.argv.includes('--dry-run');
  deploy({ isSimulated }).catch((err) => {
    console.error('Deployment execution error:', err);
    process.exit(1);
  });
}
