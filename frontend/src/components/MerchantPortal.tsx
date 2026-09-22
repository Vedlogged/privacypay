'use client';

import React, { useState } from 'react';
import { Plus, DollarSign, Users, Package, RefreshCw, Zap, Play, CheckCircle2, AlertCircle, Key, Link as LinkIcon } from 'lucide-react';
import { SaaSProduct, SaaSPlan } from '@/lib/store';
import { PrivacyBadge } from './PrivacyBadge';
import { SubscriptionState } from '@privacy-pay/contract';

interface MerchantPortalProps {
  products: SaaSProduct[];
  plans: SaaSPlan[];
  subscriptions: any[];
  onAddProduct: (prod: { name: string; description: string; category: string }) => Promise<void>;
  onAddPlan: (plan: { productId: string; name: string; priceUsd: number; cadence: 'month' | 'year'; features: string[] }) => Promise<void>;
  onTriggerCycle: (subId: string, outcome: 'SUCCESS' | 'FAILURE') => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MerchantPortal: React.FC<MerchantPortalProps> = ({
  products,
  plans,
  subscriptions,
  onAddProduct,
  onAddPlan,
  onTriggerCycle,
  onRefresh,
  isLoading
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [processingSubId, setProcessingSubId] = useState<string | null>(null);

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Security & Privacy');

  const [planProductId, setPlanProductId] = useState(products[0]?.id || '');
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(39);
  const [planFeatures, setPlanFeatures] = useState('ZK Authorization, Priority Settlement, 24/7 SLA');

  // Compute metrics
  const activeSubs = subscriptions.filter(s => s.state !== SubscriptionState.CANCELLED);
  const mrr = activeSubs.reduce((acc, sub) => {
    const plan = plans.find(p => p.planIdNumeric === sub.planId);
    return acc + (plan ? plan.priceUsd : 29);
  }, 0);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodDesc) return;
    await onAddProduct({ name: prodName, description: prodDesc, category: prodCategory });
    setProdName('');
    setProdDesc('');
    setShowProductModal(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planProductId) return;
    await onAddPlan({
      productId: planProductId,
      name: planName,
      priceUsd: Number(planPrice),
      cadence: 'month',
      features: planFeatures.split(',').map(f => f.trim())
    });
    setPlanName('');
    setShowPlanModal(false);
  };

  const handleTriggerBilling = async (subId: string, outcome: 'SUCCESS' | 'FAILURE') => {
    setProcessingSubId(subId);
    try {
      await onTriggerCycle(subId, outcome);
    } finally {
      setProcessingSubId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Merchant Management Suite</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Configure SaaS offerings, view on-chain subscriber commitments, and trigger automated recurring billing cycles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowProductModal(true)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
            <Plus size={14} />
            New Product
          </button>
          <button onClick={() => setShowPlanModal(true)} className="btn-primary" style={{ fontSize: '0.875rem' }}>
            <Plus size={14} />
            New Plan
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <DollarSign size={24} color="var(--accent-success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Recurring Revenue (MRR)
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>${mrr.toLocaleString()} USD</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.75rem',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Users size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Subscribers
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{activeSubs.length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.75rem',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <Package size={24} color="var(--accent-secondary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Products & Plans
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{products.length} / {plans.length}</h3>
          </div>
        </div>
      </div>

      {/* Subscriber Records Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Midnight Subscriptions</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Real-time on-chain subscriber commitments and cycle execution controls.
            </p>
          </div>

          <button onClick={onRefresh} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Refresh Table
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No subscriptions authorized yet. Visit the Explore tab to simulate customer subscription.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Sub ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Plan Tier</th>
                  <th style={{ padding: '0.75rem 1rem' }}>On-Chain Commitment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cycle</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Engine Trigger</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const plan = plans.find(p => p.planIdNumeric === sub.planId);
                  const isBusy = processingSubId === sub.id;

                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        {sub.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 600 }}>{plan ? plan.name : `Plan #${sub.planId}`}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          ${plan ? plan.priceUsd : 29}/mo
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
                        {sub.subscriberCommitment.slice(0, 16)}...{sub.subscriberCommitment.slice(-8)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                        #{sub.cycleCount}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${
                          sub.state === SubscriptionState.ACTIVE ? 'badge-active' : (
                            sub.state === SubscriptionState.CANCELLED ? 'badge-cancelled' : 'badge-privacy'
                          )
                        }`}>
                          {sub.state}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {sub.state !== SubscriptionState.CANCELLED && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleTriggerBilling(sub.id, 'SUCCESS')}
                              disabled={isBusy}
                              className="btn-primary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                              title="Simulate recurring fiat payment & advance on-chain cycle"
                            >
                              <Play size={12} />
                              Charge Cycle
                            </button>
                            <button
                              onClick={() => handleTriggerBilling(sub.id, 'FAILURE')}
                              disabled={isBusy}
                              className="btn-danger"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                              title="Simulate fiat payment decline"
                            >
                              Fail
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Creation Modal */}
      {showProductModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Add SaaS Product</h3>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. ZeroTrace Analytics"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  placeholder="e.g. Developer Tools"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe your privacy-preserving service..."
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Creation Modal */}
      {showPlanModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Create Pricing Plan</h3>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Select Product
                </label>
                <select
                  value={planProductId}
                  onChange={(e) => setPlanProductId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} style={{ background: '#0b1120' }}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Plan Tier Name
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Enterprise Tier"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Price (USD / Month)
                </label>
                <input
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  min={1}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowPlanModal(false)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
