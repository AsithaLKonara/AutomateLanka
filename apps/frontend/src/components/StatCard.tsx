import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend 
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600'
  }

  return (
    <div className="card-modern p-6 text-center group hover-lift">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {trend && (
        <div className={`text-xs font-semibold mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  )
}

