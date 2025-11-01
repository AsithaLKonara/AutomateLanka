'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Brain, Workflow, BarChart3, Home } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/n8n-workflows', label: 'Workflows', icon: Workflow },
    { href: '/ai-search', label: 'AI Search', icon: Brain },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg">AutomateLanka</div>
                <div className="text-xs text-gray-600">Automation Hub</div>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link key={link.href} href={link.href}>
                  <button className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{link.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

