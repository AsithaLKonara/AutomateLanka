'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Activity, TrendingUp, Zap, Users, Clock, Package, Network, Code2,
  ArrowUpRight, ArrowDownRight, Sparkles, Brain, Search, Download
} from 'lucide-react'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { StatCard } from '@/components/StatCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    loadStats()
    
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/stats`)
      const data = await response.json()
      setStats(data)
      } catch (error) {
      console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading dashboard..." />
  }

  const activationRate = stats ? ((stats.active / stats.total) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground variant="blue" />

      {/* Header */}
      <div className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Analytics and insights for your workflows</p>
            </div>
            <div className="flex gap-3">
              <Link href="/ai-search">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Search
                </button>
              </Link>
              <Link href="/n8n-workflows">
                <button className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 font-semibold transition-all">
                  Browse Workflows
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Workflows"
            value={stats?.total || 0}
            icon={Package}
            color="blue"
          />
          <StatCard
            label="Active Workflows"
            value={stats?.active || 0}
            icon={Activity}
            color="green"
            trend={{ value: Number(activationRate), isPositive: true }}
          />
          <StatCard
            label="Total Nodes"
            value={stats?.total_nodes ? `${(stats.total_nodes/1000).toFixed(1)}K` : '0'}
            icon={Network}
            color="purple"
          />
          <StatCard
            label="Integrations"
            value={stats?.unique_integrations || 0}
            icon={Code2}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Trigger Types */}
          <div className="card-modern p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Trigger Types
            </h2>
            <div className="space-y-4">
              {stats?.triggers && Object.entries(stats.triggers).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(count as number / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity Distribution */}
          <div className="card-modern p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Complexity Distribution
            </h2>
            <div className="space-y-4">
              {stats?.complexity && Object.entries(stats.complexity).map(([level, count]) => {
                const colors = {
                  low: 'from-green-500 to-emerald-600',
                  medium: 'from-yellow-500 to-orange-600',
                  high: 'from-red-500 to-pink-600'
                }
                
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{level}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${colors[level as keyof typeof colors]} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(count as number / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="card-modern p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <Link key={idx} href={`/ai-search?q=${encodeURIComponent(search)}`}>
                  <div className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
                    <span className="text-sm font-medium">{search}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/ai-search">
            <div className="card-modern p-6 group hover-lift h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI-Powered Search</h3>
              <p className="text-gray-600 mb-4">Find workflows using natural language</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                <span>Try Now</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
          </Link>

          <Link href="/n8n-workflows">
            <div className="card-modern p-6 group hover-lift h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Workflow className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Browse All Workflows</h3>
              <p className="text-gray-600 mb-4">Explore {stats?.total || '2,057'}+ automations</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                <span>Explore</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
          </Link>

          <div className="card-modern p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full filter blur-3xl opacity-30"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Popular Today</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Slack notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Google Sheets sync</span>
                  </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Webhook automation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mt-8 card-modern p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            System Activity
          </h2>
                <div className="space-y-4">
            {[
              { action: 'Workflows indexed', count: stats?.total || 0, time: 'Just now', icon: Package, color: 'blue' },
              { action: 'Active workflows', count: stats?.active || 0, time: '1 min ago', icon: Activity, color: 'green' },
              { action: 'Database optimized', count: 1, time: '5 min ago', icon: Zap, color: 'yellow' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white`}>
                  <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                  <div className="font-semibold">{item.action}</div>
                  <div className="text-sm text-gray-600">{item.time}</div>
                      </div>
                <div className="text-2xl font-bold">{item.count.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
        </div>
      </div>
    </div>
  )
}
