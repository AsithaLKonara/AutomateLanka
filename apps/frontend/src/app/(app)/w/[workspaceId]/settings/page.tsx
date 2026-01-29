'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Save, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams();
  const { workspace } = useAuth();
  const workspaceId = params.workspaceId as string;

  const [formData, setFormData] = useState({
    name: workspace?.name || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSuccess(false);

    try {
      await apiClient.put(`/api/workspaces/${workspaceId}`, {
        name: formData.name,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete this workspace? This action cannot be undone. All workflows, runs, and data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Type the workspace name to confirm deletion:'
    );

    if (doubleConfirm !== workspace?.name) {
      alert('Workspace name does not match. Deletion cancelled.');
      return;
    }

    try {
      await apiClient.delete(`/api/workspaces/${workspaceId}`);
      // Redirect to home after deletion
      window.location.href = '/';
    } catch (error: any) {
      alert(`Failed to delete workspace: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Workspace Settings</h1>
        <p className="text-white/70">
          Manage your workspace configuration
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
        <h2 className="text-white text-xl font-semibold mb-6">General</h2>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg mb-4 text-sm">
            Settings saved successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              Workspace Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              Workspace ID
            </label>
            <input
              type="text"
              value={workspaceId}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/50"
              disabled
            />
            <p className="text-white/50 text-xs mt-1">
              Use this ID for API access
            </p>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              Workspace Slug
            </label>
            <input
              type="text"
              value={workspace?.slug || ''}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/50"
              disabled
            />
            <p className="text-white/50 text-xs mt-1">
              Your workspace URL: /w/{workspace?.slug}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 backdrop-blur-lg p-6 rounded-xl border border-red-500/30">
        <h2 className="text-red-400 text-xl font-semibold mb-4">Danger Zone</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Delete Workspace</h3>
            <p className="text-white/70 text-sm">
              Permanently delete this workspace and all its data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}

