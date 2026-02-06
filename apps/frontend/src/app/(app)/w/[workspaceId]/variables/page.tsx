'use client';

import React, { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Trash2, Info, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialVariables = [
    { id: '1', key: 'OPENAI_API_KEY', value: 'sk-proj-********************************', visible: false, type: 'Secret' },
    { id: '2', key: 'DB_URL', value: 'postgres://user:********@host:5432/db', visible: false, type: 'Environment' },
    { id: '3', key: 'SLACK_WEBHOOK', value: 'https://hooks.slack.com/services/T00/B00/XXX', visible: false, type: 'Secret' },
];

export default function VariablesPage() {
    const [variables, setVariables] = useState(initialVariables);

    const toggleVisibility = (id: string) => {
        setVariables(variables.map(v => v.id === id ? { ...v, visible: !v.visible } : v));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Key className="text-[#8b5cf6]" size={32} />
                        Variables & Secrets
                    </h1>
                    <p className="text-white/40 mt-1 italic">Configure environment variables and sensitive secrets for your workflows.</p>
                </div>
                <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2">
                    <Plus size={18} /> Add Variable
                </button>
            </header>

            <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Info className="text-[#8b5cf6]" size={20} />
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                    Variables defined here are encrypted at rest and can be injected into any workflow within this workspace using the <code className="text-[#8b5cf6] font-bold">{"{{ $env.KEY }}"}</code> syntax.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-12 px-6 text-[10px] font-bold uppercase tracking-widest text-white/20">
                    <div className="col-span-4">Variable Key</div>
                    <div className="col-span-5">Value</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <AnimatePresence>
                    {variables.map((v, i) => (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="grid grid-cols-12 items-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
                        >
                            <div className="col-span-4 flex items-center gap-2">
                                <span className="text-sm font-bold text-white tracking-tight italic">{v.key}</span>
                            </div>
                            <div className="col-span-5 flex items-center gap-3">
                                <span className={`text-xs font-mono tracking-tight ${v.visible ? 'text-white/80' : 'text-white/20'}`}>
                                    {v.visible ? v.value : '••••••••••••••••••••••••••••••••'}
                                </span>
                                <button
                                    onClick={() => toggleVisibility(v.id)}
                                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-all"
                                >
                                    {v.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <div className="col-span-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-white/40">
                                    {v.type}
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-[#8b5cf6]/10 rounded-lg text-white/40 hover:text-[#8b5cf6] transition-all">
                                    <Lock size={16} />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[11px] text-white/20 italic">For organizational secrets, check the <span className="text-[#8b5cf6] font-bold cursor-pointer hover:underline underline-offset-4">Global Vault</span> Settings.</p>
            </div>
        </div>
    );
}
