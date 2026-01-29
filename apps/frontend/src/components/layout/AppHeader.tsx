'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Share2, Play, Save, MoreHorizontal } from 'lucide-react';

export default function AppHeader() {
    const pathname = usePathname();

    // Dynamic breadcrumbs based on path
    const pathParts = pathname.split('/').filter(Boolean);
    const pageName = pathParts[pathParts.length - 1] || 'Dashboard';

    const formattedPageName = pageName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <header className="h-14 bg-white border-b border-n8n-foreground flex items-center justify-between px-6 z-30">
            {/* Left side: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-n8n-text-tint">Workflows</span>
                <ChevronRight size={14} className="text-n8n-text-tint" />
                <span className="font-bold text-n8n-text-shade">{formattedPageName}</span>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-n8n-text hover:bg-n8n-background transition-colors">
                    <Share2 size={16} />
                    <span>Share</span>
                </button>

                <div className="w-px h-6 bg-n8n-foreground mx-1" />

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-n8n-text hover:bg-n8n-background transition-colors">
                    <Save size={16} />
                    <span>Save</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold text-white bg-n8n-success hover:opacity-90 transition-all shadow-sm">
                    <Play size={16} fill="currentColor" />
                    <span>Execute</span>
                </button>

                <button className="p-1.5 rounded-md text-n8n-text-tint hover:bg-n8n-background transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </header>
    );
}
