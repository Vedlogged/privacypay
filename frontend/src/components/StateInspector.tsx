'use client';

import React, { useState } from 'react';
import { Database, Lock, Shield, Hash, RefreshCw, UserCheck, ExternalLink, Copy, Check } from 'lucide-react';
import { ContractLedgerState, SubscriptionState } from '@privacy-pay/contract';
import { PrivacyBadge } from './PrivacyBadge';
import { PREPROD_NETWORK_CONFIG } from '../lib/midnight-connector';

interface StateInspectorProps {
  ledgerState: ContractLedgerState;
  secret: string | null;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ ledgerState, secret }) => {
  const [copied, setCopied] = useState(false);

  const copyContract = () => {
    navigator.clipboard.writeText(PREPROD_NETWORK_CONFIG.defaultContractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (state: SubscriptionState) => {
    switch (state) {
      case SubscriptionState.ACTIVE:
        return <span className="badge badge-active">ACTIVE</span>;
      case SubscriptionState.PAID:
        return <span className="badge badge-active">PAID</span>;
      case SubscriptionState.AUTHORIZED:
        return <span className="badge badge-privacy">AUTHORIZED</span>;
      case SubscriptionState.BILLING_DUE:
      case SubscriptionState.PROCESSING:
        return <span className="badge badge-privacy">{state}</span>;
      case SubscriptionState.NEXT_CYCLE:
        return <span className="badge badge-active">NEXT_CYCLE</span>;
      case SubscriptionState.CANCELLED:
        return <span className="badge badge-cancelled">CANCELLED</span>;
      case SubscriptionState.PAST_DUE:
      case SubscriptionState.FAILED:
        return <span className="badge badge-cancelled">{state}</span>;
      case SubscriptionState.CREATED:
      default:
        return <span className="badge badge-inactive">{state || 'CREATED'}</span>;
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
        {/* Deployed Contract Address on Preprod */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '0.85rem 1rem',
          borderRadius: '0.625rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Midnight Preprod Contract Address
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={copyContract}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.375rem',
                  color: copied ? 'var(--accent-success)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={`https://midnight-preprod.subscan.io/contract/${PREPROD_NETWORK_CONFIG.defaultContractAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#38bdf8',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={11} />
                Subscan Explorer
              </a>
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
            fontWeight: 500
          }}>
            {PREPROD_NETWORK_CONFIG.defaultContractAddress}
          </div>
        </div>

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

        {/* Merchant Address & Cycle Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Merchant Address
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {ledgerState.merchantAddress.slice(0, 10)}...{ledgerState.merchantAddress.slice(-6)}
            </span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Billing Cycle Count
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
              Cycle #{ledgerState.cycleCount ? ledgerState.cycleCount.toString() : '0'}
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
              Replay protection & transition counter
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
                Client-Side Secret (Witness Preimage)
              </span>
            </div>
            <PrivacyBadge type="PRIVATE" label="Held in Client Memory" />
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
