'use client';

import React from 'react';
import { Database, Lock, Shield, Hash, RefreshCw } from 'lucide-react';
import { ContractLedgerState, SubscriptionState } from '@privacy-pay/contract';
import { PrivacyBadge } from './PrivacyBadge';

interface StateInspectorProps {
  ledgerState: ContractLedgerState;
  secret: string | null;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ ledgerState, secret }) => {
  const getStatusBadge = (state: SubscriptionState) => {
    switch (state) {
      case SubscriptionState.ACTIVE:
        return <span className="badge badge-active">ACTIVE</span>;
      case SubscriptionState.CANCELLED:
        return <span className="badge badge-cancelled">CANCELLED</span>;
      case SubscriptionState.INACTIVE:
      default:
        return <span className="badge badge-inactive">INACTIVE</span>;
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Database size={20} color="var(--accent-secondary)" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Midnight On-Chain Ledger State</h3>
        </div>
        <PrivacyBadge type="PUBLIC" label="Public Verifiable" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Subscription Status & Plan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Subscription State
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusBadge(ledgerState.state)}
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Active Plan ID
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              #{ledgerState.activePlanId.toString()}
            </span>
          </div>
        </div>

        {/* Subscriber Commitment */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Subscriber Commitment (H(secret, planId))
            </span>
            <PrivacyBadge type="DERIVED" label="Zero-Knowledge Hash" />
          </div>
          <div className="hash-block">
            {ledgerState.subscriberCommitment}
          </div>
        </div>

        {/* Sequence Number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>
              Ledger Sequence Counter
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Replay protection counter
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
            v{ledgerState.sequenceNumber.toString()}
          </span>
        </div>

        {/* Client Private Witness State */}
        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Client-Side Secret (Witness)
              </span>
            </div>
            <PrivacyBadge type="PRIVATE" label="Never Sent On-Chain" />
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '0.6rem 0.85rem',
            borderRadius: '0.5rem',
            color: '#a5b4fc',
            wordBreak: 'break-all'
          }}>
            {secret ? (
              `${secret.slice(0, 18)}••••••••••••••••••••••••••••${secret.slice(-8)}`
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active subscriber secret generated yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
