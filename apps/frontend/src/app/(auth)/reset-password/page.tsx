'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Zap, Lock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!res.ok) throw new Error('Invalid or expired reset link');

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#f43f5e]/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
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
                    {isSuccess ? "Password updated" : "Create new password"}
                </h2>
                <p className="text-center text-white/50">
                    {isSuccess
                        ? "Your password has been successfully reset. You can now log in with your new password."
                        : "Your new password must be different from previous used passwords."
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 border border-white/10 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
                    {!isSuccess ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                                    <p className="text-xs text-red-500 font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="pass" className="block text-sm font-medium text-white/80">
                                    New password
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/40" />
                                    </div>
                                    <input
                                        id="pass"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm" className="block text-sm font-medium text-white/80">
                                    Confirm new password
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/40" />
                                    </div>
                                    <input
                                        id="confirm"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-all"
                                        placeholder="••••••••"
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
                                        "Reset password"
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
                            <Link
                                href="/login"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-sm font-bold text-white transition-all shadow-lg shadow-purple-900/20"
                            >
                                Continue to log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
