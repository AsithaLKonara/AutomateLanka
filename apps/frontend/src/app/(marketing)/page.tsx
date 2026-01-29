'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, CheckCircle2, Search, Brain,
  Workflow, GitBranch, Shield, Globe, Sparkles
} from 'lucide-react';
import Hero3D from '@/components/Hero3D';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const integrations = [
    'Slack', 'Google Sheets', 'GitHub', 'Discord', 'Notion',
    'Airtable', 'Telegram', 'Trello', 'WhatsApp', 'Zoom'
  ];

  return (
    <div className="min-h-screen bg-[#0e0918] text-white selection:bg-n8n-primary/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0e0918]/80 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-n8n-primary rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">AutomateLanka</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-n8n-primary transition-colors">Features</a>
            <a href="#marketplace" className="text-sm font-medium hover:text-n8n-primary transition-colors">Marketplace</a>
            <a href="#ai" className="text-sm font-medium hover:text-n8n-primary transition-colors">AI Search</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="bg-n8n-primary hover:bg-n8n-primary-shade px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-n8n-primary/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-n8n-primary/10 border border-n8n-primary/20 mb-8">
              <Sparkles size={16} className="text-n8n-primary" />
              <span className="text-sm font-bold text-n8n-primary tracking-wide uppercase">New: AI-Powered Search</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Automate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-n8n-primary to-purple-400">Impossible</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Find, remix, and deploy 2,000+ ready-made n8n workflows with the world's most intelligent automation hub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard" className="w-full sm:w-auto bg-n8n-primary hover:bg-n8n-primary-shade px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-n8n-primary/30 group flex items-center justify-center gap-2">
                Start Automating Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all border border-white/10 flex items-center justify-center gap-2">
                Browse Marketplace
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-20 left-0 w-full overflow-hidden whitespace-nowrap opacity-30 select-none">
          <div className="flex animate-scroll gap-12 text-6xl font-black uppercase tracking-taller text-white/10">
            <span>Self-Hosted</span>
            <span>AI-Powered</span>
            <span>Node-Based</span>
            <span>Enterprise-Ready</span>
            <span>Open-Source</span>
            <span>Self-Hosted</span>
            <span>AI-Powered</span>
            <span>Node-Based</span>
          </div>
        </div>
      </section>

      {/* Integration Cloud */}
      <section className="py-24 border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-white/40 uppercase tracking-widest mb-12">Trusted by 2,000+ automations across</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 hover:opacity-80 transition-opacity duration-700">
            {integrations.map(name => (
              <div key={name} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 grayscale hover:grayscale-0 transition-all">
                  <img
                    src={`/icons/integrations/${name.toLowerCase().replace(/ /g, '-')}.svg`}
                    alt={name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://cdn.worldvectorlogo.com/logos/${name.toLowerCase()}.svg`;
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Search with your mind,<br />not your mouse.
              </h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed">
                Powered by semantic AI, AutomateLanka understands your intent. Just describe what you want to achieve, and we'll find the perfect workflow for you.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <Search className="text-n8n-primary" />, title: 'Natural Language Search', desc: 'Find any workflow by describing its function.' },
                  { icon: <Brain className="text-purple-400" />, title: 'Intelligence Recommendations', desc: 'Get suggestions based on your existing stack.' },
                  { icon: <GitBranch className="text-blue-400" />, title: 'Smart Remixing', desc: 'Fork and adapt workflows with one click.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-n8n-primary/30 transition-all">
                    <div className="shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-white/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-n8n-primary/20 blur-[100px] rounded-full" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                {/* Mock UI for Search */}
                <div className="w-full max-w-md bg-[#1a1525] rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl">
                    <Search size={20} className="text-n8n-primary" />
                    <span className="text-white/40">Find workflows for email marketing...</span>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-12 w-full rounded-xl bg-white/${i === 1 ? '10' : '5'} flex items-center justify-between px-4`}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-n8n-primary/20" />
                          <div className={`h-2 rounded bg-white/${i === 1 ? '40' : '20'}`} style={{ width: i === 1 ? '120px' : '80px' }} />
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-n8n-primary/20 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to automate everything?</h2>
          <p className="text-xl text-white/60 mb-12">
            Join the elite circle of automation engineers building the future on AutomateLanka.
          </p>
          <Link href="/dashboard" className="inline-flex bg-n8n-primary hover:bg-n8n-primary-shade px-12 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-n8n-primary/40 active:scale-95">
            Get Started for Free
          </Link>
          <p className="mt-8 text-white/30 text-sm font-medium">No credit card required • Self-hostable • Open Source</p>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Zap className="text-n8n-primary" size={24} fill="currentColor" />
            <span className="font-bold">AutomateLanka</span>
          </div>
          <div className="flex gap-12 text-sm text-white/40">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">Discord</a>
            <a href="#" className="hover:text-white">Documentation</a>
          </div>
          <p className="text-xs text-white/20">© 2026 AutomateLanka. Built for the modern builder.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: 200%;
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
