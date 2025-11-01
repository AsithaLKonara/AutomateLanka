'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@autolanka/ui'
import { Button } from '@autolanka/ui'
import { Badge } from '@autolanka/ui'
import { Input } from '@autolanka/ui'
import { 
  Sparkles,
  Search,
  Zap,
  Lightbulb,
  TrendingUp,
  Brain,
  MessageSquare,
  Download,
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  Layers
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
  similarity?: number
}

interface QueryAnalysis {
  intent: string
  concepts: string[]
  triggerType?: string
  complexity?: string
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

  // Get search suggestions as user types
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
      const response = await fetch(`${BACKEND_URL}/api/ai-search/suggestions?q=${encodeURIComponent(q)}`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  const handleSimpleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-search/semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 12 }),
      })

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setResults(data.results || [])
      setAnalysis(data.analysis)
      setExplanation(data.explanation || '')
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
        body: JSON.stringify({ description, limit: 12 }),
      })

      if (!response.ok) throw new Error('Describe search failed')

      const data = await response.json()
      setResults(data.results || [])
      setAnalysis(data.analysis)
      setExplanation(data.explanation || '')
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const exampleQueries = [
    'Send Slack notifications when new form submissions arrive',
    'Synchronize data between Google Sheets and a database',
    'Process incoming webhooks and trigger automated workflows',
    'Schedule daily reports and email them to team members',
    'Integrate Stripe payments with customer notifications',
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
        <div className="absolute top-20 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="circuit-pattern absolute inset-0 opacity-30"></div>
      </div>

      {/* Header */}
      <div className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                      AI-Powered Search
                      <Sparkles className="h-5 w-5 ml-2 text-yellow-500 animate-pulse" />
                    </h1>
                    <p className="text-sm text-gray-600">
                      Describe what you need in natural language
                    </p>
                  </div>
                </div>
              </Link>
              
              <div className="flex gap-3">
                <Link href="/n8n-workflows">
                  <button className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all font-semibold">
                    Browse All
                  </button>
                </Link>
              </div>
            </div>

            {/* Search Mode Toggle */}
            <div className="flex gap-3 mb-6">
              <Button
                variant={searchMode === 'simple' ? 'default' : 'outline'}
                onClick={() => setSearchMode('simple')}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                Simple Search
              </Button>
              <Button
                variant={searchMode === 'describe' ? 'default' : 'outline'}
                onClick={() => setSearchMode('describe')}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Describe & Find
              </Button>
            </div>

            {/* Search Interface */}
            {searchMode === 'simple' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Try: Send Slack notifications when form is submitted..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 text-lg"
                  />
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-1" />
                    <span className="text-sm text-gray-600">Suggestions:</span>
                    {suggestions.map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleSimpleSearch}
                  disabled={!query.trim() || isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI Search
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  placeholder="Describe what you want to automate:&#10;&#10;Example: I need a workflow that sends me a Slack message every morning with a summary of my Google Calendar events for the day, and also creates a daily report in Google Sheets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-base"
                />

                <Button
                  onClick={handleDescribeSearch}
                  disabled={!description.trim() || isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Finding...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Find Workflows
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example Queries */}
      {!results.length && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Popular Searches
              </CardTitle>
              <CardDescription>Try these example queries to see AI search in action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exampleQueries.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (searchMode === 'simple') {
                        setQuery(example)
                      } else {
                        setDescription(example)
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-start">
                      <Sparkles className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700">{example}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {(results.length > 0 || isLoading) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* AI Explanation */}
          {explanation && !isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">AI Analysis</h3>
                  <p className="text-blue-800">{explanation}</p>
                  
                  {analysis && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {analysis.intent && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Intent: {analysis.intent}
                        </Badge>
                      )}
                      {analysis.concepts.map((concept, idx) => (
                        <Badge key={idx} variant="outline">
                          {concept}
                        </Badge>
                      ))}
                      {analysis.triggerType && (
                        <Badge className="bg-green-100 text-green-800">
                          {analysis.triggerType}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI is analyzing your request...</p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-xl transition-all bg-white border-2 hover:border-purple-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTriggerIcon(workflow.trigger_type)}
                        <Badge variant={workflow.active ? 'default' : 'secondary'} className="text-xs">
                          {workflow.active ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {workflow.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <Badge className={getComplexityColor(workflow.complexity)}>
                        {workflow.complexity}
                      </Badge>
                    </div>
                    
                    {workflow.similarity && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Match Score</span>
                          <span className="font-bold text-purple-600">
                            {(workflow.similarity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                            style={{ width: `${workflow.similarity * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <CardTitle className="text-lg line-clamp-2">{workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workflow.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Trigger</span>
                      <span className="font-medium">{workflow.trigger_type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Nodes</span>
                      <span className="font-medium">{workflow.node_count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Integrations</span>
                      <span className="font-medium">{workflow.integrations.length}</span>
                    </div>

                    {workflow.integrations.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs text-gray-600 mb-2">Uses:</div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.integrations.slice(0, 3).map((integration, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {integration}
                            </Badge>
                          ))}
                          {workflow.integrations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{workflow.integrations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && results.length === 0 && (query || description) && (
            <div className="text-center py-20">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500">
                Try rephrasing your query or being more specific about what you need
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

