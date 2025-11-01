'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Workflow,
  Search,
  Filter,
  Grid3x3,
  List,
  Plus,
  Download,
  Eye,
  Play,
  Clock,
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
  public: boolean;
  tags: string[];
  nodesCount: number;
  integrations: string[];
  createdAt: string;
  workspace: {
    name: string;
  };
}

export default function WorkflowsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadWorkflows();
  }, [workspaceId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // For now, load from old endpoint (will be replaced with Prisma endpoint)
      const response = await apiClient.get<{ success: boolean; data: { workflows: WorkflowItem[] } }>(
        `/api/workflows?workspace=${workspaceId}&includePublic=true`
      );

      setWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter((workflow) => {
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && workflow.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(workflows.map((w) => w.category).filter(Boolean))
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workflows</h1>
          <p className="text-white/70">
            Manage and execute your automation workflows
          </p>
        </div>
        <Link
          href={`/w/${workspaceId}/workflows/new`}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/50 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Workflow</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat!}>
                {cat}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex space-x-2 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:text-white'
              } transition`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:text-white'
              } transition`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-white/70 text-sm">
          Showing {filteredWorkflows.length} of {workflows.length} workflows
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-purple-400 transition">
                    {workflow.name}
                  </h3>
                  {workflow.category && (
                    <span className="text-purple-400 text-xs">
                      {workflow.category}
                    </span>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  workflow.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {workflow.active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Integrations */}
              <div className="flex flex-wrap gap-2 mb-4">
                {workflow.integrations.slice(0, 3).map((integration) => (
                  <span
                    key={integration}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                  >
                    {integration}
                  </span>
                ))}
                {workflow.integrations.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs">
                    +{workflow.integrations.length - 3} more
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-white/70 text-sm mb-4">
                <span className="flex items-center space-x-1">
                  <Workflow className="w-4 h-4" />
                  <span>{workflow.nodesCount} nodes</span>
                </span>
                {workflow.public && (
                  <span className="text-purple-400">Public</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  href={`/w/${workspaceId}/workflows/${workflow.id}`}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </Link>
                <button
                  onClick={() => {/* Run workflow */}}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  title="Run workflow"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Name</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Category</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Integrations</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Nodes</th>
                <th className="text-left px-6 py-4 text-white/70 text-sm font-semibold">Status</th>
                <th className="text-right px-6 py-4 text-white/70 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{workflow.name}</div>
                    {workflow.public && (
                      <span className="text-purple-400 text-xs">Public Template</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/70">{workflow.category || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {workflow.integrations.slice(0, 2).map((integration) => (
                        <span
                          key={integration}
                          className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          {integration}
                        </span>
                      ))}
                      {workflow.integrations.length > 2 && (
                        <span className="text-white/50 text-xs">
                          +{workflow.integrations.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{workflow.nodesCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      workflow.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/w/${workspaceId}/workflows/${workflow.id}`}
                        className="text-purple-400 hover:text-purple-300 transition"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => {/* Run workflow */}}
                        className="text-green-400 hover:text-green-300 transition"
                        title="Run workflow"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredWorkflows.length === 0 && (
        <div className="bg-white/5 backdrop-blur-lg p-12 rounded-xl border border-white/10 text-center">
          <Workflow className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No workflows found</h3>
          <p className="text-white/70 mb-6">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first workflow'}
          </p>
          <Link
            href={`/w/${workspaceId}/workflows/new`}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Workflow</span>
          </Link>
        </div>
      )}
    </div>
  );
}

