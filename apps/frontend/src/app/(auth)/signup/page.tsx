'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Github, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock login
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#3b82f6]/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
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
                    Create your account
                </h2>
                <p className="text-center text-white/50">
                    Get started with automation in seconds
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 border border-white/10 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-white/80">
                                Full Name
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-white/40" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80">
                                Password
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/40" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-[#8b5cf6] focus:ring-[#8b5cf6] border-white/20 rounded bg-white/10"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-white/60">
                                I agree to the <Link href="/terms" className="text-[#8b5cf6] hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#8b5cf6] hover:underline">Privacy Policy</Link>
                            </label>
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
                                    "Create Account"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <p className="text-center text-sm text-white/50">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-[#8b5cf6] hover:text-[#7c3aed]">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
