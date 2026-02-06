'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, Trash2, ShieldCheck, AlertCircle, ExternalLink, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialKeys = [
    { id: '1', name: 'Production Bot', key: 'al_live_************************4k2p', created: '2026-02-01', lastUsed: '2 hours ago', status: 'active' },
    { id: '2', name: 'Staging Environment', key: 'al_test_************************9x0r', created: '2026-02-04', lastUsed: '5 mins ago', status: 'active' },
];

export default function ApiKeysPage() {
    const [keys, setKeys] = useState(initialKeys);

    const deleteKey = (id: string) => {
        setKeys(keys.filter(k => k.id !== id));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Key className="text-[#8b5cf6]" size={32} />
                        API Keys
                    </h1>
                    <p className="text-white/40 mt-1 italic">Manage programmatic access to your workspace via the AutomateLanka API.</p>
                </div>
                <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2">
                    <Plus size={18} /> Create New Key
                </button>
            </header>

            {/* Info Box */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-[#8b5cf6]" size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-white/80 font-bold">Secure Your Keys</p>
                    <p className="text-xs text-white/40 leading-relaxed">
                        API keys grant full access to your workspace. Never share them or commit them to version control.
                        Use environment variables for secure storage in your applications.
                        <span className="ml-2 text-[#8b5cf6] cursor-pointer hover:underline inline-flex items-center gap-1">
                            Read API Docs <ExternalLink size={12} />
                        </span>
                    </p>
                </div>
            </div>

            {/* Keys Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <div className="col-span-4">Name & Key</div>
                    <div className="col-span-2">Created</div>
                    <div className="col-span-2">Last Used</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                        {keys.map((k, i) => (
                            <motion.div
                                key={k.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-12 items-center px-6 py-5 hover:bg-white/[0.02] transition-all group"
                            >
                                <div className="col-span-4 space-y-1.5">
                                    <div className="text-sm font-bold text-white italic tracking-tight">{k.name}</div>
                                    <div className="flex items-center gap-2 group/key cursor-pointer">
                                        <code className="text-[10px] text-white/20 font-mono tracking-tighter group-hover/key:text-[#8b5cf6] transition-colors">
                                            {k.key}
                                        </code>
                                        <Copy size={12} className="text-white/10 group-hover/key:text-[#8b5cf6] transition-opacity" />
                                    </div>
                                </div>
                                <div className="col-span-2 text-xs text-white/40 font-medium italic">{k.created}</div>
                                <div className="col-span-2 text-xs text-white/40 font-medium underline decoration-white/10 underline-offset-4">{k.lastUsed}</div>
                                <div className="col-span-2">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-tighter">
                                        <div className="w-1 h-1 rounded-full bg-green-400" />
                                        {k.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                                        <MoreVertical size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteKey(k.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Warning Footer */}
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4">
                <AlertCircle size={20} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400/70 italic leading-relaxed">
                    Compromised keys should be rotated immediately. Deleting a key will permanently revoke its access and cannot be undone.
                </p>
            </div>
        </div>
    );
}
