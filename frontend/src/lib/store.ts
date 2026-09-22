import { SubscriptionEngine, SubscriptionLifecycleRecord, SubscriptionState, SubscriptionContractSimulator } from '@privacy-pay/contract';

export interface SaaSProduct {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  createdAt: number;
}

export interface SaaSPlan {
  id: string;
  planIdNumeric: string; // bigint representation as string for JSON
  productId: string;
  name: string;
  priceUsd: number;
  cadence: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  midnightAddress: string;
  webhookUrl?: string;
  apiKey: string;
  createdAt: number;
}

/**
 * Global Thread-Safe Application Store
 * Persists and seeds SaaS products, pricing plans, and connects to the SubscriptionEngine.
 */
class GlobalStore {
  private static instance: GlobalStore;
  public engine: SubscriptionEngine;
  public merchants: Map<string, MerchantProfile> = new Map();
  public products: Map<string, SaaSProduct> = new Map();
  public plans: Map<string, SaaSPlan> = new Map();

  private constructor() {
    this.engine = new SubscriptionEngine();
    this.seedDefaultData();
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  private seedDefaultData() {
    // 1. Seed Merchant
    const defaultMerchant: MerchantProfile = {
      id: 'm_midnight_001',
      name: 'CyberShield Technologies',
      email: 'billing@cybershield.io',
      midnightAddress: '0x' + '1'.repeat(64),
      webhookUrl: 'https://api.cybershield.io/webhooks/privacypay',
      apiKey: 'pk_live_' + SubscriptionContractSimulator.generateSecret().slice(2, 26),
      createdAt: Date.now()
    };
    this.merchants.set(defaultMerchant.id, defaultMerchant);

    // 2. Seed Products
    const prod1: SaaSProduct = {
      id: 'prod_vault',
      merchantId: defaultMerchant.id,
      name: 'PrivacyVault Cloud Storage',
      description: 'Zero-knowledge end-to-end encrypted object storage with instant access.',
      category: 'Infrastructure',
      icon: 'Shield',
      createdAt: Date.now()
    };
    const prod2: SaaSProduct = {
      id: 'prod_ai',
      merchantId: defaultMerchant.id,
      name: 'PrivateAI Inference API',
      description: 'Confidential LLM inference with zero data retention and verifiable compute.',
      category: 'AI / Compute',
      icon: 'Cpu',
      createdAt: Date.now()
    };
    this.products.set(prod1.id, prod1);
    this.products.set(prod2.id, prod2);

    // 3. Seed Pricing Plans
    const plan1: SaaSPlan = {
      id: 'plan_vault_starter',
      planIdNumeric: '101',
      productId: prod1.id,
      name: 'Starter Vault',
      priceUsd: 19,
      cadence: 'month',
      features: [
        '500 GB Zero-Knowledge Encrypted Storage',
        'Direct Midnight Privacy Authorization',
        'Unlimited API Requests',
        'Automatic Fiat Recurring Billing'
      ]
    };
    const plan2: SaaSPlan = {
      id: 'plan_vault_pro',
      planIdNumeric: '102',
      productId: prod1.id,
      name: 'Pro Enterprise Vault',
      priceUsd: 49,
      cadence: 'month',
      isPopular: true,
      features: [
        '5 TB Encrypted Object Storage',
        'Multi-Region Shielded Replication',
        'Priority Midnight Compact Settling',
        '24/7 Enterprise Dedicated Support',
        'Custom Webhook Integrations'
      ]
    };
    const plan3: SaaSPlan = {
      id: 'plan_ai_developer',
      planIdNumeric: '201',
      productId: prod2.id,
      name: 'PrivateAI Developer',
      priceUsd: 99,
      cadence: 'month',
      features: [
        '1,000,000 Private Compute Tokens/mo',
        'Confidential Enclave Execution',
        'Zero Logging / Retention Guarantee',
        'Instant Fiat Invoice Receipts'
      ]
    };
    this.plans.set(plan1.id, plan1);
    this.plans.set(plan2.id, plan2);
    this.plans.set(plan3.id, plan3);
  }
}

export const globalStore = GlobalStore.getInstance();
