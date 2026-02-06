'use client';

import React from 'react';
import { Settings, Clock, Zap, AlertCircle, Globe, Mail, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Pulsing Gradient Background */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8b5cf6] rounded-full blur-[160px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-12"
            >
                {/* Visual Icon Stack */}
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-[#8b5cf6] rounded-3xl blur-[20px] opacity-40 animate-pulse" />
                    <div className="relative w-full h-full bg-[#8b5cf6]/20 border-2 border-[#8b5cf6]/40 rounded-3xl flex items-center justify-center">
                        <Settings className="text-white animate-[spin_4s_linear_infinity]" size={40} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-xl">
                        <Zap className="text-[#8b5cf6]" size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter italic italic-outline text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                        UPGRADING ENGINES
                    </h1>
                    <h2 className="text-3xl font-bold tracking-tight -mt-4">Scheduled Maintenance</h2>
                    <p className="text-white/40 max-w-md mx-auto leading-relaxed italic">
                        AutomateLanka is currently performing scheduled infrastructure upgrades to ensure maximum performance and reliability. We'll be back online shortly.
                    </p>
                </div>

                {/* Status Progress */}
                <div className="max-w-xs mx-auto space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
                        <span>System Upgrade</span>
                        <span>85% Complete</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 2, delay: 0.5 }}
                            className="h-full bg-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-white/20 italic font-medium">
                        <Clock size={14} />
                        Estimated completion in 12 minutes
                    </div>
                </div>

                {/* Stay Updated */}
                <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a href="https://twitter.com/automatelanka" className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-[#8b5cf6] transition-colors">
                        <Twitter size={18} />
                        Status Updates
                    </a>
                    <a href="mailto:support@automatelanka.com" className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors">
                        <Mail size={18} />
                        Email Support
                    </a>
                </div>
            </motion.div>

            <footer className="mt-24 text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 animate-pulse">
                AUTOMATELANKA • ENGINE REV v2.4.0
            </footer>
        </div>
    );
}

// Global CSS for outlined text
const style = `
.italic-outline {
  font-style: italic;
  font-family: inherit;
}
`;
