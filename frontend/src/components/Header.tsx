'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wallet, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectMidnightWallet, connectMidnightWallet, MidnightWalletState } from '../lib/midnight-connector';

export const Header: React.FC = () => {
  const [wallet, setWallet] = useState<MidnightWalletState>({
    isInstalled: false,
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    detectMidnightWallet().then(setWallet);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    const updated = await connectMidnightWallet();
    setWallet(updated);
    setIsConnecting(false);
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.625rem',
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PrivacyPay</span>
              <span className="badge badge-privacy" style={{ fontSize: '0.65rem' }}>Level 1: New Moon</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Midnight Network SaaS Protocol</p>
          </div>
        </div>

        {/* Navigation / Wallet Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: wallet.isConnected ? 'var(--accent-success)' : (wallet.isInstalled ? 'var(--accent-warning)' : 'var(--text-muted)')
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              {wallet.isInstalled ? 'Lace Wallet Ready' : 'Lace Wallet Simulated'}
            </span>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || wallet.isConnected}
            className={wallet.isConnected ? 'btn-secondary' : 'btn-primary'}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Connecting...
              </>
            ) : wallet.isConnected ? (
              <>
                <CheckCircle2 size={14} color="var(--accent-success)" />
                Connected
              </>
            ) : (
              <>
                <Wallet size={14} />
                Connect Lace
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
