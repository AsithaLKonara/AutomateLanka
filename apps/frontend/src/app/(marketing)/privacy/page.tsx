'use client';

import React from 'react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
            <SiteHeader />

            <div className="pt-32 pb-24 px-6 mt-10">
                <article className="max-w-3xl mx-auto prose prose-invert prose-purple">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">Privacy Policy</h1>
                    <p className="text-white/40 mb-12 italic text-sm">Last updated: February 6, 2026</p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            Welcome to AutomateLanka. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Data We Collect</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-6 text-white/60 space-y-2">
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. How We Use Your Data</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 text-white/60 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Data Security</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>
                </article>
            </div>
        </main>
    );
}
