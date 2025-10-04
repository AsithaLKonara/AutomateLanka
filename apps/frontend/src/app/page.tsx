'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@autolanka/ui'
import { Button } from '@autolanka/ui'
import { Badge } from '@autolanka/ui'
import { 
  Zap, 
  BarChart3, 
  Users, 
  FileText, 
  Play,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react'

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [mlStatus, setMlStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      })
      .catch(() => setBackendStatus('offline'))

    // Check ML service health
    fetch('http://localhost:8001/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setMlStatus('online')
        } else {
          setMlStatus('offline')
        }
      })
      .catch(() => setMlStatus('offline'))
  }, [])

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Automation",
      description: "Automate your content creation workflow with intelligent AI assistance"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Get deep insights into your content performance across all platforms"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team on content strategies"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Content Management",
      description: "Organize, schedule, and publish content across multiple platforms"
    }
  ]

  const stats = [
    { label: "Total Media", value: "42", icon: <FileText className="h-4 w-4" /> },
    { label: "Published Posts", value: "18", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Active Workflows", value: "5", icon: <Zap className="h-4 w-4" /> },
    { label: "Scheduled Posts", value: "12", icon: <Play className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Autolanka</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
              <Button variant="outline">
                Sign In
              </Button>
              <Button>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              All-in-One
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Automation</span>
              <br />
              SaaS Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform your content creation workflow with AI-powered automation, 
              advanced analytics, and seamless multi-platform publishing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Play className="h-5 w-5 mr-2" />
                Start Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">System Status</h2>
            <p className="text-gray-600">All services running in demo mode</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Backend API</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {backendStatus === 'online' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {backendStatus === 'offline' && <div className="h-4 w-4 bg-red-500 rounded-full" />}
                  {backendStatus === 'checking' && <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />}
                  <span className="text-sm">
                    {backendStatus === 'online' && 'Online - Port 8000'}
                    {backendStatus === 'offline' && 'Offline'}
                    {backendStatus === 'checking' && 'Checking...'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>ML Service</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {mlStatus === 'online' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {mlStatus === 'offline' && <div className="h-4 w-4 bg-red-500 rounded-full" />}
                  {mlStatus === 'checking' && <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />}
                  <span className="text-sm">
                    {mlStatus === 'online' && 'Online - Port 8001'}
                    {mlStatus === 'offline' && 'Offline'}
                    {mlStatus === 'checking' && 'Checking...'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate and optimize your content creation workflow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Live Demo Data</h2>
            <p className="text-xl text-blue-100">
              Real-time statistics from your demo workspace
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4 text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the power of AI-driven automation and take your content strategy to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Shield className="h-5 w-5 mr-2" />
                Start Free Demo
              </Button>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Autolanka</h3>
            </div>
            <p className="text-gray-400 mb-4">
              All-in-One Automation SaaS Platform
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>© 2024 Autolanka</span>
              <span>•</span>
              <span>Demo Mode</span>
              <span>•</span>
              <span>No API Keys Required</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
