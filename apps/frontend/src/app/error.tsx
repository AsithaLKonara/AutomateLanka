'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0e0918] text-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-red-900/20">
                    <AlertTriangle className="text-red-500" size={40} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight italic">Something went wrong</h1>
                    <p className="text-white/40 leading-relaxed text-sm">
                        An unexpected error occurred in your current session. Our engineers have been notified.
                    </p>
                    {error.digest && (
                        <div className="text-[10px] font-mono text-white/20 bg-white/5 py-1 px-2 rounded-md inline-block">
                            Error Digest: {error.digest}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#8b5cf6]/20"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
                    >
                        <Home size={18} />
                        Return to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
