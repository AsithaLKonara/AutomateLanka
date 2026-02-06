'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, CheckCircle2, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) return;

            try {
                const res = await fetch(`http://localhost:8000/api/auth/verify-email/${token}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Verification failed');

                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message);
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
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

                <div className="bg-white/5 border border-white/10 py-12 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl text-center">
                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <Loader2 className="text-[#8b5cf6] animate-spin" size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Verifying your email</h2>
                            <p className="text-white/50">Please wait while we confirm your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="text-green-500" size={40} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                                <p className="text-white/50">Your email has been successfully verified. You can now access all features.</p>
                            </div>
                            <Link
                                href="/dashboard"
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-sm font-bold text-white transition-all shadow-lg shadow-purple-900/20"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="text-red-500" size={40} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                                <p className="text-white/55">{message || "The verification link is invalid or has expired."}</p>
                            </div>
                            <div className="pt-4 space-y-3">
                                <Link
                                    href="/signup"
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all"
                                >
                                    Try signing up again
                                </Link>
                                <Link href="/support" className="text-sm font-medium text-[#8b5cf6] hover:underline flex items-center justify-center gap-2">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <span>Back to log in</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
