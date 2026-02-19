'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Panel,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2, Check, AlertTriangle, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

import BaseNode from './BaseNode';
import Sidebar from './Sidebar';
import PropertiesPane from './PropertiesPane';
import { WorkflowNode, WorkflowEdge } from './types';
import { NODE_DEFINITIONS } from './constants';

const nodeTypes: any = {
    trigger: BaseNode,
    action: BaseNode,
    logic: BaseNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

function WorkflowCanvasInternal({ workflowId, workspaceId }: { workflowId: string; workspaceId: string }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { screenToFlowPosition, setViewport } = useReactFlow();

    // Load workflow on mount
    React.useEffect(() => {
        const loadWorkflow = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/api/saas-workflows/${workflowId}`);
                const data = (response as any).data;

                if (data && data.json) {
                    const { nodes: loadedNodes = [], edges: loadedEdges = [], viewport } = data.json;
                    setNodes(loadedNodes);
                    setEdges(loadedEdges);
                    if (viewport) {
                        setViewport(viewport);
                    }
                }
            } catch (error) {
                console.error('Failed to load workflow:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (workflowId) {
            loadWorkflow();
        }
    }, [workflowId, setNodes, setEdges, setViewport]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveStatus('idle');

            const flow = reactFlowWrapper.current ? {
                nodes,
                edges,
                viewport: { x: 0, y: 0, zoom: 1 }, // Default if needed, but getViewport is better
            } : null;

            const { x, y, zoom } = (window as any).reactFlowViewport || { x: 0, y: 0, zoom: 1 };

            const workflowData = {
                json: {
                    nodes,
                    edges,
                    viewport: { x, y, zoom },
                },
            };

            await apiClient.put(`/api/saas-workflows/${workflowId}`, workflowData);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save workflow:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !NODE_DEFINITIONS[type]) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: WorkflowNode = {
                id: `node_${Date.now()}`,
                type: NODE_DEFINITIONS[type].type,
                position,
                data: {
                    label: NODE_DEFINITIONS[type].label,
                    type: NODE_DEFINITIONS[type].type,
                    icon: NODE_DEFINITIONS[type].icon,
                    config: { ...NODE_DEFINITIONS[type].defaultConfig },
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes]
    );

    const updateNodeConfig = (id: string, config: Record<string, any>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } };
                }
                return node;
            })
        );
    };

    const deleteNode = (id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setSelectedNode(null);
    };

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flex h-screen w-full bg-[#0e0918] overflow-hidden">
            <Sidebar onDragStart={onDragStart} />

            <div className="flex-grow relative h-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    defaultViewport={defaultViewport}
                    fitView
                    className="bg-[#0e0918]"
                >
                    <Background color="#1a1425" gap={20} size={1} />
                    <Controls
                        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                        showInteractive={false}
                    />
                    <MiniMap
                        className="bg-[#1a1425] border border-white/10 rounded-2xl overflow-hidden hidden md:block"
                        maskColor="rgba(0,0,0,0.5)"
                        nodeColor="#8b5cf6"
                    />

                    <Panel position="top-right" className="flex items-center gap-4 p-4">
                        {saveStatus === 'success' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-bold animate-in fade-in slide-in-from-right-4">
                                <Check className="h-3 w-3" />
                                Saved successfully
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold animate-in fade-in slide-in-from-right-4">
                                <AlertTriangle className="h-3 w-3" />
                                Failed to save
                            </div>
                        )}
                        <button
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
                            disabled={isSaving || isLoading}
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="px-8 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Workflow'}
                        </button>
                    </Panel>
                </ReactFlow>
            </div>

            <PropertiesPane
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={updateNodeConfig}
                onDelete={deleteNode}
            />
        </div>
    );
}

export default function WorkflowCanvas({ workflowId, workspaceId }: { workflowId: string; workspaceId: string }) {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasInternal workflowId={workflowId} workspaceId={workspaceId} />
        </ReactFlowProvider>
    );
}
