'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Users, Mail, UserPlus, Trash2, Shield, Crown } from 'lucide-react';

interface Member {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  joinedAt: string;
  lastLoginAt: string | null;
}

export default function MembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Member[] }>(
        `/api/workspaces/${workspaceId}/members`
      );
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInviting(true);

    try {
      await apiClient.post(`/api/workspaces/${workspaceId}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail('');
      setShowInviteForm(false);
      await loadMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
      await loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Members</h1>
          <p className="text-white/70">
            Manage who has access to this workspace
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/50 flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
          <h3 className="text-white font-semibold text-lg mb-4">Invite Team Member</h3>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-white mb-2 text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="teammate@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-sm font-medium">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="member">Member - Can view and use workflows</option>
                <option value="admin">Admin - Can manage workflows and members</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={inviting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {inviting ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-white/70" />
              <span className="text-white font-semibold">
                {members.length} Member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {members.map((member) => (
              <div key={member.userId} className="p-6 hover:bg-white/5 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {member.name || member.email}
                        </span>
                        {member.role === 'owner' && (
                          <Crown className="w-4 h-4 text-yellow-400" title="Owner" />
                        )}
                        {member.role === 'admin' && (
                          <Shield className="w-4 h-4 text-blue-400" title="Admin" />
                        )}
                      </div>
                      <div className="text-white/50 text-sm">{member.email}</div>
                      <div className="text-white/30 text-xs mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.role === 'owner'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : member.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </div>

                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-400 hover:text-red-300 transition p-2"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && !loading && (
        <div className="bg-white/5 backdrop-blur-lg p-12 rounded-xl border border-white/10 text-center">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No members yet</h3>
          <p className="text-white/70 mb-6">
            Invite team members to collaborate on workflows
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <UserPlus className="w-5 h-5" />
            <span>Invite First Member</span>
          </button>
        </div>
      )}
    </div>
  );
}

