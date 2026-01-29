'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@autolanka/ui'
import { Button } from '@autolanka/ui'
import { Badge } from '@autolanka/ui'
import { Input } from '@autolanka/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@autolanka/ui'
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [templates, setTemplates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-workflows')

  useEffect(() => {
    // Simulate loading workflows data
    const loadWorkflows = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setWorkflows([
          {
            id: 1,
            name: 'Social Media Automation',
            description: 'Automatically post content to multiple social media platforms',
            status: 'running',
            lastRun: new Date(Date.now() - 1000 * 60 * 30),
            nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2),
            executions: 45,
            successRate: 98
          },
          {
            id: 2,
            name: 'Content Generation',
            description: 'Generate AI-powered content for social media posts',
            status: 'paused',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4),
            nextRun: null,
            executions: 23,
            successRate: 95
          },
          {
            id: 3,
            name: 'Analytics Report',
            description: 'Generate weekly analytics reports and send via email',
            status: 'running',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
            nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24),
            executions: 12,
            successRate: 100
          }
        ])
        
        setTemplates([
          {
            id: 1,
            name: 'Instagram Post Automation',
            description: 'Automatically post to Instagram with optimal timing',
            category: 'Social Media',
            downloads: 150,
            rating: 4.8,
            price: 0
          },
          {
            id: 2,
            name: 'YouTube Video Processing',
            description: 'Process and optimize YouTube videos automatically',
            category: 'Video Processing',
            downloads: 89,
            rating: 4.6,
            price: 29.99
          },
          {
            id: 3,
            name: 'Email Newsletter',
            description: 'Create and send automated email newsletters',
            category: 'Email Marketing',
            downloads: 203,
            rating: 4.9,
            price: 0
          }
        ])
      } catch (error) {
        console.error('Failed to load workflows:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflows()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-100 text-green-800">Running</Badge>
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
              <p className="mt-2 text-gray-600">
                Create and manage your automation workflows.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>

          <TabsContent value="my-workflows" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(workflow.status)}
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      {getStatusBadge(workflow.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last Run</span>
                      <span className="text-sm font-medium">
                        {workflow.lastRun.toLocaleDateString()}
                      </span>
                    </div>
                    
                    {workflow.nextRun && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Next Run</span>
                        <span className="text-sm font-medium">
                          {workflow.nextRun.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Executions</span>
                      <span className="text-sm font-medium">{workflow.executions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Success Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        {workflow.successRate}%
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        variant={workflow.status === 'running' ? 'outline' : 'default'}
                        className="flex-1"
                      >
                        {workflow.status === 'running' ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {workflows.length === 0 && (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                <p className="text-gray-500 mb-4">
                  Create your first workflow to get started with automation.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Downloads</span>
                      <span className="text-sm font-medium">{template.downloads}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Rating</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{template.rating}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="text-sm font-medium">
                        {template.price === 0 ? 'Free' : `$${template.price}`}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="executions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  View the history of workflow executions and their results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      workflow: 'Social Media Automation',
                      status: 'completed',
                      startedAt: new Date(Date.now() - 1000 * 60 * 30),
                      completedAt: new Date(Date.now() - 1000 * 60 * 25),
                      duration: '5m 12s'
                    },
                    {
                      id: 2,
                      workflow: 'Content Generation',
                      status: 'failed',
                      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
                      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 3),
                      duration: '3m 45s'
                    },
                    {
                      id: 3,
                      workflow: 'Analytics Report',
                      status: 'completed',
                      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
                      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 8),
                      duration: '8m 33s'
                    }
                  ].map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <h3 className="font-medium">{execution.workflow}</h3>
                          <p className="text-sm text-gray-500">
                            Started: {execution.startedAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{execution.duration}</p>
                          <p className="text-xs text-gray-500">
                            {execution.completedAt.toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(execution.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
