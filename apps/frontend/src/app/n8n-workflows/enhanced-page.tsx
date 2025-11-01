'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, Filter, Download, CheckCircle, XCircle, Zap, Globe,
  Clock, Layers, ArrowLeft, ArrowRight, Sparkles, TrendingUp,
  Code2, Network, Activity, Star, Eye, Package
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
  }, [])

  useEffect(() => {
    loadWorkflows()
  }, [searchQuery, triggerFilter, complexityFilter, activeOnly, currentPage])

  const loadStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadWorkflows = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        trigger: triggerFilter,
        complexity: complexityFilter,
        active_only: activeOnly.toString(),
        page: currentPage.toString(),
        per_page: '12'
      })

      const response = await fetch(`${BACKEND_URL}/api/workflows?${params}`)
      const data = await response.json()
      
      setWorkflows(data.workflows || [])
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadWorkflow = async (filename: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${filename}/download`)
      const data = await response.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download workflow:', error)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger.toLowerCase()) {
      case 'webhook':
        return <Globe className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'complex':
        return <Layers className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '3s'}}></div>
        <div className="tech-grid absolute inset-0 opacity-20"></div>
      </div>

      {/* Header */}
      <div className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">N8N Workflows</h1>
                  <p className="text-sm text-gray-600">
                    {stats?.total.toLocaleString() || '2,057'}+ automation workflows
                  </p>
                </div>
              </div>
            </Link>
            
            <div className="flex gap-3">
              <Link href="/ai-search">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Try AI Search
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total", value: stats.total, icon: <Package className="h-4 w-4" />, color: "blue" },
                { label: "Active", value: stats.active, icon: <Activity className="h-4 w-4" />, color: "green" },
                { label: "Nodes", value: (stats.total_nodes/1000).toFixed(1) + "K", icon: <Network className="h-4 w-4" />, color: "purple" },
                { label: "Integrations", value: stats.unique_integrations, icon: <Code2 className="h-4 w-4" />, color: "orange" }
              ].map((stat, idx) => (
                <div key={idx} className="glass rounded-xl p-3 flex items-center gap-3 hover:scale-105 transition-transform">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows by name, description, or integration..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white shadow-sm text-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={triggerFilter}
              onChange={(e) => {
                setTriggerFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">🔄 All Triggers</option>
              <option value="webhook">🌐 Webhook</option>
              <option value="scheduled">⏰ Scheduled</option>
              <option value="manual">👆 Manual</option>
              <option value="complex">⚡ Complex</option>
            </select>

            <select
              value={complexityFilter}
              onChange={(e) => {
                setComplexityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">📊 All Complexity</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-blue-500 transition-all">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => {
                  setActiveOnly(e.target.checked)
                  setCurrentPage(1)
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Active Only</span>
            </label>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-500 transition-all font-medium"
            >
              {viewMode === 'grid' ? '📋 List View' : '📱 Grid View'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading workflows...</p>
            </div>
          </div>
        )}

        {/* Workflows Grid */}
        {!isLoading && (
          <>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {workflows.map((workflow, idx) => (
                <div 
                  key={workflow.id} 
                  className="card-modern p-6 group hover-lift animate-slide-up"
                  style={{animationDelay: `${idx * 50}ms`}}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getTriggerIcon(workflow.trigger_type)}
                      </div>
                      <div className={`badge-modern ${workflow.active ? 'badge-success' : 'badge-error'}`}>
                        {workflow.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {workflow.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className={`badge-modern border ${getComplexityColor(workflow.complexity)}`}>
                      {workflow.complexity}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {workflow.description || 'No description available'}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <div className="font-bold text-blue-600">{workflow.trigger_type}</div>
                      <div className="text-xs text-gray-600">Trigger</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <div className="font-bold text-purple-600">{workflow.node_count}</div>
                      <div className="text-xs text-gray-600">Nodes</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <div className="font-bold text-green-600">{workflow.integrations.length}</div>
                      <div className="text-xs text-gray-600">Services</div>
                    </div>
                  </div>

                  {/* Integrations */}
                  {workflow.integrations.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <Network className="h-3 w-3" />
                        <span>Integrations</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {workflow.integrations.slice(0, 4).map((integration, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            {integration}
                          </span>
                        ))}
                        {workflow.integrations.length > 4 && (
                          <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            +{workflow.integrations.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadWorkflow(workflow.filename)}
                      className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 font-semibold hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = currentPage <= 3 ? idx + 1 : currentPage - 2 + idx
                    if (pageNum > totalPages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110'
                            : 'border-2 border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 font-semibold hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {workflows.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No workflows found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Link href="/ai-search">
                  <button className="btn-primary">
                    <Sparkles className="h-4 w-4" />
                    Try AI Search Instead
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

