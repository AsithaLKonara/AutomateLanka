'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter, Play, Pause, Edit, Trash2, Copy,
  CheckCircle, XCircle, AlertCircle, Zap, Settings, Activity,
  Loader2, RefreshCw
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

// Mock Tabs component for speed/compatibility with raw tailwind
const Tabs = ({ children, defaultValue, className }: any) => {
  const [active, setActive] = useState(defaultValue)
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { active, setActive } as any)
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ children, active, setActive }: any) => (
  <div className="flex space-x-1 rounded-xl bg-white/5 p-1">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { active, setActive } as any)
      }
      return child
    })}
  </div>
)

const TabsTrigger = ({ value, children, active, setActive }: any) => (
  <button
    onClick={() => setActive(value)}
    className={`w-full rounded-lg py-2.5 text-sm font-bold leading-5 transition-all
            ${active === value
        ? 'bg-[#8b5cf6] text-white shadow'
        : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
  >
    {children}
  </button>
)

const TabsContent = ({ value, children, active }: any) => {
  if (value !== active) return null
  return <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div>
}


export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/saas-workflows')
      // The API returns { success: true, data: { workflows: [], total: 0 } }
      setWorkflows(response.data.data.workflows || [])
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const toggleStatus = async (workflow: any) => {
    try {
      const newStatus = !workflow.active
      await apiClient.put(`/api/saas-workflows/${workflow.id}`, {
        active: newStatus
      })
      // Update local state
      setWorkflows(prev => prev.map(w =>
        w.id === workflow.id ? { ...w, active: newStatus } : w
      ))
    } catch (error) {
      console.error('Failed to toggle workflow status:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'paused': return <Pause className="h-4 w-4 text-amber-400" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0918] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0e0918]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                My Workflows
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Manage and monitor your automation pipelines
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <Link
                href="/w/default/workflows/new-visual/edit"
                className="px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
              >
                <Plus className="h-4 w-4" />
                Create Workflow
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="my-workflows" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>

          <TabsContent value="my-workflows">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] outline-none text-white placeholder:text-white/30 transition-all"
                />
              </div>
              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Workflows Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#8b5cf6]/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${workflow.active ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {getStatusIcon(workflow.active ? 'running' : 'paused')}
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-[#8b5cf6] transition-colors">{workflow.name}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${workflow.active ? 'text-green-400' : 'text-amber-400'}`}>
                            {workflow.active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-white/50 mb-6 line-clamp-2 h-10">
                      {workflow.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Success Rate</span>
                        <span className="text-green-400 font-bold">{workflow.successRate}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${workflow.successRate}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(workflow)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${workflow.active
                          ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                          : 'bg-[#8b5cf6] border-transparent text-white hover:bg-[#7c3aed]'}`}>
                        {workflow.active ? (
                          <> <Pause className="h-4 w-4" /> Pause </>
                        ) : (
                          <> <Play className="h-4 w-4" /> Start </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Card */}
                <div className="group border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-[#8b5cf6]/50 hover:bg-white/5 transition-all cursor-pointer min-h-[250px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                    <Plus className="w-6 h-6 text-white/40 group-hover:text-white" />
                  </div>
                  <p className="font-bold text-white/60 group-hover:text-white">Create New Workflow</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center py-20">
              <p className="text-white/50">Templates content placeholder...</p>
            </div>
          </TabsContent>

          <TabsContent value="executions">
            <div className="text-center py-20">
              <p className="text-white/50">Execution history placeholder...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
