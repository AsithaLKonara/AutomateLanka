'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Workflow,
  PlayCircle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  Zap,
} from 'lucide-react';

interface WorkspaceStats {
  workflows: {
    total: number;
    active: number;
    inactive: number;
  };
  runs: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    thisMonth: number;
  };
  members: number;
}

interface Usage {
  current: {
    runs: number;
    nodeExecutions: number;
    apiCalls: number;
  };
  limits: {
    runs: number;
    workflows: number;
    members: number;
  };
  percentUsed: {
    runs: number;
  };
}

export default function DashboardPage() {
  const params = useParams();
  const { workspace } = useAuth();
  const workspaceId = params.workspaceId as string;

  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        // Load stats and usage in parallel
        const [statsRes, usageRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: WorkspaceStats }>(
            `/api/workspaces/${workspaceId}/stats`
          ),
          apiClient.get<{ success: boolean; data: Usage }>(
            `/api/saas-billing/usage?workspaceId=${workspaceId}`
          ),
        ]);

        setStats(statsRes.data);
        setUsage(usageRes.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {workspace?.name || 'there'}!
        </h1>
        <p className="text-white/70">
          Here's what's happening in your workspace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Workflows Stat */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Workflow className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {stats?.workflows.total || 0}
              </div>
              <div className="text-white/50 text-sm">Workflows</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white/70">
              {stats?.workflows.active || 0} active
            </span>
          </div>
        </div>

        {/* Runs This Month */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {stats?.runs.thisMonth || 0}
              </div>
              <div className="text-white/50 text-sm">Runs this month</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {usage && (
              <>
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">
                  {usage.limits.runs === -1 ? 'Unlimited' : `${usage.current.runs}/${usage.limits.runs} used`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {stats?.runs.successRate.toFixed(1) || 0}%
              </div>
              <div className="text-white/50 text-sm">Success Rate</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-400">{stats?.runs.success || 0} success</span>
            <span className="text-white/30">/</span>
            <span className="text-red-400">{stats?.runs.failed || 0} failed</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {stats?.members || 0}
              </div>
              <div className="text-white/50 text-sm">Team Members</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {usage && (
              <>
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="text-white/70">
                  {usage.limits.members === -1 ? 'Unlimited' : `${stats?.members}/${usage.limits.members} used`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Usage Progress Bar */}
      {usage && usage.limits.runs !== -1 && (
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Monthly Usage</h3>
            <span className="text-white/70 text-sm">
              {usage.current.runs} / {usage.limits.runs} runs
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.percentUsed.runs > 90
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : usage.percentUsed.runs > 70
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(usage.percentUsed.runs, 100)}%` }}
            ></div>
          </div>
          {usage.percentUsed.runs > 80 && (
            <p className="text-yellow-400 text-sm mt-2">
              You're approaching your plan limit. Consider upgrading for more runs.
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href={`/w/${workspaceId}/workflows/new`}
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl hover:opacity-90 transition group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Create Workflow</h3>
              <p className="text-white/80 text-sm">Start automating tasks</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/w/${workspaceId}/workflows`}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl hover:opacity-90 transition group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Browse Public Workflows</h3>
              <p className="text-white/80 text-sm">Explore 2,057 templates</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="text-white/50 text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recent activity yet</p>
          <p className="text-sm">Start by creating your first workflow</p>
        </div>
      </div>
    </div>
  );
}

