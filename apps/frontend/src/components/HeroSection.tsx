'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, PlayCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#0e0918]">
      {/* Background Gradients - Subtle & Professional - No Video */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#8b5cf6]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white/80 tracking-wide">
              SYSTEM OPERATIONAL
            </span>
          </div>

          {/* Headline - Clean Typography */}
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
            The Workflow Automation Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]">Builders</span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build complex automations 10x faster with AI-powered semantic search and a powerful node-based editor. Open source and self-hostable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/dashboard"
              className="h-12 px-8 flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_-5px_#8b5cf6] hover:shadow-[0_0_30px_-5px_#8b5cf6]"
            >
              Start Automating Free
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/workflows"
              className="h-12 px-8 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium border border-white/10 transition-all"
            >
              <Sparkles size={18} className="text-[#8b5cf6]" />
              Browse Workflows
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-white/40 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#8b5cf6]" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#8b5cf6]" />
              <span>Self-Hostable</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#8b5cf6]" />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Static Representation of Editor */}
        <div className="mt-20 relative mx-auto max-w-6xl">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#8b5cf6]/20 to-transparent rounded-xl blur-lg opacity-50" />
          <div className="relative rounded-xl border border-white/10 bg-[#1e1e2e]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="w-full aspect-[16/9] bg-[#0f172a] relative p-8">
              {/* Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

              {/* Mock UI Elements */}
              <div className="absolute top-8 left-8 right-8 h-12 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="px-3 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium rounded">Running</div>
              </div>

              {/* Mock Nodes - Static Layout */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-24 rounded-lg bg-[#1e293b] border border-white/10 p-4 flex flex-col justify-center shadow-lg transform hover:-translate-y-1 transition-transform cursor-default">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-500 text-xs">WEB</div>
                  <div className="text-white font-medium text-sm">Webhook Trigger</div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="absolute top-1/2 left-[calc(25%+12rem)] w-32 h-0.5 bg-white/20 -translate-y-1/2" />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 rounded-lg bg-[#1e293b] border border-[#8b5cf6] p-4 flex flex-col justify-center shadow-[0_0_30px_-10px_#8b5cf6] z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] text-xs">AI</div>
                  <div className="text-white font-medium text-sm">Process with AI</div>
                </div>
                <div className="h-1.5 w-full bg-[#8b5cf6]/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[#8b5cf6]" />
                </div>
              </div>

              {/* Connection Line */}
              <div className="absolute top-1/2 left-[calc(50%+6rem)] w-32 h-0.5 bg-white/20 -translate-y-1/2" />

              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-24 rounded-lg bg-[#1e293b] border border-white/10 p-4 flex flex-col justify-center shadow-lg transform hover:-translate-y-1 transition-transform cursor-default">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs">DB</div>
                  <div className="text-white font-medium text-sm">Postgres Insert</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
