'use client';

import Link from 'next/link';
import { Zap, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col items-center justify-center p-6 text-center">
            {/* Background Glow */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8b5cf6]/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
            >
                <div className="w-20 h-20 bg-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#8b5cf6]/40">
                    <Zap className="text-white" size={40} fill="currentColor" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black italic tracking-tighter opacity-10">404</h1>
                    <h2 className="text-4xl font-bold tracking-tight -mt-12">Lost in Automation</h2>
                    <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
                        The page you are looking for has been moved, evaporated, or never existed in this timeline.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#8b5cf6]/20 group"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </motion.div>

            <footer className="mt-24 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                AutomateLanka • Error Protocol 404
            </footer>
        </div>
    );
}
