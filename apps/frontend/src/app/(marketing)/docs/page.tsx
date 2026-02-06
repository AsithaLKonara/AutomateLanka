'use client';

import React from 'react';
import { Book, Code, Cpu, Globe, Search, Terminal, Zap, ChevronRight, FileText, Layout, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const docSections = [
    { title: 'Core Concepts', icon: Layers, topics: ['Workflow Lifecycle', 'Node Types', 'Execution State', 'Error Handling'] },
    { title: 'API Reference', icon: Code, topics: ['REST API Overview', 'Authentication', 'Rate Limits', 'Webhooks'] },
    { title: 'CLI & DevTools', icon: Terminal, topics: ['Install CLI', 'Local Testing', 'Deployment Hooks', 'Environment Config'] },
];

export default function DocsPage() {
    return (
        <main className="min-h-screen text-white selection:bg-[#8b5cf6] selection:text-white">
            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Sidebar Nav */}
                    <aside className="hidden lg:block space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6] mb-4">Introduction</h3>
                            <ul className="space-y-2">
                                {['Welcome', 'System Requirements', 'Core Principles'].map(item => (
                                    <li key={item} className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-4">Workflows</h3>
                            <ul className="space-y-2">
                                {['Building your first flow', 'Data Transformations', 'Trigger Nodes', 'Action Nodes'].map(item => (
                                    <li key={item} className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-16">
                        <header className="space-y-4">
                            <h1 className="text-5xl font-bold italic tracking-tight">Documentation</h1>
                            <p className="text-xl text-white/40 max-w-2xl leading-relaxed">
                                Everything you need to build, scale, and master enterprise-grade automations with AutomateLanka.
                            </p>
                        </header>

                        {/* Quick Start Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-[#8b5cf6]/20 to-transparent border border-[#8b5cf6]/30 rounded-[2.5rem] p-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group"
                        >
                            <div className="space-y-6 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8b5cf6] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">5 Min Setup</div>
                                <h2 className="text-3xl font-bold italic">Quick Start Guide</h2>
                                <p className="text-white/60 leading-relaxed max-w-sm">
                                    Jump straight into the builder and connect your first two apps in record time.
                                </p>
                                <button className="bg-white text-[#0e0918] px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105">
                                    Start Building
                                </button>
                            </div>
                            <Zap size={180} className="text-white/5 absolute -right-8 -bottom-8 rotate-12 group-hover:text-white/10 transition-colors" />
                        </motion.div>

                        {/* Topics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {docSections.map((section, i) => (
                                <div key={section.title} className="space-y-6">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <section.icon size={24} className="text-white/60" />
                                    </div>
                                    <h3 className="text-xl font-bold">{section.title}</h3>
                                    <ul className="space-y-3">
                                        {section.topics.map(topic => (
                                            <li key={topic} className="text-sm text-white/40 hover:text-[#8b5cf6] transition-colors cursor-pointer flex items-center justify-between group">
                                                {topic}
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Contribute Footer */}
                        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-4">
                                <FileText className="text-white/20" size={32} />
                                <div className="text-sm text-white/40 italic">Last updated: February 7, 2026</div>
                            </div>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-white/60 hover:text-white transition-colors italic underline underline-offset-4 decoration-white/10">Suggest an edit</button>
                                <button className="text-sm font-bold text-white/60 hover:text-white transition-colors italic underline underline-offset-4 decoration-white/10">Join Discord</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
