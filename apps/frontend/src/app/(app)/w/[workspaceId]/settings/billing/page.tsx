'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { CreditCard, TrendingUp, Package, ExternalLink, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  runsPerMonth: number;
  maxWorkflows: number;
  maxMembers: number;
  features: any;
}

interface Usage {
  current: {
    runs: number;
    nodeExecutions: number;
    apiCalls: number;
  };
  limits: {
    runs: number;
    workflows: number;
    members: number;
  };
  percentUsed: {
    runs: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export default function BillingPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [workspaceId]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [plansRes, usageRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: Plan[] }>('/api/saas-billing/plans'),
        apiClient.get<{ success: boolean; data: Usage }>(
          `/api/saas-billing/usage?workspaceId=${workspaceId}`
        ),
      ]);

      setPlans(plansRes.data);
      setUsage(usageRes.data);
      
      // Find current plan (you'd get this from workspace data)
      const freePlan = plansRes.data.find((p) => p.slug === 'free');
      setCurrentPlan(freePlan || null);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
        '/api/saas-billing/checkout',
        {
          planId,
          workspaceId,
          successUrl: `${window.location.origin}/w/${workspaceId}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/w/${workspaceId}/settings/billing`,
        }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
        '/api/saas-billing/portal',
        {
          workspaceId,
          returnUrl: `${window.location.origin}/w/${workspaceId}/settings/billing`,
        }
      );

      window.location.href = response.data.url;
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-48 bg-white/10 rounded-xl"></div>
          <div className="h-96 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Usage</h1>
        <p className="text-white/70">
          Manage your subscription and view usage statistics
        </p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-400 text-sm font-semibold mb-1">Current Plan</div>
              <h2 className="text-white text-2xl font-bold mb-1">{currentPlan.name}</h2>
              <p className="text-white/70">
                ${currentPlan.priceMonthly}/month
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Manage Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm">Runs This Month</div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-white text-3xl font-bold mb-2">
              {usage.current.runs}
            </div>
            <div className="text-white/50 text-sm">
              of {usage.limits.runs === -1 ? '∞' : usage.limits.runs} limit
            </div>
            {usage.limits.runs !== -1 && (
              <div className="mt-4">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${Math.min(usage.percentUsed.runs, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm">Node Executions</div>
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-white text-3xl font-bold mb-2">
              {usage.current.nodeExecutions.toLocaleString()}
            </div>
            <div className="text-white/50 text-sm">
              Total this month
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm">API Calls</div>
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-white text-3xl font-bold mb-2">
              {usage.current.apiCalls.toLocaleString()}
            </div>
            <div className="text-white/50 text-sm">
              Total this month
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const features = plan.features || {};

            return (
              <div
                key={plan.id}
                className={`bg-white/5 backdrop-blur-lg p-6 rounded-xl border transition ${
                  isCurrentPlan
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-purple-500/50'
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-white/70 mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-lg">/month</span>
                  </div>
                  {isCurrentPlan && (
                    <div className="text-purple-400 text-sm font-semibold">
                      Current Plan
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>
                      {plan.runsPerMonth === -1 ? 'Unlimited' : plan.runsPerMonth.toLocaleString()} runs/month
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>
                      {plan.maxWorkflows === -1 ? 'Unlimited' : plan.maxWorkflows} workflows
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>
                      {plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers} team {plan.maxMembers === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  {features.smartSearch && (
                    <div className="flex items-center space-x-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>AI-powered search</span>
                    </div>
                  )}
                  {features.apiAccess && (
                    <div className="flex items-center space-x-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>API access</span>
                    </div>
                  )}
                </div>

                {!isCurrentPlan && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {upgrading ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

