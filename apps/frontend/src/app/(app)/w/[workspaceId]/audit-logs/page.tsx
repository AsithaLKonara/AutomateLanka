'use client';

import React from 'react';
import { Shield, Search, Filter, ArrowUpDown, User, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const auditLogs = [
    { id: '1', action: 'Workflow Created', user: 'Asitha Lakmal', resource: 'Shopify Sync', date: '2026-02-06 14:30:22', ip: '192.168.1.1' },
    { id: '2', action: 'Credential Updated', user: 'Admin System', resource: 'GitHub OAuth', date: '2026-02-06 12:15:05', ip: '10.0.0.42' },
    { id: '3', action: 'Secret Accessed', user: 'Asitha Lakmal', resource: 'AWS_SECRET_KEY', date: '2026-02-06 10:05:00', ip: '192.168.1.1' },
    { id: '4', action: 'User Invited', user: 'Asitha Lakmal', resource: 'john@example.com', date: '2026-02-05 18:45:12', ip: '192.168.1.1' },
    { id: '5', action: 'Workflow Deleted', user: 'Asitha Lakmal', resource: 'Old Test Bot', date: '2026-02-05 16:20:44', ip: '192.168.1.1' },
];

export default function AuditLogsPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-[#8b5cf6]" size={32} />
                        Audit Logs
                    </h1>
                    <p className="text-white/40 mt-1 italic">Security compliance and activity tracking for this workspace.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all flex items-center gap-2 italic">
                        Export CSV <ExternalLink size={14} />
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        placeholder="Search logs by user, action or resource..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white/60 flex items-center gap-2">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white/60 flex items-center gap-2">
                        <Calendar size={16} /> Date Range
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                                Action <ArrowUpDown size={12} />
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Resource Target</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {auditLogs.map((log, i) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-white italic">{log.action}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <User size={14} className="text-[#8b5cf6]" />
                                        {log.user}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-white/40 border border-white/5">{log.resource}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-white/30 font-medium">{log.date}</td>
                                <td className="px-6 py-4 text-xs text-white/20 font-mono tracking-tighter">{log.ip}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] hover:underline">Load More Records</button>
                </div>
            </div>
        </div>
    );
}
