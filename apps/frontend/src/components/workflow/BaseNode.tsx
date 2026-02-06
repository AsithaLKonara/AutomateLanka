'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { WorkflowNodeData } from './types';
import { NODE_CATEGORIES } from './constants';

const BaseNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
    const category = NODE_CATEGORIES.find(c => c.id === data.type);
    const Icon = (LucideIcons as any)[data.icon || 'help-circle'] || LucideIcons.HelpCircle;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative min-w-[200px] bg-[#1a1425] border-2 rounded-2xl p-4 transition-all duration-200 group ${selected ? 'border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'border-white/10 hover:border-white/20'
                }`}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 border-2 border-[#1a1425] transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                style={{ backgroundColor: category?.color || '#8b5cf6' }}
            />

            <div className="flex items-center gap-4">
                {/* Icon Avatar */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ backgroundColor: `${category?.color}20` }}
                >
                    <Icon size={20} style={{ color: category?.color }} />
                </div>

                {/* Info */}
                <div className="flex-grow overflow-hidden">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-0.5">
                        {data.type}
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                        {data.label}
                    </div>
                </div>

                {/* Status Dot */}
                {data.status && (
                    <div className={`w-2 h-2 rounded-full ${data.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                            data.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                data.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-white/20'
                        }`} />
                )}
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className={`w-3 h-3 border-2 border-[#1a1425] transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                style={{ backgroundColor: category?.color || '#8b5cf6' }}
            />
        </motion.div>
    );
};

export default memo(BaseNode);
