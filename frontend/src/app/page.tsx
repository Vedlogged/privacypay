'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PlanCard } from '../components/PlanCard';
import { StateInspector } from '../components/StateInspector';
import { SubscriptionConsole } from '../components/SubscriptionConsole';
import { CustomerPortal } from '../components/CustomerPortal';
import { MerchantPortal } from '../components/MerchantPortal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { SubscriptionClient, SubscriptionLogEntry } from '../lib/subscription-client';
import { ContractLedgerState, SubscriptionState } from '@privacy-pay/contract';
import { SaaSProduct, SaaSPlan } from '../lib/store';
import { Sparkles, Layers, Shield, User, Building, Database, Zap, Cpu, Lock, CreditCard } from 'lucide-react';

export default function Home() {
  const client = useMemo(() => new SubscriptionClient(101n), []);
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'CUSTOMER' | 'MERCHANT' | 'INSPECTOR'>('EXPLORE');

  // Products & Plans State
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Subscriptions & Simulator State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [ledgerState, setLedgerState] = useState<ContractLedgerState>({
    state: SubscriptionState.CREATED,
    activePlanId: 101n,
    merchantAddress: '0x' + '1'.repeat(64),
    subscriberCommitment: '0x' + '0'.repeat(64),
    sequenceNumber: 1n,
    cycleCount: 0n
  });
  const [logs, setLogs] = useState<SubscriptionLogEntry[]>([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch data
  const fetchData = async () => {
    try {
      const [prodRes, planRes, subRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/plans').then((r) => r.json()),
        fetch('/api/subscriptions').then((r) => r.json())
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        if (!selectedProductId && prodRes.data.length > 0) {
          setSelectedProductId(prodRes.data[0].id);
        }
      }
      if (planRes.success) setPlans(planRes.data);
      if (subRes.success) setSubscriptions(subRes.data);
    } catch (err) {
      console.error('Failed to fetch store data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = client.subscribe((state, newLogs) => {
      setLedgerState(state);
      setLogs(newLogs);
      setSecret(client.getCurrentSecret());
    });
    return () => unsubscribe();
  }, [client]);

  // Subscribe flow
  const handleSubscribe = async (planId: bigint) => {
    setIsLoading(true);
    try {
      const authResult = await client.authorizeSubscription(planId);
      
      // Also persist to API
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planIdNumeric: planId.toString(),
          customSecret: client.getCurrentSecret()
        })
      });
      const data = await res.json();

      if (data.success) {
        addToast('SUCCESS', 'Subscription Authorized & Active!', `Commitment: ${data.data.subscriberCommitment.slice(0, 18)}...`);
        fetchData();
      }
    } catch (err: any) {
      addToast('ERROR', 'Authorization Failed', err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel flow from Customer Portal
  const handleCancel = async (subId?: string) => {
    setIsLoading(true);
    try {
      await client.cancelSubscription();
      if (subId) {
        await fetch(`/api/subscriptions/${subId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: client.getCurrentSecret() })
        });
      }
      addToast('INFO', 'Subscription Cancelled', 'On-chain commitment marked CANCELLED with witness proof.');
      fetchData();
    } catch (err: any) {
      addToast('ERROR', 'Cancellation Failed', err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Billing Cycle from Merchant Portal
  const handleTriggerCycle = async (subId: string, outcome: 'SUCCESS' | 'FAILURE') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId, outcome })
      });
      const data = await res.json();
      if (data.success) {
        if (outcome === 'SUCCESS') {
          addToast('SUCCESS', `Billing Cycle #${data.data.cycleCount} Succeeded!`, 'Fiat invoice confirmed and on-chain state advanced.');
        } else {
          addToast('ERROR', 'Payment Declined', 'Subscription marked PAST_DUE on-chain.');
        }
        fetchData();
      } else {
        addToast('ERROR', 'Billing Failed', data.error);
      }
    } catch (err: any) {
      addToast('ERROR', 'Billing Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Product
  const handleAddProduct = async (prod: { name: string; description: string; category: string }) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod)
    });
    const data = await res.json();
    if (data.success) {
      addToast('SUCCESS', 'Product Added', `Created ${prod.name}`);
      fetchData();
    }
  };

  // Add Plan
  const handleAddPlan = async (plan: { productId: string; name: string; priceUsd: number; cadence: 'month' | 'year'; features: string[] }) => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    const data = await res.json();
    if (data.success) {
      addToast('SUCCESS', 'Plan Published', `Created tier ${plan.name} at $${plan.priceUsd}/mo`);
      fetchData();
    }
  };

  const filteredPlans = useMemo(() => {
    if (!selectedProductId) return plans;
    return plans.filter((p) => p.productId === selectedProductId);
  }, [plans, selectedProductId]);

  return (
    <main className="container main-content">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto 1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="badge badge-privacy">
            <Sparkles size={12} />
            Midnight Monthly Moonshots • Level 1-3 Production dApp
          </span>
        </div>
        <h1 className="hero-title">
          Privacy-First SaaS Subscriptions with{' '}
          <span className="hero-gradient-text">Fiat-Friendly Payments</span>
        </h1>
        <p className="hero-subtitle" style={{ margin: '0 auto 1.5rem' }}>
          An end-to-end infrastructure bringing zero-knowledge subscription authorization, recurring billing state machines, and multi-role portals to the Midnight blockchain.
        </p>

        {/* Multi-Tab Navigation Bar */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '0.35rem',
          borderRadius: '0.85rem',
          border: '1px solid var(--border-subtle)',
          gap: '0.35rem',
          boxShadow: 'var(--shadow-card)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={activeTab === 'EXPLORE' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}
          >
            <Zap size={14} />
            Explore & Subscribe
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMER')}
            className={activeTab === 'CUSTOMER' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}
          >
            <User size={14} />
            Customer Portal ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('MERCHANT')}
            className={activeTab === 'MERCHANT' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}
          >
            <Building size={14} />
            Merchant Suite
          </button>
          <button
            onClick={() => setActiveTab('INSPECTOR')}
            className={activeTab === 'INSPECTOR' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}
          >
            <Database size={14} />
            Midnight Inspector
          </button>
        </div>
      </section>

      {/* TAB 1: EXPLORE & SUBSCRIBE */}
      {activeTab === 'EXPLORE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Product Selector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Privacy SaaS Services</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Select a service to view its pricing tiers and authorize a privacy-preserving subscription.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {products.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={selectedProductId === prod.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
                >
                  {prod.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid-2">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                planId={BigInt(plan.planIdNumeric)}
                name={plan.name}
                price={`$${plan.priceUsd}`}
                cadence={plan.cadence}
                description={
                  products.find((p) => p.id === plan.productId)?.description ||
                  'Enterprise privacy subscription with verifiable on-chain commitments.'
                }
                features={plan.features}
                isActive={ledgerState.state === SubscriptionState.ACTIVE && ledgerState.activePlanId === BigInt(plan.planIdNumeric)}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Real-Time Circuit Execution Console */}
          <section style={{ width: '100%' }}>
            <SubscriptionConsole
              logs={logs}
              currentState={ledgerState.state}
              onCancel={() => handleCancel()}
              isLoading={isLoading}
            />
          </section>
        </div>
      )}

      {/* TAB 2: CUSTOMER PORTAL */}
      {activeTab === 'CUSTOMER' && (
        <CustomerPortal
          subscriptions={subscriptions}
          onCancel={handleCancel}
          onRefresh={fetchData}
          isLoading={isLoading}
        />
      )}

      {/* TAB 3: MERCHANT PORTAL */}
      {activeTab === 'MERCHANT' && (
        <MerchantPortal
          products={products}
          plans={plans}
          subscriptions={subscriptions}
          onAddProduct={handleAddProduct}
          onAddPlan={handleAddPlan}
          onTriggerCycle={handleTriggerCycle}
          onRefresh={fetchData}
          isLoading={isLoading}
        />
      )}

      {/* TAB 4: MIDNIGHT LEDGER INSPECTOR */}
      {activeTab === 'INSPECTOR' && (
        <div className="grid-2">
          <div>
            <StateInspector ledgerState={ledgerState} secret={secret} />
          </div>
          <div>
            <SubscriptionConsole
              logs={logs}
              currentState={ledgerState.state}
              onCancel={() => handleCancel()}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Architectural Explainer Grid */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-secondary)" />
          PrivacyPay Architectural Separation
        </h2>

        <div className="grid-3">
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Lock size={18} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>1. Private Witness Secrets</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Subscribers generate private 256-bit entropy values locally. Secrets are never exposed on-chain and are used as witness inputs to prove subscription ownership.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Shield size={18} color="var(--accent-success)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>2. Zero-Knowledge Commitments</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              The Compact circuit verifies <code style={{ color: '#38bdf8' }}>H(secret, planId)</code> and writes the cryptographic commitment to the Midnight public ledger, ensuring privacy.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CreditCard size={18} color="var(--accent-secondary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>3. Off-Chain Fiat Billing</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Card numbers and banking credentials remain with PCI-compliant payment gateways. Zero financial credentials touch the Midnight smart contract layer.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
