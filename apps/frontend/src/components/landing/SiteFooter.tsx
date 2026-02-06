'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="bg-[#0e0918] py-12 border-t border-white/5">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={18} fill="currentColor" />
                    </div>
                    <span className="font-bold text-white text-lg">AutomateLanka</span>
                </div>

                <div className="flex gap-8 text-sm text-white/40 font-medium">
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>

                <p className="text-xs text-white/20 font-medium">© 2026 AutomateLanka</p>
            </div>
        </footer>
    );
}
