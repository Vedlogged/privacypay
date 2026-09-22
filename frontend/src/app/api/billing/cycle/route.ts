import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, amountCents = 2900, outcome = 'SUCCESS' } = body;

    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: 'subscriptionId is required' }, { status: 400 });
    }

    const invoiceId = `inv_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = globalStore.engine.processRecurringCycle(subscriptionId, invoiceId, Number(amountCents), outcome);

    const sub = globalStore.engine.getSubscription(subscriptionId);
    const ledger = sub.contract.getLedgerState();

    return NextResponse.json({
      success: true,
      message: outcome === 'SUCCESS' ? 'Billing cycle processed and advanced successfully' : 'Billing cycle payment failure recorded (PAST_DUE)',
      data: {
        subscriptionId,
        state: ledger.state,
        cycleCount: ledger.cycleCount.toString(),
        sequenceNumber: ledger.sequenceNumber.toString(),
        latestInvoice: sub.invoices[sub.invoices.length - 1]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
