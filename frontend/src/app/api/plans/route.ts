import { NextResponse } from 'next/server';
import { globalStore, SaaSPlan } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  let plans = Array.from(globalStore.plans.values());
  if (productId) {
    plans = plans.filter(p => p.productId === productId);
  }

  return NextResponse.json({ success: true, count: plans.length, data: plans });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, name, priceUsd, cadence = 'month', features = [] } = body;

    if (!productId || !name || priceUsd === undefined) {
      return NextResponse.json({ success: false, error: 'Product ID, plan name, and price are required' }, { status: 400 });
    }

    const nextNumericId = (globalStore.plans.size + 101).toString();
    const newPlan: SaaSPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      planIdNumeric: nextNumericId,
      productId,
      name,
      priceUsd: Number(priceUsd),
      cadence,
      features: Array.isArray(features) ? features : [features]
    };

    globalStore.plans.set(newPlan.id, newPlan);
    return NextResponse.json({ success: true, data: newPlan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
