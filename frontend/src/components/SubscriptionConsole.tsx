'use client';

import React from 'react';
import { Terminal, ShieldAlert, CheckCircle, Clock, Trash2, Cpu } from 'lucide-react';
import { SubscriptionLogEntry } from '../lib/subscription-client';
import { SubscriptionState } from '@privacy-pay/contract';

interface SubscriptionConsoleProps {
  logs: SubscriptionLogEntry[];
  currentState: SubscriptionState;
  onCancel: () => void;
  isLoading: boolean;
}

export const SubscriptionConsole: React.FC<SubscriptionConsoleProps> = ({
  logs,
  currentState,
  onCancel,
  isLoading
}) => {
  const getLogIcon = (type: SubscriptionLogEntry['type']) => {
    switch (type) {
      case 'ACTION':
        return <Cpu size={14} color="var(--accent-secondary)" />;
      case 'PROOF':
        return <CheckCircle size={14} color="var(--accent-success)" />;
      case 'ERROR':
        return <ShieldAlert size={14} color="var(--accent-danger)" />;
      case 'INFO':
      default:
        return <Clock size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Terminal size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Compact Circuit & Witness Log</h3>
        </div>

        {currentState === SubscriptionState.ACTIVE && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-danger"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
          >
            <Trash2 size={14} />
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Terminal log window */}
      <div style={{
        flex: 1,
        minHeight: '260px',
        maxHeight: '340px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.625rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
            No contract interactions recorded yet. Click &quot;Authorize Subscription&quot; to begin.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', lineHeight: '1.5' }}>
              <div style={{ marginTop: '3px', flexShrink: 0 }}>
                {getLogIcon(log.type)}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.75rem' }}>
                  [{log.timestamp}]
                </span>
                <span style={{
                  color: log.type === 'ERROR' ? '#fca5a5' : (log.type === 'PROOF' ? '#86efac' : 'var(--text-primary)')
                }}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
