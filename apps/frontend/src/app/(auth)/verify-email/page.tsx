'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailLandingPage() {
    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8b5cf6]/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                            <Zap className="text-white" size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">AutomateLanka</span>
                    </div>
                </Link>
                <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2">
                    Verify your email
                </h2>
                <p className="text-center text-white/50">
                    We've sent a verification link to your email address.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 border border-white/10 py-12 px-4 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full flex items-center justify-center">
                            <Mail className="text-[#8b5cf6]" size={40} />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Check your inbox</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-8">
                        Click on the link we sent to your email to verify your account. If you don't see it, check your spam folder.
                    </p>

                    <div className="space-y-4">
                        <button className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-sm font-bold text-white transition-all shadow-lg shadow-purple-900/20">
                            Resend verification email
                        </button>
                        <Link
                            href="/login"
                            className="w-full flex justify-center py-4 px-4 border border-white/10 rounded-xl bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all"
                        >
                            Back to log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
