'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Download, CheckCircle, XCircle, Zap, Globe,
  Clock, Layers, ArrowLeft, ArrowRight, Sparkles,
  Code2, Network, Activity, Package, Workflow as WorkflowIcon, Eye
} from 'lucide-react'

interface Workflow {
  id: number
  filename: string
  name: string
  active: boolean
  description: string
  trigger_type: string
  complexity: string
  node_count: number
  integrations: string[]
  tags: string[]
}

interface WorkflowStats {
  total: number
  active: number
  inactive: number
  triggers: Record<string, number>
  complexity: Record<string, number>
  total_nodes: number
  unique_integrations: number
}

export default function N8NWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('all')
  const [complexityFilter, setComplexityFilter] = useState('all')
  const [activeOnly, setActiveOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    loadStats()
    loadWorkflows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadWorkflows()
  }, [searchQuery, triggerFilter, complexityFilter, activeOnly, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    try {
      // Mock stats if backend fails or for demo
      setStats({
        total: 124,
        active: 89,
        inactive: 35,
        triggers: { webhook: 45, scheduled: 30, manual: 20 },
        complexity: { low: 50, medium: 40, high: 34 },
        total_nodes: 5400,
        unique_integrations: 28
      })
      // const response = await fetch(`${BACKEND_URL}/api/workflows/stats`)
      // const data = await response.json()
      // setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadWorkflows = async () => {
    setIsLoading(true)
    try {
      // Mock data for display
      await new Promise(r => setTimeout(r, 800));
      setWorkflows([
        { id: 1, filename: 'social-auto', name: 'Social Media Automation', active: true, description: 'Post to Twitter, LinkedIn, and Facebook automatically from a Notion database.', trigger_type: 'scheduled', complexity: 'medium', node_count: 12, integrations: ['Notion', 'Twitter', 'LinkedIn', 'Facebook'], tags: ['social', 'marketing'] },
        { id: 2, filename: 'email-parser', name: 'Email Lead Parser', active: true, description: 'Extract leads from incoming emails and save to CRM.', trigger_type: 'webhook', complexity: 'low', node_count: 5, integrations: ['Gmail', 'HubSpot'], tags: ['sales', 'crm'] },
        { id: 3, filename: 'crypto-alert', name: 'Crypto Price Alerts', active: false, description: 'Send Telegram alerts when BTC crosses a threshold.', trigger_type: 'scheduled', complexity: 'low', node_count: 4, integrations: ['CoinGecko', 'Telegram'], tags: ['finance', 'crypto'] },
        { id: 4, filename: 'slack-bot', name: 'Slack Support Bot', active: true, description: 'AI-powered Slack bot to answer common support questions using OpenAI.', trigger_type: 'webhook', complexity: 'high', node_count: 24, integrations: ['Slack', 'OpenAI', 'Pinecone'], tags: ['support', 'ai'] }
      ])
      setIsLoading(false)
      // const params = new URLSearchParams({
      //   q: searchQuery,
      //   trigger: triggerFilter,
      //   complexity: complexityFilter,
      //   active_only: activeOnly.toString(),
      //   page: currentPage.toString(),
      //   per_page: '12'
      // })

      // const response = await fetch(`${BACKEND_URL}/api/workflows?${params}`)
      // const data = await response.json()

      // setWorkflows(data.workflows || [])
      // setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadWorkflow = async (filename: string) => {
    // console.log("Downloading", filename)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger.toLowerCase()) {
      case 'webhook': return <Globe className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'complex': return <Layers className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#3b82f6]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0e0918]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-10 h-10 bg-[#8b5cf6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <WorkflowIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Marketplace</h1>
                  <p className="text-xs text-white/50">
                    {stats?.total.toLocaleString() || '...'} workflows
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex gap-3">
              <Link href="/ai-search">
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                  Try AI Search
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Flows", value: stats.total, icon: <Package className="h-4 w-4" />, color: "text-blue-400" },
                { label: "Active", value: stats.active, icon: <Activity className="h-4 w-4" />, color: "text-green-400" },
                { label: "Total Nodes", value: (stats.total_nodes / 1000).toFixed(1) + "K", icon: <Network className="h-4 w-4" />, color: "text-purple-400" },
                { label: "Integrations", value: stats.unique_integrations, icon: <Code2 className="h-4 w-4" />, color: "text-orange-400" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              {
                value: triggerFilter, set: setTriggerFilter, options: [
                  { v: 'all', l: 'All Triggers' }, { v: 'webhook', l: 'Webhook' }, { v: 'scheduled', l: 'Scheduled' }, { v: 'manual', l: 'Manual' }, { v: 'complex', l: 'Complex' }
                ]
              },
              {
                value: complexityFilter, set: setComplexityFilter, options: [
                  { v: 'all', l: 'All Complexity' }, { v: 'low', l: 'Low' }, { v: 'medium', l: 'Medium' }, { v: 'high', l: 'High' }
                ]
              }
            ].map((filter, i) => (
              <select
                key={i}
                value={filter.value}
                onChange={(e) => {
                  filter.set(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white font-medium focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all outline-none cursor-pointer"
              >
                {filter.options.map(o => <option key={o.v} value={o.v} className="bg-[#0e0918]">{o.l}</option>)}
              </select>
            ))}

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all ml-0 sm:ml-auto">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => {
                  setActiveOnly(e.target.checked)
                  setCurrentPage(1)
                }}
                className="w-4 h-4 rounded border-white/20 bg-transparent text-[#8b5cf6] focus:ring-[#8b5cf6]"
              />
              <span className="font-medium text-white/80 select-none">Active Only</span>
            </label>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-medium"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-40">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/40 font-medium animate-pulse">Loading workflows...</p>
            </div>
          </div>
        )}

        {/* Workflows Grid */}
        {!isLoading && (
          <>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 gap-4"}>
              {workflows.map((workflow, idx) => (
                <div
                  key={workflow.id}
                  className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#8b5cf6]/50 transition-all group relative overflow-hidden ${viewMode === 'list' ? 'flex flex-row items-center gap-6' : ''}`}
                >
                  <div className={`absolute top-0 right-0 p-[1px] rounded-bl-xl bg-gradient-to-bl from-white/10 to-transparent ${viewMode === 'list' ? 'hidden' : ''}`}>
                    <div className="bg-[#0e0918] rounded-bl-xl p-2">
                      <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-green-500 box-shadow-green' : 'bg-red-500'}`}></div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className={`flex items-start justify-between mb-4 ${viewMode === 'list' ? 'mb-0 w-48 shrink-0 flex-col' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-white/5 text-white shadow-inner">
                        {getTriggerIcon(workflow.trigger_type)}
                      </div>
                      <div className={viewMode === 'list' ? 'block' : 'hidden'}>
                        <div className="text-sm font-bold text-white">{workflow.trigger_type}</div>
                        <div className="text-xs text-white/40">Trigger</div>
                      </div>
                    </div>

                    <div className={`${viewMode === 'list' ? 'hidden' : 'flex'} gap-2`}>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getComplexityColor(workflow.complexity)}`}>
                        {workflow.complexity}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1 text-white group-hover:text-[#8b5cf6] transition-colors">
                      {workflow.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-4 line-clamp-2 leading-relaxed">
                      {workflow.description || 'No description available for this workflow.'}
                    </p>

                    {/* Metadata in List Mode */}
                    {viewMode === 'list' && (
                      <div className="flex gap-4 text-xs font-medium text-white/60">
                        <span className="flex items-center gap-1"><Network size={12} /> {workflow.node_count} Nodes</span>
                        <span className="flex items-center gap-1"><Code2 size={12} /> {workflow.integrations.length} Apps</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata (Grid Only) */}
                  <div className={`${viewMode === 'list' ? 'hidden' : 'grid'} grid-cols-3 gap-2 mb-6 text-xs font-medium text-white/60`}>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <span className="block text-[#8b5cf6] font-bold text-sm">{workflow.node_count}</span> Nodes
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <span className="block text-blue-400 font-bold text-sm">{workflow.integrations.length}</span> Apps
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <span className="block text-white font-bold text-sm capitalize">{workflow.trigger_type}</span>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className={`${viewMode === 'list' ? 'w-48 hidden lg:flex' : 'mb-6 flex'} flex-wrap gap-1 content-center`}>
                    {workflow.integrations.slice(0, 3).map((integration, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-white/5 text-white/60 text-xs border border-white/5">
                        {integration}
                      </span>
                    ))}
                    {workflow.integrations.length > 3 && (
                      <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-xs">+{workflow.integrations.length - 3}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'w-40 shrink-0' : 'mt-auto'}`}>
                    <button
                      onClick={() => downloadWorkflow(workflow.filename)}
                      className="flex-1 py-2 px-4 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-900/20"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    {viewMode !== 'list' && (
                      <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pb-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 transition-all text-sm font-medium"
                >
                  Previous
                </button>
                <div className="text-sm text-white/40 font-medium px-4">
                  Page <span className="text-white">{currentPage}</span> of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 transition-all text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}

            {/* Empty State */}
            {workflows.length === 0 && !isLoading && (
              <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No workflows found</h3>
                <p className="text-white/50">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
