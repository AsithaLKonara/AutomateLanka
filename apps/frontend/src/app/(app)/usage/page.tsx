'use client';

import React from 'react';
import { BarChart3, Cloud, Cpu, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const usageMetrics = [
    { label: 'Workflows', current: 18, total: 50, color: '#8b5cf6', icon: Cpu },
    { label: 'Executions', current: 42500, total: 50000, color: '#f59e0b', icon: BarChart3 },
    { label: 'AI Search Credits', current: 840, total: 1000, color: '#10b981', icon: Cloud },
    { label: 'Workspace Members', current: 4, total: 10, color: '#3b82f6', icon: Users },
];

export default function UsagePage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Usage & Quota</h1>
                    <p className="text-white/40 mt-1">Monitor your resource consumption across all workspaces.</p>
                </div>
                <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#8b5cf6]/20">
                    Upgrade Plan
                </button>
            </header>

            {/* Current Plan Overview */}
            <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-transparent border border-[#8b5cf6]/30 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex px-3 py-1 bg-[#8b5cf6] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">Pro Plan</div>
                        <h2 className="text-3xl font-bold italic">Power User Suite</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                            {['Unlimited workflows', 'Priority execution queue', 'Advanced AI Search', 'Team collaboration'].map(f => (
                                <li key={f} className="flex items-center gap-2 text-sm text-white/60 italic font-medium">
                                    <CheckCircle2 size={16} className="text-[#8b5cf6]" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="text-sm text-white/40 uppercase font-bold tracking-widest mb-1">Next Billing Date</div>
                        <div className="text-xl font-bold">March 01, 2026</div>
                        <button className="mt-4 text-xs font-bold text-[#8b5cf6] hover:underline">Manage Billing Settings</button>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#8b5cf6]/20 rounded-full blur-[60px] group-hover:bg-[#8b5cf6]/30 transition-colors" />
            </div>

            {/* Quota Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usageMetrics.map((m, i) => {
                    const percentage = Math.round((m.current / m.total) * 100);
                    return (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                        <m.icon size={20} className="text-white/60" />
                                    </div>
                                    <div className="font-bold text-lg">{m.label}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold italic">{percentage}%</div>
                                    <div className="text-[10px] text-white/40 font-bold uppercase">Consumed</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                                    style={{ backgroundColor: m.color }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                <span className="text-white/20">{m.current.toLocaleString()}</span>
                                <span className="text-white/60">{m.total.toLocaleString()} Max</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Usage History Section Placeholder */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-white uppercase tracking-widest text-sm">Monthly Consumption History</h3>
                    <div className="text-xs text-[#8b5cf6] font-bold cursor-pointer flex items-center gap-1 hover:underline">
                        Export Report <ArrowUpRight size={14} />
                    </div>
                </div>
                <div className="space-y-3">
                    {[
                        { month: 'January', usage: '92%', status: 'Normal' },
                        { month: 'December', usage: '84%', status: 'Normal' },
                        { month: 'November', usage: '105%', status: 'Overage' },
                    ].map(row => (
                        <div key={row.month} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors px-2 rounded-lg">
                            <span className="text-sm font-medium text-white/60">{row.month} 2025</span>
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-mono text-white/80">{row.usage}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${row.status === 'Overage' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {row.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
