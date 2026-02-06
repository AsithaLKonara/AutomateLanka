'use client';

import React from 'react';
import { Shield, Github, Lock, Server } from 'lucide-react';

export default function TrustSection() {
    return (
        <section className="py-24 border-t border-white/5 bg-gradient-to-b from-[#0e0918] to-black/40">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-16">Enterprise-Grade Trust</h2>

                <div className="grid md:grid-cols-4 gap-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Github size={32} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg">100% Open Source</h3>
                        <p className="text-sm text-white/50 px-4">Audit our code. Host it yourself. Zero lock-in, forever.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Lock size={32} className="text-n8n-primary" />
                        </div>
                        <h3 className="font-bold text-lg">E2E Encrypted</h3>
                        <p className="text-sm text-white/50 px-4">Your credentials are encrypted at rest and in transit.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Server size={32} className="text-blue-400" />
                        </div>
                        <h3 className="font-bold text-lg">Self-Hostable</h3>
                        <p className="text-sm text-white/50 px-4">Run entirely on your own infrastructure via Docker.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Shield size={32} className="text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg">Verified Workflows</h3>
                        <p className="text-sm text-white/50 px-4">Every workflow in our library is manually tested for safety.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
