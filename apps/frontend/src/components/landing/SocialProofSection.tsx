'use client';

import React from 'react';
import { Twitter } from 'lucide-react';

export default function SocialProofSection() {
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "DevOps Engineer",
            content: "I spent 3 days trying to build a custom N8N workflow for Jira syncing. Found an exact match on AutomateLanka in 10 seconds.",
            avatar: "https://i.pravatar.cc/150?u=sarah"
        },
        {
            name: "David Chen",
            role: "Growth Marketer",
            content: "The AI search is actually magic. I just typed 'scrape LinkedIn profile and save to Airtable' and it gave me a working workflow.",
            avatar: "https://i.pravatar.cc/150?u=david"
        },
        {
            name: "Alex Rivera",
            role: "CTO @ StartupX",
            content: "We use AutomateLanka to onboard new engineers. The standard library of workflows saves us hundreds of hours per month.",
            avatar: "https://i.pravatar.cc/150?u=alex"
        }
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Loved by Automation Engineers</h2>
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-white/50">Trusted by 5,000+ developers worldwide.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-[#0e0918] p-8 rounded-2xl border border-white/10 hover:border-n8n-primary/30 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1 text-n8n-primary">
                                        <Twitter size={20} />
                                    </div>
                                </div>
                                <p className="text-lg text-white/80 leading-relaxed mb-6">"{t.content}"</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                    {/* Placeholder avatar if image fails */}
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{t.name}</div>
                                    <div className="text-xs text-white/40">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
