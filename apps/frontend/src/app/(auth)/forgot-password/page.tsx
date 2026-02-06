'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            // We assume success for security reasons (don't reveal if email exists)
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to send reset email:', error);
            // Still show success to prevent email enumeration
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

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
                    {isSubmitted ? "Check your email" : "Reset your password"}
                </h2>
                <p className="text-center text-white/50">
                    {isSubmitted
                        ? `We've sent a recovery link to ${email}`
                        : "Enter your email and we'll send you a link to reset your password"
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 border border-white/10 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
                    {!isSubmitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                                    Email address
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-white/40" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Send reset link"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="text-green-500" size={32} />
                                </div>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                If an account exists for that email, you will receive a password reset link shortly. Please check your spam folder if you don't see it.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-xl bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all font-medium"
                            >
                                Use a different email
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-sm font-medium text-[#8b5cf6] hover:text-[#7c3aed] flex items-center justify-center gap-2">
                            <span>Back to log in</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
