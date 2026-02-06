import { Node, Edge } from '@xyflow/react';

export type NodeType = 'trigger' | 'action' | 'logic';

export interface WorkflowNodeData extends Record<string, unknown> {
    label: string;
    icon?: string;
    type: NodeType;
    status?: 'idle' | 'running' | 'success' | 'error';
    config?: Record<string, any>;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface NodeCategory {
    id: string;
    label: string;
    color: string;
    icon: string;
}

export interface NodeDefinition {
    type: string;
    category: string;
    label: string;
    description: string;
    icon: string;
    defaultConfig: Record<string, any>;
}
