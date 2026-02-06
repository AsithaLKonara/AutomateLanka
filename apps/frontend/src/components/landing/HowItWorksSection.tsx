'use client';

import React from 'react';
import { MessageSquare, Sparkles, Rocket, ArrowRight } from 'lucide-react';

export default function HowItWorksSection() {
    const steps = [
        {
            icon: <MessageSquare size={32} className="text-white" />,
            title: "1. Describe it",
            desc: "Tell our AI what you want to automate in plain English. No technical jargon needed.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Sparkles size={32} className="text-white" />,
            title: "2. AI Finds it",
            desc: "Our semantic search engine scans 2,000+ verified workflows to find the perfect match.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Rocket size={32} className="text-white" />,
            title: "3. One-Click Deploy",
            desc: "Instant deployment to your N8N instance. We handle the JSON import and setup for you.",
            color: "from-orange-500 to-red-500"
        }
    ];

    return (
        <section className="py-32 bg-[#0e0918] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">How it works</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Stop building from scratch. Start automating in three simple steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            {/* Step Number Badge */}
                            <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg shadow-n8n-primary/20 mb-8 relative z-10 transform group-hover:scale-110 transition-transform duration-300`}>
                                {step.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-center">{step.title}</h3>
                            <p className="text-white/60 text-center leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Arrow for mobile/tablet flow */}
                            {i < 2 && (
                                <div className="md:hidden flex justify-center my-8 text-white/20">
                                    <ArrowRight size={32} className="transform rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
