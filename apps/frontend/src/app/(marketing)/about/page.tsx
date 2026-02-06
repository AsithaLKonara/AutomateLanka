'use client';

import React from 'react';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';
import { Target, Users, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
            <SiteHeader />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">
                        Democratizing Automation for Everyone
                    </h1>
                    <p className="text-xl text-white/60 leading-relaxed">
                        AutomateLanka was born from a simple idea: automation shouldn't be a privilege for the elite.
                        We're building the hub where technology, AI, and execution meet to empower individuals and teams worldwide.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#8b5cf6]/50 transition-colors group">
                        <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Target className="text-[#8b5cf6]" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                        <p className="text-white/50 leading-relaxed">
                            To bridge the gap between complex enterprise workflows and everyday creativity. We provide the tools, the scale, and the community to make logic-driven work effortless.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#8b5cf6]/50 transition-colors group">
                        <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="text-[#8b5cf6]" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Speed of Logic</h3>
                        <p className="text-white/50 leading-relaxed">
                            We believe in the power of "shipping fast". Our platform is designed to take you from a workflow concept to a live execution in minutes, not days.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#8b5cf6]/50 transition-colors group">
                        <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="text-[#8b5cf6]" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Community Focused</h3>
                        <p className="text-white/50 leading-relaxed">
                            Automation thrives on shared knowledge. Our marketplace and open patterns ensure that no one has to solve the same problem twice.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#8b5cf6]/50 transition-colors group">
                        <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Globe className="text-[#8b5cf6]" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Scale Globally</h3>
                        <p className="text-white/50 leading-relaxed">
                            Built for the global economy. Whether you're a solopreneur in Colombo or a startup in San Francisco, our infrastructure scales with you.
                        </p>
                    </div>
                </div>

                {/* Team / Culture Section */}
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Join the Automation Revolution</h2>
                    <p className="text-white/60 mb-10 leading-relaxed">
                        We are a distributed team of engineers, designers, and automation enthusiasts who are passionate about building the future of work.
                        We value transparency, technical excellence, and user-centric design above all else.
                    </p>
                    <div className="flex justify-center gap-6">
                        <div className="px-6 py-2 bg-white/5 rounded-full text-sm font-medium border border-white/10 italic text-[#8b5cf6]">#ShipIt</div>
                        <div className="px-6 py-2 bg-white/5 rounded-full text-sm font-medium border border-white/10 italic text-[#8b5cf6]">#AlwaysLearning</div>
                        <div className="px-6 py-2 bg-white/5 rounded-full text-sm font-medium border border-white/10 italic text-[#8b5cf6]">#UserFirst</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
