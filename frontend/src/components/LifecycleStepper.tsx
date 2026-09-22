'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { SubscriptionState } from '@privacy-pay/contract';

interface LifecycleStepperProps {
  currentState: SubscriptionState;
}

const PRIMARY_STEPS = [
  { key: SubscriptionState.CREATED, label: 'Created', desc: 'Plan Selected' },
  { key: SubscriptionState.AUTHORIZED, label: 'Authorized', desc: 'ZK Commitment Bound' },
  { key: SubscriptionState.ACTIVE, label: 'Active', desc: 'Fiat Settled' },
  { key: SubscriptionState.BILLING_DUE, label: 'Billing Due', desc: 'Cycle Approaching' },
  { key: SubscriptionState.PROCESSING, label: 'Processing', desc: 'Recurring Charge' },
  { key: SubscriptionState.PAID, label: 'Paid', desc: 'Invoice Generated' },
  { key: SubscriptionState.NEXT_CYCLE, label: 'Next Cycle', desc: 'Advanced On-Chain' }
];

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ currentState }) => {
  const isCancelled = currentState === SubscriptionState.CANCELLED;
  const isPastDue = currentState === SubscriptionState.PAST_DUE;
  const isFailed = currentState === SubscriptionState.FAILED;

  const getStepIndex = (state: SubscriptionState) => {
    switch (state) {
      case SubscriptionState.CREATED: return 0;
      case SubscriptionState.AUTHORIZED: return 1;
      case SubscriptionState.ACTIVE: return 2;
      case SubscriptionState.BILLING_DUE: return 3;
      case SubscriptionState.PROCESSING: return 4;
      case SubscriptionState.PAID: return 5;
      case SubscriptionState.NEXT_CYCLE: return 6;
      default: return 2;
    }
  };

  const currentIndex = getStepIndex(currentState);

  if (isCancelled || isPastDue || isFailed) {
    return (
      <div style={{
        background: isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        padding: '1rem',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        {isCancelled ? <XCircle color="var(--accent-danger)" size={24} /> : <AlertTriangle color="var(--accent-warning)" size={24} />}
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: isCancelled ? '#fca5a5' : '#fde68a' }}>
            Subscription Status: {currentState}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {isCancelled
              ? 'This subscription has been permanently cancelled by the commitment owner.'
              : 'Payment collection requires customer attention or retry.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '640px', justifyContent: 'space-between', position: 'relative' }}>
        {PRIMARY_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isCurrent
                    ? 'var(--gradient-accent)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isCompleted
                    ? '1px solid var(--accent-success)'
                    : isCurrent
                    ? '2px solid #ffffff'
                    : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'var(--accent-success)' : (isCurrent ? '#ffffff' : 'var(--text-muted)'),
                  boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Clock size={16} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{idx + 1}</span>
                  )}
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  marginTop: '0.35rem',
                  color: isCurrent ? 'var(--text-primary)' : (isCompleted ? '#a7f3d0' : 'var(--text-muted)')
                }}>
                  {step.label}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{step.desc}</span>
              </div>

              {idx < PRIMARY_STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: idx < currentIndex ? 'var(--accent-success)' : 'var(--border-subtle)',
                  margin: '0 0.5rem',
                  marginBottom: '1.25rem',
                  zIndex: 1,
                  transition: 'background 0.3s ease'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
