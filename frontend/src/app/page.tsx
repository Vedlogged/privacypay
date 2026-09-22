'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PlanCard } from '../components/PlanCard';
import { StateInspector } from '../components/StateInspector';
import { SubscriptionConsole } from '../components/SubscriptionConsole';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { SubscriptionClient, SubscriptionLogEntry } from '../lib/subscription-client';
import { ContractLedgerState, SubscriptionState } from '@privacy-pay/contract';
import { Shield, Sparkles, Lock, CreditCard, Cpu, Layers } from 'lucide-react';

export default function Home() {
  const client = useMemo(() => new SubscriptionClient(101n), []);
  const [ledgerState, setLedgerState] = useState<ContractLedgerState>({
    state: SubscriptionState.INACTIVE,
    activePlanId: 101n,
    subscriberCommitment: '0x' + '0'.repeat(64),
    sequenceNumber: 1n
  });
  const [logs, setLogs] = useState<SubscriptionLogEntry[]>([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = client.subscribe((state, newLogs) => {
      setLedgerState(state);
      setLogs(newLogs);
      setSecret(client.getCurrentSecret());
    });
    return () => unsubscribe();
  }, [client]);

  const handleSubscribe = async (planId: bigint) => {
    setIsLoading(true);
    try {
      await client.authorizeSubscription(planId);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await client.cancelSubscription();
    } catch (err) {
      console.error('Cancellation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container main-content">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="badge badge-privacy">
            <Sparkles size={12} />
            Midnight Monthly Moonshots • Level 1 (New Moon)
          </span>
        </div>
        <h1 className="hero-title">
          Privacy-First SaaS Subscriptions with{' '}
          <span className="hero-gradient-text">Fiat-Friendly Payments</span>
        </h1>
        <p className="hero-subtitle" style={{ margin: '0 auto 2rem' }}>
          PrivacyPay combines zero-knowledge subscription authorizations on Midnight with seamless fiat payment rails. Experience the Level 1 Compact state machine in action.
        </p>
      </section>

      {/* Main Interactive Grid */}
      <div className="grid-2">
        {/* Left Column: SaaS Plan Preview */}
        <div>
          <PlanCard
            planId={101n}
            name="PrivacyPay Pro SaaS"
            price="$29"
            cadence="month"
            description="Full-featured enterprise SaaS plan with privacy-preserving recurring authorization and automated fiat billing."
            features={[
              'Zero-knowledge subscription commitment on Midnight',
              'Off-chain client witness secret generation',
              'Non-custodial cryptographic access control',
              'Fiat billing abstraction (Zero gas complexity)',
              'Verifiable on-chain lifecycle transitions'
            ]}
            isActive={ledgerState.state === SubscriptionState.ACTIVE}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Live Ledger State Inspector */}
        <div>
          <StateInspector ledgerState={ledgerState} secret={secret} />
        </div>
      </div>

      {/* Execution Console & Live Circuit Logs */}
      <section style={{ width: '100%' }}>
        <SubscriptionConsole
          logs={logs}
          currentState={ledgerState.state}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </section>

      {/* Architectural Explainer Grid */}
      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-secondary)" />
          How PrivacyPay Utilizes Midnight
        </h2>

        <div className="grid-3">
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Lock size={18} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>1. Private Witness Secrets</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              The customer generates a 256-bit private secret strictly on their client. This secret never leaves local memory and is injected into Compact circuits as an off-chain witness.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Shield size={18} color="var(--accent-success)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>2. On-Chain Commitments</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Compact computes <code style={{ color: '#38bdf8' }}>H(secret, planId)</code> and selectively discloses only the hash commitment to the Midnight public ledger, protecting customer identity.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CreditCard size={18} color="var(--accent-secondary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>3. Fiat Rails Separation</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Credit cards and banking details are processed exclusively through PCI-compliant fiat gateways off-chain, ensuring zero financial credentials ever enter the blockchain.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
