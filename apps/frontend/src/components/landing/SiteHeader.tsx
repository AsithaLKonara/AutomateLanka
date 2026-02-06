'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0e0918]/80 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-n8n-primary rounded-xl flex items-center justify-center">
                        <Zap className="text-white" size={24} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">AutomateLanka</span>
                </div>
                <div className="hidden lg:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-white/70 hover:text-[#8b5cf6] transition-colors">Features</Link>
                    <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-[#8b5cf6] transition-colors">Pricing</Link>
                    <Link href="/marketplace" className="text-sm font-medium text-white/70 hover:text-[#8b5cf6] transition-colors">Marketplace</Link>
                    <Link href="/docs" className="text-sm font-medium text-white/70 hover:text-[#8b5cf6] transition-colors">Docs</Link>
                    <Link href="/support" className="text-sm font-medium text-white/70 hover:text-[#8b5cf6] transition-colors">Support</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-bold px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors">
                        Log in
                    </Link>
                    <Link href="/dashboard" className="bg-n8n-primary hover:bg-n8n-primary-shade text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-n8n-primary/20">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
