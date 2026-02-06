'use client';

import Image from 'next/image';
import { CheckCircle2, XCircle, MoreVertical, Download, Eye } from 'lucide-react';

interface Workflow {
    id: number;
    filename: string;
    name: string;
    active: boolean;
    description: string;
    trigger_type: string;
    node_count: number;
    integrations: string[];
}

interface N8nWorkflowCardProps {
    workflow: Workflow;
    onDownload?: (filename: string) => void;
}

export default function N8nWorkflowCard({ workflow, onDownload }: N8nWorkflowCardProps) {
    // Normalization function for icon paths
    const getIconPath = (name: string) => {
        if (!name) return '/icons/integrations/N8nTrigger.svg';

        // n8n often returns names like 'gmail', 'slack', etc.
        // Our icons are PascalCase: 'Gmail.svg', 'Slack.svg'
        const normalized = name
            .split(/[\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');

        return `/icons/integrations/${normalized}.svg`;
    };

    const primaryIntegration = workflow.integrations[0];
    const iconPath = getIconPath(primaryIntegration);

    return (
        <div className="group bg-n8n-background-light rounded-n8n border border-n8n-foreground hover:border-n8n-primary/30 hover:shadow-n8n-light transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden">
            {/* Top Banner (optional, n8n has a 1px top border for active) */}
            <div className={`h-1 w-full ${workflow.active ? 'bg-n8n-success' : 'bg-transparent'}`} />

            <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Header: Icon + Name + Actions */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-white rounded-n8n border border-n8n-foreground p-2 shrink-0 shadow-sm flex items-center justify-center">
                            <img
                                src={iconPath}
                                alt={primaryIntegration || 'n8n'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/icons/integrations/N8nTrigger.svg';
                                }}
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-bold text-n8n-text-shade truncate group-hover:text-n8n-primary transition-colors text-sm">
                                {workflow.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {workflow.active ? (
                                    <CheckCircle2 size={12} className="text-n8n-success fill-n8n-success/10" />
                                ) : (
                                    <XCircle size={12} className="text-n8n-text-tint" />
                                )}
                                <span className="text-[10px] font-bold text-n8n-text-tint uppercase tracking-tighter">
                                    {workflow.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="p-1.5 rounded-md text-n8n-text-tint hover:bg-n8n-background transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                    </button>
                </div>

                {/* Description */}
                <p className="text-xs text-n8n-text-tint line-clamp-2 leading-relaxed h-8">
                    {workflow.description || 'No description available for this workflow.'}
                </p>

                {/* Integrations List */}
                <div className="flex flex-wrap gap-1 mt-auto">
                    {workflow.integrations.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-n8n-background text-[10px] font-medium text-n8n-text border border-n8n-foreground/50">
                            {item}
                        </span>
                    ))}
                    {workflow.integrations.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-n8n-background text-[10px] font-medium text-n8n-text-tint">
                            +{workflow.integrations.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-black/10">
                <div className="flex items-center gap-3 text-[10px] text-n8n-text-tint font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                        <span className="text-n8n-text-shade">{workflow.node_count}</span>
                        <span>Nodes</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-n8n-foreground" />
                    <span>{workflow.trigger_type}</span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload?.(workflow.filename); }}
                        className="p-1.5 rounded hover:bg-n8n-background text-n8n-text-tint"
                        title="Download JSON"
                    >
                        <Download size={14} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-n8n-background text-n8n-text-tint" title="Preview">
                        <Eye size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
