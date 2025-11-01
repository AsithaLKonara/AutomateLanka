'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Edit,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface WorkflowDetail {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
  public: boolean;
  tags: string[];
  nodesCount: number;
  integrations: string[];
  json: any;
  createdAt: string;
  updatedAt: string;
  creator: {
    name: string | null;
    email: string;
  };
  workspace: {
    name: string;
  };
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: WorkflowDetail }>(
        `/api/workflows/${workflowId}`
      );
      setWorkflow(response.data);
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      // Will be implemented when run endpoints are ready
      alert('Workflow execution will be available after Phase 8 (Execution System)');
    } catch (error) {
      console.error('Error running workflow:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = () => {
    if (!workflow) return;
    
    const dataStr = JSON.stringify(workflow.json, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Workflow Not Found</h2>
        <Link
          href={`/w/${workspaceId}/workflows`}
          className="text-purple-400 hover:text-purple-300"
        >
          Back to Workflows
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/w/${workspaceId}/workflows`}
          className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{workflow.name}</h1>
            <div className="flex items-center space-x-4 text-white/70">
              <span>{workflow.workspace.name}</span>
              <span>•</span>
              <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>{running ? 'Running...' : 'Run'}</span>
            </button>
            <Link
              href={`/w/${workspaceId}/workflows/${workflow.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition"
              title="Download JSON"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Status</div>
          <div className={`flex items-center space-x-2 ${
            workflow.active ? 'text-green-400' : 'text-gray-400'
          }`}>
            {workflow.active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-semibold">{workflow.active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Nodes</div>
          <div className="text-white text-2xl font-bold">{workflow.nodesCount}</div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-1">Integrations</div>
          <div className="text-white text-2xl font-bold">{workflow.integrations.length}</div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
        <h2 className="text-white font-semibold text-lg mb-4">Integrations</h2>
        <div className="flex flex-wrap gap-3">
          {workflow.integrations.map((integration) => (
            <div
              key={integration}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium"
            >
              {integration}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {workflow.tags.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
          <h2 className="text-white font-semibold text-lg mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {workflow.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Workflow JSON Preview */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
        <h2 className="text-white font-semibold text-lg mb-4">Workflow Definition</h2>
        <div className="bg-black/50 p-4 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm font-mono">
            {JSON.stringify(workflow.json, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

