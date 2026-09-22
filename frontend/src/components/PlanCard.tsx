'use client';

import React from 'react';
import { Check, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { PrivacyBadge } from './PrivacyBadge';

interface PlanCardProps {
  planId: bigint;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  isActive: boolean;
  onSubscribe: (planId: bigint) => void;
  isLoading: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  planId,
  name,
  price,
  cadence,
  description,
  features,
  isActive,
  onSubscribe,
  isLoading
}) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Glow highlight */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Example SaaS Tier
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{name}</h3>
        </div>
        <PrivacyBadge type="PUBLIC" label={`Plan #${planId}`} />
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', minHeight: '2.8rem' }}>
        {description}
      </p>

      {/* Pricing Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{price}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>/ {cadence}</span>
      </div>

      {/* Features List */}
      <div style={{ flex: 1, marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          INCLUDED CAPABILITIES:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {features.map((feature, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Check size={12} color="var(--accent-success)" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSubscribe(planId)}
        disabled={isActive || isLoading}
        className={isActive ? 'btn-secondary' : 'btn-primary'}
        style={{ width: '100%', padding: '0.875rem' }}
      >
        {isActive ? (
          <>
            <ShieldCheck size={16} color="var(--accent-success)" />
            Subscription Active
          </>
        ) : isLoading ? (
          'Computing ZK Proof...'
        ) : (
          <>
            <Zap size={16} />
            Authorize Subscription
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
};
