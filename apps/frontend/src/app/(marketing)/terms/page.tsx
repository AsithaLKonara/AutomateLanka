'use client';

import React from 'react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
            <SiteHeader />

            <div className="pt-32 pb-24 px-6 mt-10">
                <article className="max-w-3xl mx-auto prose prose-invert prose-purple">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">Terms of Service</h1>
                    <p className="text-white/40 mb-12 italic text-sm">Last updated: February 6, 2026</p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Agreement to Terms</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            By accessing or using AutomateLanka, you agree to be bound by these Terms of Service.
                            If you disagree with any part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Use License</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            Permission is granted to temporarily download one copy of the materials on AutomateLanka's website for personal,
                            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Disclaimer</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            The materials on AutomateLanka's website are provided on an 'as is' basis.
                            AutomateLanka makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                            without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Governing Law</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka
                            and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </section>
                </article>
            </div>
        </main>
    );
}
