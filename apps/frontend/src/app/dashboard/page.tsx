'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@autolanka/ui'
import { Button } from '@autolanka/ui'
import { Badge } from '@autolanka/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@autolanka/ui'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Zap, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Plus,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalPosts: 0,
    activeWorkflows: 0,
    scheduledPosts: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load dashboard data from API
    const loadDashboardData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('http://localhost:8000/api/users/dashboard-stats'),
          fetch('http://localhost:8000/api/users/recent-activity?limit=10')
        ])

        if (statsResponse.ok && activityResponse.ok) {
          const [statsData, activityData] = await Promise.all([
            statsResponse.json(),
            activityResponse.json()
          ])
          
          setStats(statsData.stats)
          setRecentActivity(activityData.activity.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })))
        } else {
          // Fallback to mock data if API fails
          setStats({
            totalMedia: 42,
            totalPosts: 18,
            activeWorkflows: 5,
            scheduledPosts: 12
          })
          
          setRecentActivity([
            {
              id: 1,
              type: 'media',
              title: 'New video uploaded',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              status: 'completed'
            },
            {
              id: 2,
              type: 'workflow',
              title: 'Social media automation executed',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
              status: 'completed'
            },
            {
              id: 3,
              type: 'post',
              title: 'Instagram post scheduled',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
              status: 'scheduled'
            }
          ])
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Fallback to mock data
        setStats({
          totalMedia: 42,
          totalPosts: 18,
          activeWorkflows: 5,
          scheduledPosts: 12
        })
        
        setRecentActivity([
          {
            id: 1,
            type: 'media',
            title: 'New video uploaded',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'completed'
          },
          {
            id: 2,
            type: 'workflow',
            title: 'Social media automation executed',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'completed'
          },
          {
            id: 3,
            type: 'post',
            title: 'Instagram post scheduled',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            status: 'scheduled'
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Autolanka Demo!
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening with your automation workflows today.
              </p>
            </div>
            <div className="flex space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Media</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMedia}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Running smoothly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
              <p className="text-xs text-muted-foreground">
                Next post in 2 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks you can perform right now
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>
                    Current status of your automation services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Media Processing</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Services</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Media APIs</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Demo Mode
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
                <CardDescription>
                  Manage your automation workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      name: 'Social Media Automation',
                      status: 'running',
                      lastRun: new Date(Date.now() - 1000 * 60 * 30),
                      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2)
                    },
                    {
                      id: 2,
                      name: 'Content Generation',
                      status: 'paused',
                      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4),
                      nextRun: null
                    },
                    {
                      id: 3,
                      name: 'Analytics Report',
                      status: 'running',
                      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
                      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24)
                    }
                  ].map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <h3 className="font-medium">{workflow.name}</h3>
                          <p className="text-sm text-gray-500">
                            Last run: {workflow.lastRun.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
                          {workflow.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {workflow.status === 'running' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Overview of your automation performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Analytics chart will be displayed here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Connect to analytics service to view detailed metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions and events in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === 'media' && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'workflow' && <Zap className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'post' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
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