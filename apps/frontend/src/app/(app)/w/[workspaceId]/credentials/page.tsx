'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
    Database,
    Plus,
    Trash2,
    Key,
    Shield,
    Lock,
    Eye,
    EyeOff,
    ExternalLink,
    Search
} from 'lucide-react';

interface Credential {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    lastUsedAt: string | null;
}

export default function CredentialsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showValues, setShowValues] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadCredentials();
    }, [workspaceId]);

    const loadCredentials = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ success: boolean; data: Credential[] }>(
                `/api/saas-integrations/credentials?workspaceId=${workspaceId}`
            );
            setCredentials(response.data || []);
        } catch (error) {
            console.error('Error loading credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this credential? This will break any workflows using it.')) {
            return;
        }

        try {
            await apiClient.delete(`/api/saas-integrations/credentials/${id}?workspaceId=${workspaceId}`);
            await loadCredentials();
        } catch (error) {
            console.error('Error deleting credential:', error);
            alert('Failed to delete credential');
        }
    };

    const filteredCredentials = credentials.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Credentials</h1>
                    <p className="text-white/70">
                        Securely store API keys and tokens for your automations
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/50 flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Credential</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search credentials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                </div>
                <div className="bg-white/5 backdrop-blur-lg px-6 py-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">Encrypted</span>
                    </div>
                    <span className="text-white/40 text-sm">AES-256</span>
                </div>
            </div>

            {/* Credentials List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
                    ))}
                </div>
            ) : filteredCredentials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCredentials.map((cred) => (
                        <div
                            key={cred.id}
                            className="group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition relative overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Key className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => handleDelete(cred.id)}
                                        className="p-2 text-white/40 hover:text-red-400 transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">{cred.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-white/50 mb-4">
                                    <span className="uppercase">{cred.type}</span>
                                    <span>•</span>
                                    <span>Added {new Date(cred.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex items-center space-x-2 text-xs text-white/30">
                                    <Lock className="w-3 h-3" />
                                    <span>Securely Stored</span>
                                </div>
                                <button
                                    className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center">
                    <Database className="w-20 h-20 text-white/20 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">No credentials yet</h2>
                    <p className="text-white/50 mb-8 max-w-md mx-auto">
                        Store your database passwords, API keys, and other secrets here to use them in your workflows.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition flex items-center space-x-2 mx-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Credential</span>
                    </button>
                </div>
            )}
        </div>
    );
}

const Settings = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
