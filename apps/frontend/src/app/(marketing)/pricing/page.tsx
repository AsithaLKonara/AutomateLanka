'use client';

import React, { useState, useEffect } from 'react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceMonthly: number;
    priceYearly: number;
    runsPerMonth: number;
    maxWorkflows: number;
    maxMembers: number;
    features: string;
}

const pricingTiers = [
    {
        name: 'Free',
        slug: 'free',
        description: 'Perfect for exploring and small personal projects.',
        features: [
            '5 active workflows',
            '100 executions / month',
            'Standard AI Search',
            'Community Support',
            'Public Marketplace access'
        ],
        cta: 'Get Started',
        popular: false
    },
    {
        name: 'Pro',
        slug: 'pro',
        description: 'Advanced features for power users and growing teams.',
        features: [
            '100 active workflows',
            '10,000 executions / month',
            'Priority AI Search',
            'Email Support',
            'Private workflow sharing',
            'Advanced Analytics'
        ],
        cta: 'Start Now',
        popular: true
    },
    {
        name: 'Business',
        slug: 'business',
        description: 'Scalable automation for large-scale operations.',
        features: [
            'Unlimited active workflows',
            '100,000 executions / month',
            '24/7 Priority Support',
            'SLA & Security Audit',
            'Custom integrations',
            'Audit logging & Compliance'
        ],
        cta: 'Go Enterprise',
        popular: false
    }
];

export default function PricingPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get<{ success: boolean, data: Plan[] }>('/api/saas-billing/plans');
                if (response.success) {
                    setPlans(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            }
        };

        fetchPlans();
    }, []);

    const handleUpgrade = async (planSlug: string) => {
        if (!isAuthenticated) {
            router.push(`/signup?plan=${planSlug}`);
            return;
        }

        if (planSlug === 'free') {
            router.push('/dashboard');
            return;
        }

        const plan = plans.find(p => p.slug === planSlug);
        if (!plan) return;

        setLoading(planSlug);
        try {
            const workspaceId = localStorage.getItem('workspaceId');
            const response = await apiClient.post<{ success: boolean, data: { url: string } }>('/api/saas-billing/checkout', {
                planId: plan.id,
                workspaceId,
                successUrl: `${window.location.origin}/dashboard?checkout=success`,
                cancelUrl: `${window.location.origin}/pricing?checkout=cancel`,
            });

            if (response.success && response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Failed to initiate checkout. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
            <SiteHeader />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">
                        Transparent Pricing for Every Scale
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Scale your automations without limits. Choose the plan that fits your current needs and upgrade as you grow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {pricingTiers.map((tier) => {
                        const dbPlan = plans.find(p => p.slug === tier.slug);
                        const price = dbPlan ? dbPlan.priceMonthly : (tier.slug === 'free' ? '0' : '...');
                        const isEnterprise = tier.slug === 'business';

                        return (
                            <div
                                key={tier.slug}
                                className={`relative p-8 rounded-3xl border ${tier.popular
                                    ? 'bg-white/10 border-[#8b5cf6] shadow-2xl shadow-[#8b5cf6]/20'
                                    : 'bg-white/5 border-white/10'
                                    } flex flex-col`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8b5cf6] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">
                                            ${price}
                                        </span>
                                        <span className="text-white/40">/month</span>
                                    </div>
                                    <p className="mt-4 text-white/50 text-sm">{tier.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                                            <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                                                <Check size={12} className="text-[#8b5cf6]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(tier.slug)}
                                    disabled={loading !== null}
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${tier.popular
                                        ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {loading === tier.slug ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        tier.slug === 'free' ? (isAuthenticated ? 'Current Plan' : tier.cta) : tier.cta
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-32">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Can I switch plans later?</h4>
                            <p className="text-white/50">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">What happens if I exceed my execution limit?</h4>
                            <p className="text-white/50">On the Free plan, executions will pause until the next month. Pro and Business plans have flexible usage options or overage protection.</p>
                        </div>
                    </div>
                </div>
            </div>
            <SiteFooter />
        </main>
    );
}
