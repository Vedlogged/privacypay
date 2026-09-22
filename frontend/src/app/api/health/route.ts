import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    network: 'Midnight Preprod Testnet (Halo2/ZK-SNARKs)',
    protocol: 'PrivacyPay Compact Engine v0.3.0',
    metrics: {
      merchantsCount: globalStore.merchants.size,
      productsCount: globalStore.products.size,
      plansCount: globalStore.plans.size,
      activeSubscriptions: globalStore.engine.getAllSubscriptions().length
    }
  });
}
