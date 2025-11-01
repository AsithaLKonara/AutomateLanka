'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Zap, Brain, Search, Workflow, Rocket, TrendingUp,
  Clock, Network, Code2, Sparkles, ArrowRight, CheckCircle,
  Star, GitBranch, Boxes, Activity, Globe, Shield, Gauge
} from 'lucide-react'
import HeroSection from '@/components/HeroSection'
import AdvancedSearchSection from '@/components/AdvancedSearchSection'
import PremiumGlassCard from '@/components/PremiumGlassCard'

export default function HomePage() {
  const [stats, setStats] = useState({
    workflows: 2057,
    active: 2048,
    integrations: 326,
    nodes: 76618
  })

  useEffect(() => {
    // Fetch real stats
    fetch('http://localhost:8000/api/workflows/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          workflows: data.total || 2057,
          active: data.active || 2048,
          integrations: data.unique_integrations || 326,
          nodes: data.total_nodes || 76618
        })
      })
      .catch(console.error)
  }, [])

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Search",
      description: "Find workflows using natural language and smart suggestions",
      gradient: "from-purple-500 to-pink-500",
      link: "/ai-search"
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "2,057+ Workflows",
      description: "Production-ready automations for every use case",
      gradient: "from-blue-500 to-cyan-500",
      link: "/n8n-workflows"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Discovery",
      description: "Intelligent filtering and instant recommendations",
      gradient: "from-green-500 to-emerald-500",
      link: "/n8n-workflows"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Sub-millisecond search with local processing",
      gradient: "from-yellow-500 to-orange-500",
      link: "/n8n-workflows"
    }
  ]

  const showcaseWorkflows = [
    {
      title: "Slack Notifications",
      description: "Automated team alerts and updates",
      integrations: ["Slack", "Webhook", "Email"],
      complexity: "Low",
      color: "blue"
    },
    {
      title: "Data Synchronization",
      description: "Keep your data in sync across platforms",
      integrations: ["Google Sheets", "PostgreSQL", "API"],
      complexity: "Medium",
      color: "purple"
    },
    {
      title: "Scheduled Reports",
      description: "Daily analytics and insights delivered",
      integrations: ["Analytics", "Email", "Slack"],
      complexity: "Low",
      color: "green"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Premium Hero Section */}
      <HeroSection />

      {/* Advanced AI Search Section */}
      <div className="container-custom section-padding">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">AI-Powered Search</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Find workflows with <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">natural language</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Our smart search understands intent, suggests similar workflows, and learns from your preferences
          </p>
        </div>
        <AdvancedSearchSection />
      </div>

      {/* Premium Features Section */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
            <Rocket className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Everything you need to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">automate</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Advanced search, intelligent recommendations, and instant deployment
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/ai-search">
            <PremiumGlassCard
              icon={Brain}
              title="AI-Powered Search"
              description="Find workflows using natural language and smart suggestions"
              gradient="from-purple-500 to-pink-500"
            />
          </Link>
          <Link href="/n8n-workflows">
            <PremiumGlassCard
              icon={Workflow}
              title="2,057+ Workflows"
              description="Production-ready automations for every use case"
              gradient="from-blue-500 to-cyan-500"
            />
          </Link>
          <Link href="/n8n-workflows">
            <PremiumGlassCard
              icon={Gauge}
              title="Lightning Fast"
              description="Sub-millisecond search with local processing"
              gradient="from-yellow-500 to-orange-500"
            />
          </Link>
          <Link href="/n8n-workflows">
            <PremiumGlassCard
              icon={Shield}
              title="Open Source"
              description="100% open source and community-driven platform"
              gradient="from-green-500 to-emerald-500"
            />
          </Link>
        </div>
      </div>

      {/* Showcase Workflows */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Popular Workflows</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Production-ready <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">automations</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Download and deploy workflows in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {showcaseWorkflows.map((workflow, idx) => (
            <div 
              key={idx} 
              className="group relative"
              style={{animationDelay: `${idx * 150}ms`}}
            >
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"
              ></div>
              <div 
                className="relative rounded-2xl p-8 transition-all duration-300 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.074)',
                  border: '1px solid rgba(255, 255, 255, 0.222)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-${workflow.color}-500/20 text-${workflow.color}-300 border border-${workflow.color}-500/30`}>
                    {workflow.complexity}
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{workflow.title}</h3>
                <p className="text-white/70 mb-4">{workflow.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {workflow.integrations.map((int, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/80 border border-white/10">
                      {int}
                    </span>
                  ))}
                </div>
                <Link href="/n8n-workflows">
                  <button className="w-full py-3 px-4 rounded-xl border-2 border-white/20 font-semibold text-white group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all">
                    View Workflow
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium CTA Section */}
      <div className="container-custom section-padding">
        <div className="relative group">
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          
          {/* Main CTA Card */}
          <div 
            className="relative overflow-hidden rounded-3xl p-16 text-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                  backgroundSize: '2rem 2rem',
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                <Rocket className="h-12 w-12 text-white animate-pulse" />
              </div>
              <h2 className="text-5xl font-bold mb-6 text-white">
                Ready to <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Automate</span>?
              </h2>
              <p className="text-2xl mb-12 max-w-3xl mx-auto text-white/80">
                Start exploring {stats.workflows.toLocaleString()}+ workflows with AI-powered semantic search
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/ai-search">
                  <button className="group/btn relative px-10 py-5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
                    <div className="absolute inset-[2px] bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"></div>
                    <span className="relative flex items-center gap-3 text-white font-bold text-lg">
                      <Sparkles className="w-6 h-6" />
                      Try AI Search
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>
                <Link href="/n8n-workflows">
                  <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50 hover:scale-105">
                    Browse All Workflows
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <div className="border-t border-white/10 py-16 mt-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="font-bold text-2xl text-white">AutomateLanka</div>
                <div className="text-sm text-white/60">Automation Intelligence Hub</div>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/n8n-workflows" className="text-white/70 hover:text-white transition-colors font-medium">
                Workflows
              </Link>
              <Link href="/ai-search" className="text-white/70 hover:text-white transition-colors font-medium">
                AI Search
              </Link>
              <a href="http://localhost:8000/docs" target="_blank" className="text-white/70 hover:text-white transition-colors font-medium">
                API Docs
              </a>
            </div>
            <div className="text-sm text-white/60">
              © 2025 AutomateLanka • Node.js + Next.js
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

