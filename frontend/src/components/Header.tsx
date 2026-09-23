'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wallet, RefreshCw, CheckCircle2, LogOut, Copy, ExternalLink, Globe } from 'lucide-react';
import {
  detectMidnightWallet,
  connectMidnightWallet,
  disconnectMidnightWallet,
  truncateAddress,
  MidnightWalletState,
  PREPROD_NETWORK_CONFIG
} from '../lib/midnight-connector';

export const Header: React.FC = () => {
  const [wallet, setWallet] = useState<MidnightWalletState>({
    isInstalled: false,
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    detectMidnightWallet().then(setWallet);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    const updated = await connectMidnightWallet();
    setWallet(updated);
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    const updated = await disconnectMidnightWallet();
    setWallet(updated);
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.75rem' }}>
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
              <span className="badge badge-privacy" style={{ fontSize: '0.65rem' }}>Level 1-3 Production dApp</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Midnight Network SaaS Subscription Protocol
            </p>
          </div>
        </div>

        {/* Navigation / Wallet Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Network Indicator Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem'
          }}>
            <Globe size={12} color="#38bdf8" />
            <span style={{ color: 'var(--text-secondary)' }}>Preprod Testnet</span>
          </div>

          {/* Connected Address Display & Disconnect Controls */}
          {wallet.isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Unshielded Address Pill */}
              <div
                onClick={handleCopyAddress}
                title={`Click to copy address: ${wallet.address}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-success)',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }} />
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-success)' }}>
                  {truncateAddress(wallet.address)}
                </span>
                <Copy size={12} color={copied ? 'var(--accent-success)' : 'var(--text-muted)'} />
                {copied && <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>Copied!</span>}
              </div>

              {/* Balances Pill */}
              {wallet.dustBalance && (
                <div style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  <span>{wallet.dustBalance}</span>
                </div>
              )}

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="btn-secondary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-danger)'
                }}
                title="Disconnect Lace Wallet"
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: wallet.isInstalled ? 'var(--accent-warning)' : 'var(--text-muted)'
                }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {wallet.isInstalled ? 'Lace Detected' : 'Lace DApp Ready'}
                </span>
              </div>

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.45rem 1rem' }}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={14} />
                    Connect Lace
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
