'use client';

import React from 'react';
import { Search, MessageSquare, Book, LifeBuoy, Zap, ChevronRight, Globe, Mail, Rocket, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    { title: 'Getting Started', icon: Rocket, count: 12, description: 'Learn the basics of AutomateLanka and build your first workflow.' },
    { title: 'Nodes & Integrations', icon: Zap, count: 45, description: 'Deep dives into specific automation nodes and API connections.' },
    { title: 'Account & Billing', icon: Shield, count: 8, description: 'Manage your subscription, team members, and security.' },
    { title: 'Advanced Workflows', icon: Book, count: 24, description: 'Master complex logic, error handling, and state management.' },
];

export default function SupportPage() {
    return (
        <main className="min-h-screen text-white selection:bg-[#8b5cf6] selection:text-white">
            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16 space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight italic">How can we help you?</h1>
                        <div className="max-w-2xl mx-auto relative mt-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                            <input
                                type="text"
                                placeholder="Search for articles, features, or error codes..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#8b5cf6]/50 transition-all group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <cat.icon className="text-[#8b5cf6]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-4">{cat.description}</p>
                                <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest flex items-center gap-1">
                                    {cat.count} Articles <ChevronRight size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent border border-[#8b5cf6]/30 rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center gap-12">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold italic">Can't find what you need?</h2>
                                <p className="text-white/60 leading-relaxed">
                                    Our support engineers are ready to help you with any technical challenges or account inquiries.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2">
                                        <MessageSquare size={18} />
                                        Live Chat
                                    </button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2">
                                        <Mail size={18} />
                                        Email Support
                                    </button>
                                </div>
                            </div>
                            <div className="shrink-0 relative">
                                <div className="w-32 h-32 bg-[#8b5cf6] rounded-full blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                                <LifeBuoy size={120} className="text-white/10 rotate-12" />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-8">
                            <h3 className="text-xl font-bold italic">System Status</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Workflow Engine', status: 'Operational' },
                                    { name: 'AI Search Hub', status: 'Operational' },
                                    { name: 'API Services', status: 'Operational' },
                                ].map(s => (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">{s.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-green-400">{s.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full text-center text-xs font-bold text-white/20 hover:text-white transition-colors">View Detailed Status History</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

