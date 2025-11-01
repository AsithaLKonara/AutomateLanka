import React from 'react'
import { LucideIcon } from 'lucide-react'

interface GradientCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  onClick?: () => void
  children?: React.ReactNode
}

export function GradientCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  onClick,
  children 
}: GradientCardProps) {
  return (
    <div 
      onClick={onClick}
      className="card-modern p-6 group cursor-pointer hover-lift"
    >
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  )
}

