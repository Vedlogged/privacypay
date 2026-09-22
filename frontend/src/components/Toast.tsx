'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      zIndex: 200,
      maxWidth: '380px'
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${
            toast.type === 'SUCCESS' ? 'rgba(16, 185, 129, 0.4)' : (
              toast.type === 'ERROR' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'
            )
          }`,
          boxShadow: 'var(--shadow-card)',
          borderRadius: '0.75rem',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          animation: 'pulse-glow 0.3s ease'
        }}>
          <div style={{ marginTop: '2px' }}>
            {toast.type === 'SUCCESS' && <CheckCircle2 size={18} color="var(--accent-success)" />}
            {toast.type === 'ERROR' && <AlertCircle size={18} color="var(--accent-danger)" />}
            {toast.type === 'INFO' && <Info size={18} color="var(--accent-secondary)" />}
          </div>

          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
              {toast.title}
            </h5>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
