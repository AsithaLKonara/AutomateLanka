'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Rocket, Users, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const nextStep = () => {
        if (step === 3) {
            handleComplete();
        } else {
            setStep(step + 1);
        }
    };

    const handleComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8b5cf6]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8b5cf6]/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-xl w-full">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1 flex-grow rounded-full transition-all duration-500 ${s <= step ? 'bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="w-16 h-16 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center">
                                <Zap className="text-[#8b5cf6]" size={32} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight italic">Welcome to AutomateLanka</h1>
                                <p className="text-white/40 text-lg leading-relaxed">
                                    Let's get your automation hub ready. What should we call your first workspace?
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">Workspace Name</label>
                                <input
                                    type="text"
                                    defaultValue="My First Workspace"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all outline-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="w-16 h-16 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center">
                                <Users className="text-[#8b5cf6]" size={32} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight italic">Pulse of the Team</h1>
                                <p className="text-white/40 text-lg leading-relaxed">
                                    Automation is better together. Invite your collaborators (optional).
                                </p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="colleague@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all outline-none"
                                />
                                <button className="text-sm font-bold text-[#8b5cf6] hover:underline px-2">+ Add another</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                <Rocket className="text-green-400" size={32} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight italic">Ready for Liftoff</h1>
                                <p className="text-white/40 text-lg leading-relaxed">
                                    Your workspace is configured and ready. It's time to build your first automation.
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <ul className="space-y-3">
                                    {[
                                        'Workspace provisioned',
                                        'Team roles configured',
                                        'Default templates loaded'
                                    ].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm text-white/60 italic">
                                            <Check size={16} className="text-green-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between">
                    {step > 1 ? (
                        <button
                            disabled={isLoading}
                            onClick={() => setStep(step - 1)}
                            className="text-white/40 hover:text-white font-bold transition-all disabled:opacity-0"
                        >
                            Back
                        </button>
                    ) : <div />}

                    <button
                        onClick={nextStep}
                        disabled={isLoading}
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2 group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Launching...
                            </>
                        ) : (
                            <>
                                {step === 3 ? 'Get Started' : 'Continue'}
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
