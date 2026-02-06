'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Info, ChevronRight, Zap, Play, GitBranch } from 'lucide-react';
import { NODE_CATEGORIES, NODE_DEFINITIONS } from './constants';

interface SidebarProps {
    onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export default function Sidebar({ onDragStart }: SidebarProps) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredNodes = Object.entries(NODE_DEFINITIONS).filter(([key, node]) =>
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside className="w-80 border-r border-white/10 bg-[#0e0918] flex flex-col pt-20">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold italic mb-4">Nodes Hub</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-8">
                {NODE_CATEGORIES.map((cat) => {
                    const catNodes = filteredNodes.filter(([_, node]) => node.type === cat.id);
                    if (catNodes.length === 0) return null;

                    return (
                        <div key={cat.id} className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                                    {cat.id === 'trigger' && <Zap size={12} style={{ color: cat.color }} />}
                                    {cat.id === 'action' && <Play size={12} style={{ color: cat.color }} />}
                                    {cat.id === 'logic' && <GitBranch size={12} style={{ color: cat.color }} />}
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">{cat.label}</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {catNodes.map(([key, node]) => (
                                    <div
                                        key={key}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, key)}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all cursor-grab active:cursor-grabbing group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                                                <Plus size={16} className="text-white/40 group-hover:text-[#8b5cf6]" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-sm font-bold text-white/80">{node.label}</div>
                                                <div className="text-[10px] text-white/30 truncate max-w-[150px]">{node.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="p-4 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-start gap-3">
                    <Info size={16} className="text-[#8b5cf6] mt-0.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed text-[#8b5cf6]/80 font-medium">
                        Drag nodes onto the canvas to start building your automation flow.
                    </p>
                </div>
            </div>
        </aside>
    );
}
