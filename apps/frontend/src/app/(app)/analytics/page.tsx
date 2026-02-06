'use client';

import React from 'react';
import {
    BarChart3,
    Activity,
    ShieldCheck,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Clock,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Total Executions', value: '45,231', change: '+12.5%', trend: 'up', icon: Activity },
    { label: 'Avg. Success Rate', value: '98.4%', change: '+0.2%', trend: 'up', icon: ShieldCheck },
    { label: 'Active Workflows', value: '24', change: '+2', trend: 'up', icon: Zap },
    { label: 'AI Credits Used', value: '1,204', change: '-5.1%', trend: 'down', icon: BarChart3 },
];

const recentExecutions = [
    { id: '1', name: 'Shopify Sync', status: 'success', time: '2 mins ago', duration: '1.2s' },
    { id: '2', name: 'Email Lead Bot', status: 'success', time: '5 mins ago', duration: '0.8s' },
    { id: '3', name: 'Data Cleanup', status: 'failed', time: '12 mins ago', duration: '4.5s' },
    { id: '4', name: 'Slack Notifier', status: 'success', time: '15 mins ago', duration: '0.3s' },
    { id: '5', name: 'Invoice PDF Gen', status: 'success', time: '22 mins ago', duration: '2.1s' },
];

export default function AnalyticsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Global Analytics</h1>
                    <p className="text-white/40 mt-1">Real-time performance across all workspaces.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2">
                        <Clock size={16} className="text-white/40" />
                        Last 30 Days
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-[#8b5cf6]/50 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <stat.icon className="text-white/40 group-hover:text-[#8b5cf6] transition-colors" size={20} />
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-white/40 mt-1">{stat.label}</div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Graph Placeholder */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-[#8b5cf6]" />
                            Execution Trends
                        </h3>
                        <div className="flex gap-2">
                            {['D', 'W', 'M'].map(t => (
                                <button key={t} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${t === 'W' ? 'bg-[#8b5cf6] text-white' : 'hover:bg-white/5 text-white/40'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom CSS Chart Placeholder */}
                    <div className="h-64 flex items-end gap-2 px-2">
                        {[40, 60, 45, 90, 65, 80, 50, 70, 85, 60, 75, 95, 80, 60].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 1 + (i * 0.05) }}
                                className="flex-1 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/40 rounded-t-sm transition-colors relative group"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#0e0918] text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">
                        <span>Feb 01</span>
                        <span>Feb 07</span>
                        <span>Feb 14</span>
                        <span>Feb 21</span>
                        <span>Feb 28</span>
                    </div>
                </div>

                {/* Side List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-6">Recent Executions</h3>
                    <div className="space-y-4">
                        {recentExecutions.map((ex) => (
                            <div key={ex.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${ex.status === 'success' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`} />
                                    <div>
                                        <div className="text-sm font-medium text-white group-hover:text-[#8b5cf6] transition-colors cursor-pointer">{ex.name}</div>
                                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-tight">{ex.time}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-white/40 font-mono italic">{ex.duration}</div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 border border-white/10 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Error Distribution Segment */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-12">
                <div className="shrink-0 relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="251" strokeDashoffset="25" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f87171" strokeWidth="12" strokeDasharray="251" strokeDashoffset="240" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">98%</span>
                        <span className="text-[8px] uppercase tracking-tighter text-white/40">Health</span>
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-[#8b5cf6]" />
                            <span className="text-sm font-bold">Timeout Errors</span>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">System-wide timeout rate is 0.4%, well within healthy operating parameters.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-400" />
                            <span className="text-sm font-bold">Credential Health</span>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">100% of integrated API credentials are valid and responding within normal latency.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
