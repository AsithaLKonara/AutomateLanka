'use client';

import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingIcons from './FloatingIcons';

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(to right, #1a1a2e 1px, transparent 1px), linear-gradient(to bottom, #1a1a2e 1px, transparent 1px)',
            backgroundSize: '2rem 2rem',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white/80">2,057+ Automation Workflows</span>
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>

        {/* Main Heading with Gradient */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="block mb-2 text-white">Automation</span>
          <span 
            className="block bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient"
          >
            Intelligence Hub
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto">
          Browse, search, and deploy 2,057+ N8N workflows with AI-powered semantic search. 
          Transform your workflow automation today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {/* Primary CTA */}
          <button
            onClick={() => router.push('/ai-search')}
            className="group relative px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
          >
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-100 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[2px] bg-black rounded-xl"></div>
            
            {/* Button Content */}
            <span className="relative flex items-center gap-2 text-white font-semibold">
              <Sparkles className="w-5 h-5" />
              Try AI Search
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => router.push('/n8n-workflows')}
            className="group relative px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2 text-white font-semibold">
              Browse Workflows
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Floating AI Tool Icons */}
        <FloatingIcons />

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl font-bold text-white mb-2">2,057+</div>
              <div className="text-sm text-white/60">Workflows</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl font-bold text-white mb-2">89+</div>
              <div className="text-sm text-white/60">Integrations</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-white/60">Open Source</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Pyramid Loader (Decorative) */}
      <div className="absolute bottom-20 right-20 hidden lg:block">
        <div className="pyramid-loader">
          <div className="wrapper">
            <span className="side side1"></span>
            <span className="side side2"></span>
            <span className="side side3"></span>
            <span className="side side4"></span>
            <span className="shadow"></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .pyramid-loader {
          position: relative;
          width: 80px;
          height: 80px;
          display: block;
          transform-style: preserve-3d;
          transform: rotateX(-20deg);
        }

        .wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          100% {
            transform: rotateY(360deg);
          }
        }

        .side {
          width: 0;
          height: 0;
          position: absolute;
          opacity: 0.6;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
          border-bottom: 70px solid;
        }

        .side1 {
          border-bottom-color: rgba(147, 51, 234, 0.8);
          transform: rotateY(0deg) rotateX(30deg) translateZ(20px);
        }

        .side2 {
          border-bottom-color: rgba(219, 39, 119, 0.8);
          transform: rotateY(90deg) rotateX(30deg) translateZ(20px);
        }

        .side3 {
          border-bottom-color: rgba(6, 182, 212, 0.8);
          transform: rotateY(180deg) rotateX(30deg) translateZ(20px);
        }

        .side4 {
          border-bottom-color: rgba(168, 85, 247, 0.8);
          transform: rotateY(270deg) rotateX(30deg) translateZ(20px);
        }

        .shadow {
          width: 80px;
          height: 80px;
          background: rgba(147, 51, 234, 0.2);
          position: absolute;
          top: 60px;
          left: 0;
          transform: rotateX(90deg);
          filter: blur(20px);
        }
      `}</style>
    </div>
  );
}

