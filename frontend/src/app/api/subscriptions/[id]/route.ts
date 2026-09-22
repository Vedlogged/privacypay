import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sub = globalStore.engine.getSubscription(params.id);
    const ledger = sub.contract.getLedgerState();

    return NextResponse.json({
      success: true,
      data: {
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
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    const cancelResult = globalStore.engine.cancel(params.id, secret);
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully with secret witness proof',
      data: {
        id: params.id,
        state: cancelResult.state
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
