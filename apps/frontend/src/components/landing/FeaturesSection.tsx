'use client';

import React from 'react';
import { Search, Brain, GitBranch } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section id="features" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                            Search with your mind,<br />not your mouse.
                        </h2>
                        <p className="text-xl text-white/60 mb-12 leading-relaxed">
                            Powered by semantic AI, AutomateLanka understands your intent. Just describe what you want to achieve, and we'll find the perfect workflow for you.
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: <Search className="text-n8n-primary" />, title: 'Natural Language Search', desc: 'Find any workflow by describing its function.' },
                                { icon: <Brain className="text-purple-400" />, title: 'Intelligence Recommendations', desc: 'Get suggestions based on your existing stack.' },
                                { icon: <GitBranch className="text-blue-400" />, title: 'Smart Remixing', desc: 'Fork and adapt workflows with one click.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-n8n-primary/30 transition-all">
                                    <div className="shrink-0">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold mb-1">{item.title}</h4>
                                        <p className="text-sm text-white/40">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-n8n-primary/20 blur-[100px] rounded-full" />
                        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                            {/* Mock UI for Search */}
                            <div className="w-full max-w-md bg-[#1a1525] rounded-2xl p-8 border border-white/10">
                                <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl">
                                    <Search size={20} className="text-n8n-primary" />
                                    <span className="text-white/40">Find workflows for email marketing...</span>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-12 w-full rounded-xl bg-white/${i === 1 ? '10' : '5'} flex items-center justify-between px-4`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-n8n-primary/20" />
                                                <div className={`h-2 rounded bg-white/${i === 1 ? '40' : '20'}`} style={{ width: i === 1 ? '120px' : '80px' }} />
                                            </div>
                                            <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
