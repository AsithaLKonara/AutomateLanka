'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
    Zap,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
    ExternalLink,
    MessageSquare,
    Mail,
    Github,
    Layout,
    Search,
    Loader2
} from 'lucide-react';

interface IntegrationType {
    type: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    available: boolean;
}

interface Integration {
    id: string;
    workspaceId: string;
    type: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    lastUsedAt: string | null;
}

export default function IntegrationsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [integrationTypes, setIntegrationTypes] = useState<IntegrationType[]>([]);
    const [connectedIntegrations, setConnectedIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [connectingType, setConnectingType] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [typesRes, connectedRes] = await Promise.all([
                apiClient.get<{ success: boolean; data: IntegrationType[] }>('/api/saas-integrations/types'),
                apiClient.get<{ success: boolean; data: Integration[] }>(`/api/saas-integrations?workspaceId=${workspaceId}`)
            ]);

            setIntegrationTypes(typesRes.data);
            setConnectedIntegrations(connectedRes.data);
        } catch (error) {
            console.error('Error loading integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (type: string) => {
        try {
            setConnectingType(type);
            const response = await apiClient.post<{ success: boolean; data: { authUrl: string } }>(
                '/api/saas-integrations/connect',
                { type, workspaceId }
            );

            if (response.data.authUrl) {
                window.location.href = response.data.authUrl;
            }
        } catch (error: any) {
            alert(error.message || `Failed to connect to ${type}`);
        } finally {
            setConnectingType(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to disconnect this integration?')) return;

        try {
            await apiClient.delete(`/api/saas-integrations/${id}?workspaceId=${workspaceId}`);
            setConnectedIntegrations(prev => prev.filter(i => i.id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to disconnect integration');
        }
    };

    const handleTest = async (id: string) => {
        try {
            const response = await apiClient.post<{ success: boolean; data: { valid: boolean; message: string } }>(
                `/api/saas-integrations/${id}/test?workspaceId=${workspaceId}`,
                {}
            );
            alert(response.data.message);
        } catch (error: any) {
            alert(error.message || 'Failed to test integration');
        }
    };

    const filteredTypes = integrationTypes.filter(type =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type: string, icon: string) => {
        switch (type) {
            case 'slack': return <MessageSquare className="w-6 h-6 text-emerald-400" />;
            case 'google': return <Mail className="w-6 h-6 text-red-400" />;
            case 'github': return <Github className="w-6 h-6 text-white" />;
            case 'microsoft': return <Layout className="w-6 h-6 text-blue-400" />;
            default: return <span className="text-2xl">{icon}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-white/70">Loading integrations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
                    <p className="text-white/70">
                        Connect your favorite tools to automate your workflows
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
                    />
                </div>
            </div>

            {/* Connected Integrations */}
            {connectedIntegrations.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Connected Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connectedIntegrations.map((integration) => {
                            const typeInfo = integrationTypes.find(t => t.type === integration.type);
                            return (
                                <div
                                    key={integration.id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                            {getIcon(integration.type, typeInfo?.icon || '🔌')}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{integration.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-white/50">
                                                    Connected on {new Date(integration.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                <span className="text-xs text-green-400">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleTest(integration.id)}
                                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                                            title="Test Connection"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(integration.id)}
                                            className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                            title="Disconnect"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Integrations */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-6">Explore Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredTypes.map((type) => (
                        <div
                            key={type.type}
                            className={`bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col transition-all ${type.available
                                    ? 'hover:border-purple-500/50 hover:bg-white/[0.07] cursor-pointer'
                                    : 'opacity-60 grayscale cursor-not-allowed'
                                }`}
                            onClick={() => type.available && handleConnect(type.type)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                    {getIcon(type.type, type.icon)}
                                </div>
                                {!type.available && (
                                    <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                        Soon
                                    </span>
                                )}
                            </div>
                            <h3 className="text-white font-bold mb-2">{type.name}</h3>
                            <p className="text-white/60 text-sm mb-6 flex-1">
                                {type.description}
                            </p>
                            <button
                                disabled={!type.available || connectingType === type.type}
                                className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${type.available
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-white/10 text-white/30'
                                    }`}
                            >
                                {connectingType === type.type ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                <span>Connect</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filteredTypes.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">No integrations found</h3>
                    <p className="text-white/50">Try searching for something else</p>
                </div>
            )}
        </div>
    );
}
