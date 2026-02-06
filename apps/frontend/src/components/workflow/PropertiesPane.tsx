'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Info, ChevronDown, Settings2, PlayCircle } from 'lucide-react';
import { WorkflowNode } from './types';

interface PropertiesPaneProps {
    node: WorkflowNode | null;
    onClose: () => void;
    onUpdate: (id: string, config: Record<string, any>) => void;
    onDelete: (id: string) => void;
}

export default function PropertiesPane({ node, onClose, onUpdate, onDelete }: PropertiesPaneProps) {
    if (!node) return null;

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0e0918] border-l border-white/10 shadow-2xl z-[60] flex flex-col pt-20"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                            <Settings2 size={16} className="text-[#8b5cf6]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold italic">{node.data.label}</h2>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{node.type} Configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">General Settings</label>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-white/60 mb-2 block">Node Name</span>
                                <input
                                    type="text"
                                    defaultValue={node.data.label}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Parameters</label>
                        <div className="space-y-6">
                            {Object.entries(node.data.config || {}).map(([key, value]) => (
                                <div key={key}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue={value as string}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-all font-mono"
                                    />
                                </div>
                            ))}

                            {node.type === 'trigger' && (
                                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex gap-3">
                                    <PlayCircle size={18} className="text-green-500 shrink-0" />
                                    <p className="text-[10px] text-green-500/80 font-medium leading-relaxed">
                                        This trigger will initiate the workflow when an external event occurs at the configured endpoint.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
                    <div className="flex gap-3">
                        <button
                            onClick={() => onDelete(node.id)}
                            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                            title="Delete Node"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button className="flex-grow py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                            <Save size={18} />
                            Save changes
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        <Info size={12} />
                        Changes are saved locally
                    </div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
