'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, Search, Brain, ArrowRight
} from 'lucide-react'

interface Workflow {
  id: number;
  filename: string;
  name: string;
  active: boolean;
  description: string;
  trigger_type: string;
  complexity: string;
  node_count: number;
  integrations: string[];
  tags: string[];
}

interface QueryAnalysis {
  intent: string;
  concepts: string[];
  triggerType?: string;
  complexity?: string;
}

export default function AISearchPage() {
  const [searchMode, setSearchMode] = useState<'simple' | 'describe'>('simple')
  const [query, setQuery] = useState('')
  const [description, setDescription] = useState('')
  const [results, setResults] = useState<Workflow[]>([])
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null)
  const [explanation, setExplanation] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        // fetchSuggestions(query)
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  //   const fetchSuggestions = async (q: string) => {
  //     try {
  //       const response = await fetch(`${BACKEND_URL}/api/workflows?q=${encodeURIComponent(q)}&per_page=5`)
  //       const data = await response.json()
  //       setSuggestions(data.workflows?.map((w: any) => w.name) || [])
  //     } catch (error) {
  //       console.error('Failed to fetch suggestions:', error)
  //     }
  //   }

  const handleSimpleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-search/semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await response.json()
      if (data.results) {
        setResults(data.results)
        setExplanation(data.explanation || `Found ${data.total} workflows matching "${query}".`)
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDescribeSearch = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-search/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })
      const data = await response.json()
      if (data.results) {
        setResults(data.results)
        setExplanation(data.explanation || `AI analyzed your request and found ${data.total} relevant automation patterns.`)
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Describe search error:', error)
      setError('Failed to find workflows. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloneWorkflow = async (workflowId: string) => {
    try {
      // In a real app, we'd show a workspace picker. For now, we'll try to clone to the current/default workspace.
      const response = await fetch(`${BACKEND_URL}/api/saas-workflows/${workflowId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming auth header is needed if logged in
        },
        body: JSON.stringify({
          targetWorkspaceId: 'current', // Backend needs to handle this or we need to pass a real ID
          newName: `Copy of ${results.find(r => r.id.toString() === workflowId)?.name}`
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Workflow cloned successfully to your workspace!')
      } else {
        alert(`Failed to clone: ${data.message}`)
      }
    } catch (error) {
      console.error('Clone error:', error)
      alert('Failed to clone workflow.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'simple') {
        handleSimpleSearch()
      } else {
        handleDescribeSearch()
      }
    }
  }

  const exampleQueries = [
    'Send Slack notifications when new form submissions arrive',
    'Synchronize data between Google Sheets and a database',
    'Process incoming webhooks and trigger automated workflows',
    'Schedule daily reports and email them to team members',
  ]

  return (
    <div className="min-h-screen bg-[#0e0918] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#3b82f6]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#8b5cf6]/10 mb-4">
            <Sparkles className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered Workflow Search</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Describe your automation needs in plain English, and our AI will find the perfect workflow template for you.
          </p>
        </div>

        {/* Search Container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl shadow-2xl shadow-purple-900/20">
          <div className="flex p-1 mb-4 bg-black/20 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setSearchMode('simple')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${searchMode === 'simple' ? 'bg-[#8b5cf6] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              Simple Search
            </button>
            <button
              onClick={() => setSearchMode('describe')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${searchMode === 'describe' ? 'bg-[#8b5cf6] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              Describe & Find
            </button>
          </div>

          <div className="p-4 md:p-8">
            {searchMode === 'simple' ? (
              <div className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-[#8b5cf6] transition-colors" />
                  <input
                    type="text"
                    placeholder="Try: Send Slack notifications when form is submitted..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all text-lg text-white placeholder:text-white/20 outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider py-1">Examples:</span>
                  {exampleQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(q)}
                      className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-[#8b5cf6]/50 text-white/60 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group">
                  <Brain className="absolute left-4 top-4 h-5 w-5 text-white/40 group-focus-within:text-[#8b5cf6] transition-colors" />
                  <textarea
                    placeholder="Describe your automation goal in detail. For example: 'I want to watch for new rows in my Google Sheet, filter them for 'Urgent' status, and then create a Jira ticket and send a Slack message to the #devops channel.'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all text-lg text-white placeholder:text-white/20 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={searchMode === 'simple' ? handleSimpleSearch : handleDescribeSearch}
                disabled={isLoading || (searchMode === 'simple' ? !query.trim() : !description.trim())}
                className="px-8 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-lg shadow-lg hover:shadow-[#8b5cf6]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Execute AI Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis & Results */}
        {(results.length > 0 || explanation) && !isLoading && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
            {explanation && (
              <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl p-6 flex gap-4">
                <div className="shrink-0">
                  <Brain className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">AI Analysis</h3>
                  <p className="text-white/80">{explanation}</p>
                  {analysis && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {analysis.concepts.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-[#8b5cf6]/20 rounded text-xs font-mono text-[#8b5cf6] border border-[#8b5cf6]/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((workflow) => (
                <div key={workflow.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#8b5cf6]/20 rounded-xl text-[#8b5cf6]">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${workflow.complexity === 'low' ? 'border-green-500/20 text-green-400 bg-green-500/10' : 'border-amber-500/20 text-amber-400 bg-amber-500/10'}`}>
                      {workflow.complexity?.toUpperCase() || 'MEDIUM'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#8b5cf6] transition-colors">{workflow.name}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-3">{workflow.description}</p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {workflow.integrations?.map((app, i) => (
                        <div key={i} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white/60 border border-white/5">
                          {app}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneWorkflow(workflow.id.toString());
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#8b5cf6] text-white/70 hover:text-white transition-all font-bold flex items-center gap-1.5"
                      >
                        Clone Template
                      </button>
                      <button className="text-sm font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
