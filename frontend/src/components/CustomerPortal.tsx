'use client';

import React, { useState } from 'react';
import { Shield, CreditCard, Clock, Trash2, FileText, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { LifecycleStepper } from './LifecycleStepper';
import { PrivacyBadge } from './PrivacyBadge';
import { SubscriptionState } from '@privacy-pay/contract';

interface CustomerSubscription {
  id: string;
  planId: string;
  planName?: string;
  priceUsd?: number;
  state: SubscriptionState;
  cycleCount: string;
  subscriberCommitment: string;
  sequenceNumber: string;
  invoices: Array<{
    invoiceId: string;
    cycle: number;
    amountCents: number;
    status: string;
    paidAt?: number;
  }>;
}

interface CustomerPortalProps {
  subscriptions: CustomerSubscription[];
  onCancel: (subId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  subscriptions,
  onCancel,
  onRefresh,
  isLoading
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelClick = async (subId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription on the Midnight Network?')) {
      return;
    }
    setCancellingId(subId);
    try {
      await onCancel(subId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customer Subscription Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Manage your active privacy-preserving SaaS subscriptions, verifiable on-chain commitments, and fiat receipts.
          </p>
        </div>

        <button onClick={onRefresh} disabled={isLoading} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh State
        </button>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid var(--border-focus)'
          }}>
            <Shield size={32} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Subscriptions Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9375rem' }}>
            You have not authorized any subscriptions yet. Browse our available SaaS products to start your first privacy-preserving subscription.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {subscriptions.map((sub) => (
            <div key={sub.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Card Top Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {sub.planName || `SaaS Plan #${sub.planId}`}
                    </h3>
                    <PrivacyBadge type="DERIVED" label={`Commitment Active`} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Subscription ID: {sub.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CYCLE NUMBER</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                      Cycle #{sub.cycleCount}
                    </span>
                  </div>

                  {sub.state !== SubscriptionState.CANCELLED && (
                    <button
                      onClick={() => handleCancelClick(sub.id)}
                      disabled={cancellingId === sub.id}
                      className="btn-danger"
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.85rem' }}
                    >
                      <Trash2 size={14} />
                      {cancellingId === sub.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>

              {/* State Machine Stepper */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  On-Chain Lifecycle State Machine
                </span>
                <LifecycleStepper currentState={sub.state} />
              </div>

              {/* On-Chain Commitment Display */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Shielded On-Chain Commitment (H(secret, planId))
                </span>
                <div className="hash-block">
                  {sub.subscriberCommitment}
                </div>
              </div>

              {/* Invoices and Billing History */}
              {sub.invoices && sub.invoices.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Fiat Settlement History & Receipts:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {sub.invoices.map((inv) => (
                      <div key={inv.invoiceId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8125rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={14} color="var(--accent-secondary)" />
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{inv.invoiceId}</span>
                          <span style={{ color: 'var(--text-muted)' }}>— Cycle #{inv.cycle}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>${(inv.amountCents / 100).toFixed(2)} USD</span>
                          <span className={`badge ${inv.status === 'SUCCEEDED' ? 'badge-active' : 'badge-cancelled'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
