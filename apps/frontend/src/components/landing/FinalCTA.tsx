'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
    return (
        <div className="py-24 bg-gradient-to-b from-[#0e0918]/50 to-[#0e0918] relative overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Ready to automate the <span className="text-[#a78bfa]">impossible</span>?
                </h2>
                <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
                    Join thousands of developers and businesses building advanced workflows with AI-powered semantic search.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-medium transition-all flex items-center gap-2 group shadow-lg shadow-[#8b5cf6]/20"
                    >
                        <Sparkles size={18} />
                        Start Automating Free
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/workflows"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium border border-white/10 transition-all backdrop-blur-sm"
                    >
                        Browse Workflows
                    </Link>
                </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#8b5cf6]/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
}
