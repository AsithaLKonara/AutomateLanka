'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, Search, Zap, Lightbulb, TrendingUp, Brain,
  MessageSquare, Download, CheckCircle, XCircle, Globe,
  Clock, Layers, Plus, ArrowLeft, ArrowRight
} from 'lucide-react'
import N8nWorkflowCard from '@/components/N8nWorkflowCard'

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
        fetchSuggestions(query)
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const fetchSuggestions = async (q: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows?q=${encodeURIComponent(q)}&per_page=5`)
      const data = await response.json()
      setSuggestions(data.workflows?.map((w: any) => w.name) || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  const handleSimpleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows?q=${encodeURIComponent(query)}&per_page=12`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setResults(data.workflows || [])
      setAnalysis(null)
      setExplanation(`Found ${data.total || 0} workflows matching "${query}" using semantic search analysis.`)
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
      const response = await fetch(`${BACKEND_URL}/api/workflows?q=${encodeURIComponent(description)}&per_page=12`)
      if (!response.ok) throw new Error('Describe search failed')
      const data = await response.json()
      setResults(data.workflows || [])
      setAnalysis(null)
      setExplanation(`AI analyzed your request: "${description}" and found ${data.total || 0} relevant automation patterns.`)
    } catch (error) {
      console.error('Describe search error:', error)
      setError('Failed to find workflows. Please try again.')
    } finally {
      setIsLoading(false)
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
    <div className="flex flex-col gap-8">
      {/* Search Header Section */}
      <div className="bg-white p-8 rounded-n8n border border-n8n-foreground shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-n8n-primary/10 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-n8n-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-n8n-text-shade">AI-Powered Search</h1>
            <p className="text-sm text-n8n-text-tint">Describe what you need in natural language</p>
          </div>
        </div>

        {/* Search Mode Tabs */}
        <div className="flex gap-2 mb-6 bg-n8n-background p-1 rounded-md w-fit">
          <button
            onClick={() => setSearchMode('simple')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${searchMode === 'simple' ? 'bg-white text-n8n-primary shadow-sm' : 'text-n8n-text-tint hover:text-n8n-text'
              }`}
          >
            Simple Search
          </button>
          <button
            onClick={() => setSearchMode('describe')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${searchMode === 'describe' ? 'bg-white text-n8n-primary shadow-sm' : 'text-n8n-text-tint hover:text-n8n-text'
              }`}
          >
            Describe & Find
          </button>
        </div>

        {/* Input Area */}
        {searchMode === 'simple' ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-n8n-text-tint" />
              <input
                type="text"
                placeholder="Try: Send Slack notifications when form is submitted..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 rounded-n8n border-2 border-n8n-foreground focus:border-n8n-primary/30 focus:ring-4 focus:ring-n8n-primary/5 transition-all text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-n8n-text-tint uppercase tracking-wider">Example:</span>
              {exampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(q)}
                  className="text-xs text-n8n-primary hover:underline"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <textarea
              placeholder="Describe your automation goal in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-n8n border-2 border-n8n-foreground focus:border-n8n-primary/30 focus:ring-4 focus:ring-n8n-primary/5 transition-all text-base resize-none"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={searchMode === 'simple' ? handleSimpleSearch : handleDescribeSearch}
            disabled={isLoading || (searchMode === 'simple' ? !query.trim() : !description.trim())}
            className="flex items-center gap-2 px-6 py-2.5 rounded-n8n bg-n8n-primary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Execute AI Search'}</span>
          </button>
        </div>
      </div>

      {/* AI Explanation Area */}
      {explanation && !isLoading && (
        <div className="bg-n8n-primary/5 border border-n8n-primary/10 rounded-n8n p-6 flex gap-4 animate-slide-up">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-n8n-primary/20">
            <Brain size={20} className="text-n8n-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-n8n-primary uppercase tracking-tight">AI Insights</h3>
            <p className="text-sm text-n8n-text leading-relaxed">{explanation}</p>
            {analysis && (
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.concepts.map((c, idx) => (
                  <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-n8n-foreground text-[10px] font-bold text-n8n-text-tint">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-n8n-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-n8n-text-tint">AI is scanning the repository...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((workflow) => (
              <N8nWorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (query || description) && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-n8n-text-tint italic">No perfect matches found. Try broadening your description.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

