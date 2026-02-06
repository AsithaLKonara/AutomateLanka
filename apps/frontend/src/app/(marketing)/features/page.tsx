'use client';

import React from 'react';
import Link from 'next/link';
import {
    Zap, Brain, Network, Shield, Cpu,
    Workflow, Globe, Database, ArrowRight
} from 'lucide-react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';

export default function FeaturesPage() {
    const features = [
        {
            icon: <Brain className="w-8 h-8 text-[#8b5cf6]" />,
            title: "AI-Powered Automation",
            description: "Describe your workflow in plain English and let our AI build it for you. Smart auto-completion and error detection included.",
            badget: "New"
        },
        {
            icon: <Network className="w-8 h-8 text-blue-400" />,
            title: "Visual Workflow Editor",
            description: "Drag-and-drop interface with 2000+ integrations. Complex logic, branching, and loops made simple.",
        },
        {
            icon: <Shield className="w-8 h-8 text-green-400" />,
            title: "Enterprise Security",
            description: "SOC2 Type II compliant. Self-hostable option gives you complete control over your data privacy.",
        },
        {
            icon: <Cpu className="w-8 h-8 text-amber-400" />,
            title: "Self-Hostable",
            description: "Run on your own infrastructure or use our managed cloud. No vendor lock-in, ever.",
        },
        {
            icon: <Database className="w-8 h-8 text-purple-400" />,
            title: "Built-in Database",
            description: "Store state and data between executions without needing external databases. persistent storage for every workflow.",
        },
        {
            icon: <Globe className="w-8 h-8 text-cyan-400" />,
            title: "Webhooks & API",
            description: "Trigger workflows from any external event. Expose your workflows as API endpoints instantly.",
        }
    ];

    return (
        <div className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white font-sans">
            <SiteHeader />

            <main className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 mb-6 backdrop-blur-sm">
                            <Zap className="w-4 h-4 text-[#8b5cf6]" />
                            <span>Features Overview</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Power to the <br /> Builders.
                        </h1>
                        <p className="text-xl text-white/50 leading-relaxed">
                            The most powerful workflow automation platform, built for technical teams who demand control, flexibility, and performance.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                        {features.map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-[1px] rounded-bl-3xl bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="mb-6 relative">
                                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                    {feature.badget && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#8b5cf6] text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg">
                                            {feature.badget}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#8b5cf6] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Enterprise Section */}
                    <div className="bg-gradient-to-br from-[#1e1e2e] to-[#0e0918] rounded-[2.5rem] border border-white/10 p-12 md:p-24 relative overflow-hidden mb-24">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8b5cf6]/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-6">Enterprise-Grade <br /> Reliability</h2>
                                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                                    Run mission-critical workflows with confidence. Includes SSO, audit logs, role-based access control, and dedicated support engineering.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {['SOC2 Type II Certified', 'GDPR Compliant', '99.99% Uptime SLA', 'Dedicated Success Manager'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white/80">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all flex items-center gap-2">
                                    Contact Sales <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative">
                                {/* Mock UI for Enterprise Dashboard */}
                                <div className="bg-[#0e0918] rounded-2xl border border-white/10 p-6 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                        <div className="w-32 h-4 bg-white/10 rounded-md" />
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/5" />
                                            <div className="w-8 h-8 rounded-full bg-white/5" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                                                    <div className="space-y-2">
                                                        <div className="w-24 h-3 bg-white/20 rounded" />
                                                        <div className="w-16 h-2 bg-white/10 rounded" />
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">Passed</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to start building?</h2>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/signup" className="px-8 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-900/20">
                                Get Started Free
                            </Link>
                            <Link href="/contact" className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
                                Talk to Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
