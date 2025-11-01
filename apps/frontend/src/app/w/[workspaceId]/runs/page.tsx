'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  Eye,
  Filter,
  Calendar,
} from 'lucide-react';

interface Run {
  id: string;
  workflowId: string;
  workflow?: {
    name: string;
  };
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  triggerType: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  nodeExecutions: number;
  errorMessage: string | null;
  createdAt: string;
}

export default function RunsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRuns();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadRuns, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const loadRuns = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Run[] }>(
        `/api/runs?workspaceId=${workspaceId}`
      );
      setRuns(response.data || []);
    } catch (error) {
      console.error('Error loading runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns = runs.filter((run) => {
    if (statusFilter === 'all') return true;
    return run.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <PlayCircle className="w-5 h-5 text-white/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'running':
        return 'bg-blue-500/20 text-blue-400';
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-white/10 text-white/50';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workflow Runs</h1>
          <p className="text-white/70">
            View and monitor workflow execution history
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-white/70" />
          <div className="flex space-x-2">
            {['all', 'success', 'failed', 'running', 'queued'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="ml-auto text-white/70 text-sm">
            {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8 text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading runs...</p>
        </div>
      )}

      {/* Runs List */}
      {!loading && filteredRuns.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Workflow</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Started</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Duration</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Nodes</th>
                <th className="text-right px-6 py-4 text-white/70 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(run.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {run.workflow?.name || 'Workflow'}
                    </div>
                    <div className="text-white/50 text-xs">
                      {run.triggerType || 'manual'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70 text-sm">
                    {run.startedAt 
                      ? new Date(run.startedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-white/70 text-sm">
                    {formatDuration(run.durationMs)}
                  </td>
                  <td className="px-6 py-4 text-white/70 text-sm">
                    {run.nodeExecutions || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/w/${workspaceId}/runs/${run.id}`}
                        className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRuns.length === 0 && (
        <div className="bg-white/5 backdrop-blur-lg p-12 rounded-xl border border-white/10 text-center">
          <PlayCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No runs found</h3>
          <p className="text-white/70 mb-6">
            {statusFilter !== 'all'
              ? `No ${statusFilter} runs yet`
              : 'Run your first workflow to see execution history here'}
          </p>
          <Link
            href={`/w/${workspaceId}/workflows`}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Go to Workflows</span>
          </Link>
        </div>
      )}
    </div>
  );
}

