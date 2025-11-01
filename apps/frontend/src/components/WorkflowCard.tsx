import React from 'react'
import { 
  Download, CheckCircle, XCircle, Globe, Clock, Layers, 
  Zap, Eye, Network 
} from 'lucide-react'

interface WorkflowCardProps {
  workflow: {
    id: number
    filename: string
    name: string
    active: boolean
    description: string
    trigger_type: string
    complexity: string
    node_count: number
    integrations: string[]
    tags?: string[]
    score?: number
  }
  onDownload?: (filename: string) => void
  onView?: (filename: string) => void
  showScore?: boolean
}

export function WorkflowCard({ workflow, onDownload, onView, showScore }: WorkflowCardProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
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

  return (
    <div className="card-modern p-6 group hover-lift">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getTriggerIcon(workflow.trigger_type)}
          </div>
          <div className={`badge-modern ${workflow.active ? 'badge-success' : 'badge-error'}`}>
            {workflow.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {workflow.active ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className={`badge-modern border ${getComplexityColor(workflow.complexity)}`}>
          {workflow.complexity}
        </div>
      </div>

      {/* Score if available */}
      {showScore && workflow.score !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Match Score</span>
            <span className="font-bold text-purple-600">
              {Math.round(workflow.score)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, workflow.score)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Title & Description */}
      <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {workflow.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {workflow.description || 'No description available'}
      </p>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="font-bold text-blue-600">{workflow.trigger_type}</div>
          <div className="text-xs text-gray-600">Trigger</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="font-bold text-purple-600">{workflow.node_count}</div>
          <div className="text-xs text-gray-600">Nodes</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="font-bold text-green-600">{workflow.integrations.length}</div>
          <div className="text-xs text-gray-600">Services</div>
        </div>
      </div>

      {/* Integrations */}
      {workflow.integrations.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <Network className="h-3 w-3" />
            <span>Integrations</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {workflow.integrations.slice(0, 4).map((integration, idx) => (
              <span key={idx} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                {integration}
              </span>
            ))}
            {workflow.integrations.length > 4 && (
              <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                +{workflow.integrations.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => onDownload?.(workflow.filename)}
          className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button 
          onClick={() => onView?.(workflow.filename)}
          className="p-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

