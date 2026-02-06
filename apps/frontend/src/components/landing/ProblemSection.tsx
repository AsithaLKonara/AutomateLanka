'use client';

import React from 'react';
import { X, FileJson, AlertCircle } from 'lucide-react';

export default function ProblemSection() {
    return (
        <section className="py-24 bg-[#0e0918] relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-sm font-bold text-red-400 tracking-wide uppercase">The Problem</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Most people waste hours trying to find a workflow that <span className="text-red-400">already exists</span>.
                    </h2>
                    <p className="text-xl text-white/60">
                        Searching GitHub repos, copy-pasting broken JSON, and debugging mysterious errors shouldn't be part of your job description.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative group hover:bg-white/10 transition-all">
                        <div className="absolute -top-6 -left-6 bg-red-500/20 w-32 h-32 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all" />
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-red-400">
                            <FileJson />
                        </div>
                        <h3 className="text-xl font-bold mb-3">The "Broken JSON" Hell</h3>
                        <p className="text-white/50">"Unexpected token at line 452..." You found a workflow, but it hasn't been updated in 2 years and breaks immediately.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative group hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-red-400">
                            <X />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Endless Searching</h3>
                        <p className="text-white/50">Trawling through forums, Discord channels, and GitHub repositories just to find a simple "Stripe to Slack" automation.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative group hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-red-400">
                            <AlertCircle />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Security & Trust Risks</h3>
                        <p className="text-white/50">Copying code from strangers? How do you know that workflow isn't sending your API keys to a random server?</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
