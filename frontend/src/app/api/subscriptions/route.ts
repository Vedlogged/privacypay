import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';
import { SubscriptionContractSimulator } from '@privacy-pay/contract';

export async function GET() {
  const all = globalStore.engine.getAllSubscriptions().map(sub => {
    const ledger = sub.contract.getLedgerState();
    return {
      id: sub.id,
      merchantId: sub.merchantId,
      planId: sub.planId.toString(),
      state: ledger.state,
      cycleCount: ledger.cycleCount.toString(),
      subscriberCommitment: ledger.subscriberCommitment,
      sequenceNumber: ledger.sequenceNumber.toString(),
      invoices: sub.invoices,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt
    };
  });

  return NextResponse.json({ success: true, count: all.length, data: all });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planIdNumeric, merchantId = '0x' + '1'.repeat(64), customSecret } = body;

    if (!planIdNumeric) {
      return NextResponse.json({ success: false, error: 'planIdNumeric is required' }, { status: 400 });
    }

    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const planBigInt = BigInt(planIdNumeric);

    // 1. Create on-chain subscription instance
    globalStore.engine.createSubscription(subId, planBigInt, merchantId);

    // 2. Authorize with client witness secret
    const secret = customSecret || SubscriptionContractSimulator.generateSecret();
    const authResult = globalStore.engine.authorize(subId, secret);

    // 3. Confirm initial payment
    const invoiceId = `inv_init_${Date.now()}`;
    const initialAmountCents = 2900; // Standard nominal amount in cents
    globalStore.engine.confirmInitialPayment(subId, invoiceId, initialAmountCents);

    const updatedSub = globalStore.engine.getSubscription(subId);
    const ledger = updatedSub.contract.getLedgerState();

    return NextResponse.json({
      success: true,
      data: {
        id: subId,
        secret,
        state: ledger.state,
        planId: ledger.activePlanId.toString(),
        subscriberCommitment: ledger.subscriberCommitment,
        cycleCount: ledger.cycleCount.toString(),
        sequenceNumber: ledger.sequenceNumber.toString(),
        invoices: updatedSub.invoices
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
