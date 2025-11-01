'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Zap, Brain, Search, Workflow, Rocket, TrendingUp,
  Clock, Network, Code2, Sparkles, ArrowRight, CheckCircle,
  Star, GitBranch, Boxes, Activity, Globe
} from 'lucide-react'

export default function HomePage() {
  const [stats, setStats] = useState({
    workflows: 2057,
    active: 2048,
    integrations: 326,
    nodes: 76618
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="tech-grid absolute inset-0 opacity-30"></div>
      </div>

      {/* Hero Section */}
      <div className="container-custom section-padding">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 mb-8 animate-scale-in">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">Welcome to AutomateLanka</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block mb-2">Automation</span>
            <span className="text-gradient-tech">Intelligence Hub</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover, search, and deploy {stats.workflows.toLocaleString()}+ production-ready workflows 
            with <span className="font-semibold text-purple-600">AI-powered search</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/ai-search">
              <button className="btn-primary group">
                <Brain className="h-5 w-5" />
                <span>Try AI Search</span>
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </button>
            </Link>
            <Link href="/n8n-workflows">
              <button className="btn-secondary group">
                <Workflow className="h-5 w-5" />
                <span>Browse Workflows</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Workflows", value: stats.workflows.toLocaleString(), icon: <Workflow className="h-6 w-6" />, color: "blue" },
              { label: "Active", value: stats.active.toLocaleString(), icon: <Activity className="h-6 w-6" />, color: "green" },
              { label: "Integrations", value: stats.integrations.toLocaleString(), icon: <Network className="h-6 w-6" />, color: "purple" },
              { label: "Total Nodes", value: (stats.nodes/1000).toFixed(1) + "K", icon: <Boxes className="h-6 w-6" />, color: "orange" }
            ].map((stat, idx) => (
              <div key={idx} className="card-modern p-6 text-center group hover:scale-105 transition-all duration-300"
                style={{animationDelay: `${idx * 100}ms`}}>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-4">
            <Rocket className="h-4 w-4" />
            <span className="text-sm font-semibold">Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient">automate</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced search, intelligent recommendations, and instant deployment
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Link key={idx} href={feature.link}>
              <div className="card-modern p-6 h-full group cursor-pointer hover-lift"
                style={{animationDelay: `${idx * 100}ms`}}>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Showcase Workflows */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
            <Star className="h-4 w-4" />
            <span className="text-sm font-semibold">Popular Workflows</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Production-ready <span className="text-gradient">automations</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Download and deploy workflows in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {showcaseWorkflows.map((workflow, idx) => (
            <div key={idx} className="card-modern p-6 group hover-lift"
              style={{animationDelay: `${idx * 150}ms`}}>
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-${workflow.color}-100 text-${workflow.color}-700`}>
                  {workflow.complexity}
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">{workflow.title}</h3>
              <p className="text-gray-600 mb-4">{workflow.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {workflow.integrations.map((int, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                    {int}
                  </span>
                ))}
              </div>
              <Link href="/n8n-workflows">
                <button className="w-full py-2 px-4 rounded-lg border-2 border-gray-200 font-semibold group-hover:border-blue-500 group-hover:text-blue-600 transition-all">
                  View Workflow
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-custom section-padding">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <Rocket className="h-16 w-16 mx-auto mb-6 animate-float" />
            <h2 className="text-4xl font-bold mb-4">Ready to Automate?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Start exploring {stats.workflows.toLocaleString()}+ workflows with AI-powered search
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai-search">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                  Try AI Search
                </button>
              </Link>
              <Link href="/n8n-workflows">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30">
                  Browse All Workflows
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">AutomateLanka</div>
                <div className="text-sm text-gray-600">Automation Intelligence Hub</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/n8n-workflows" className="hover:text-blue-600 transition-colors">
                Workflows
              </Link>
              <Link href="/ai-search" className="hover:text-blue-600 transition-colors">
                AI Search
              </Link>
              <a href="http://localhost:8000/docs" target="_blank" className="hover:text-blue-600 transition-colors">
                API Docs
              </a>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 AutomateLanka • Node.js + Next.js
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

