'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  Download,
  RefreshCw,
  StopCircle,
} from 'lucide-react';

interface RunDetail {
  id: string;
  workflowId: string;
  workflow: {
    name: string;
  };
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  triggerType: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  inputData: any;
  outputData: any;
  errorMessage: string | null;
  logs: string | null;
  nodeExecutions: number;
  createdAt: string;
}

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const runId = params.id as string;

  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRun();

    // Poll for updates if running
    const interval = setInterval(() => {
      if (run?.status === 'running' || run?.status === 'queued') {
        loadRun();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [runId, run?.status]);

  const loadRun = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: RunDetail }>(
        `/api/runs/${runId}`
      );
      setRun(response.data);
    } catch (error) {
      console.error('Error loading run:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await apiClient.post(`/api/runs/${runId}/cancel`, {});
      await loadRun();
    } catch (error) {
      console.error('Error cancelling run:', error);
      alert('Failed to cancel run');
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const getStatusIcon = () => {
    if (!run) return null;
    
    switch (run.status) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'running':
        return <Loader className="w-8 h-8 text-blue-400 animate-spin" />;
      case 'queued':
        return <Clock className="w-8 h-8 text-yellow-400" />;
      case 'cancelled':
        return <StopCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!run) return 'bg-white/10 text-white/50';
    
    switch (run.status) {
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
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Run Not Found</h2>
        <Link
          href={`/w/${workspaceId}/runs`}
          className="text-purple-400 hover:text-purple-300"
        >
          Back to Runs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/w/${workspaceId}/runs`}
          className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Runs</span>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {getStatusIcon()}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{run.workflow.name}</h1>
              <div className="flex items-center space-x-4 text-white/70 text-sm">
                <span>Run ID: {run.id.slice(0, 8)}...</span>
                <span>•</span>
                <span>{new Date(run.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {(run.status === 'running' || run.status === 'queued') && (
              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <StopCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
            <button
              onClick={loadRun}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-xl border mb-8 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold mb-1">
              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            </div>
            <div className="text-sm opacity-80">
              {run.status === 'running' && 'Workflow is currently executing...'}
              {run.status === 'queued' && 'Waiting in queue...'}
              {run.status === 'success' && 'Workflow completed successfully!'}
              {run.status === 'failed' && 'Workflow execution failed'}
              {run.status === 'cancelled' && 'Workflow was cancelled'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Duration</div>
            <div className="text-2xl font-bold">{formatDuration(run.durationMs)}</div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Started At</div>
          <div className="text-white font-semibold">
            {run.startedAt ? new Date(run.startedAt).toLocaleTimeString() : 'Not started'}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Finished At</div>
          <div className="text-white font-semibold">
            {run.finishedAt ? new Date(run.finishedAt).toLocaleTimeString() : 'Running...'}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Node Executions</div>
          <div className="text-white font-semibold text-2xl">{run.nodeExecutions}</div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Trigger Type</div>
          <div className="text-white font-semibold">{run.triggerType || 'Manual'}</div>
        </div>
      </div>

      {/* Error Message */}
      {run.errorMessage && (
        <div className="bg-red-500/20 border border-red-500 p-6 rounded-xl mb-8">
          <h3 className="text-red-400 font-semibold mb-2">Error</h3>
          <pre className="text-red-200 text-sm font-mono whitespace-pre-wrap">
            {run.errorMessage}
          </pre>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
        <h3 className="text-white font-semibold text-lg mb-4">Execution Logs</h3>
        {run.logs ? (
          <div className="bg-black/50 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {run.logs}
            </pre>
          </div>
        ) : (
          <div className="text-white/50 text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No logs available yet</p>
          </div>
        )}
      </div>

      {/* Input Data */}
      {run.inputData && (
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
          <h3 className="text-white font-semibold text-lg mb-4">Input Data</h3>
          <div className="bg-black/50 p-4 rounded-lg overflow-x-auto">
            <pre className="text-blue-400 text-sm font-mono">
              {JSON.stringify(run.inputData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Output Data */}
      {run.outputData && (
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold text-lg mb-4">Output Data</h3>
          <div className="bg-black/50 p-4 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              {JSON.stringify(run.outputData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

