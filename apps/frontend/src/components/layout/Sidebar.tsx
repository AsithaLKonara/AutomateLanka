'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    GitBranch,
    Search,
    Settings,
    LayoutGrid,
    Database,
    Users,
    HelpCircle,
    BarChart3,
    Cloud,
    Zap
} from 'lucide-react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => (
    <Link
        href={href}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${active
            ? 'bg-n8n-background-light text-n8n-primary shadow-sm'
            : 'text-n8n-text-tint hover:bg-n8n-background hover:text-n8n-text'
            }`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname();
    const params = useParams();
    const { user, workspace } = useAuth();
    const workspaceId = params.workspaceId as string;

    // Use current workspace ID if in a workspace route, otherwise use user's default/first workspace
    const currentWorkspaceId = workspaceId || workspace?.id;

    const prefix = currentWorkspaceId ? `/w/${currentWorkspaceId}` : '';

    const primaryItems = [
        { label: 'Dashboard', href: `${prefix}/dashboard`, icon: <LayoutGrid size={20} /> },
        { label: 'Workflows', href: `${prefix}/workflows`, icon: <GitBranch size={20} /> },
        { label: 'Executions', href: `${prefix}/runs`, icon: <BarChart3 size={20} /> },
    ];

    const secondaryItems = [
        { label: 'Integrations', href: `${prefix}/integrations`, icon: <Zap size={20} /> },
        { label: 'Credentials', href: `${prefix}/credentials`, icon: <Database size={20} /> },
    ];

    const bottomItems = [
        { label: 'Settings', href: `${prefix}/settings`, icon: <Settings size={20} /> },
    ];

    return (
        <aside className="w-64 h-full bg-n8n-foreground border-r border-n8n-foreground flex flex-col p-4 z-40">
            {/* Brand/Logo Area */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-8 h-8 bg-n8n-primary rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="text-white" size={18} fill="currentColor" />
                </div>
                <span className="font-bold text-n8n-text-shade text-lg overflow-hidden whitespace-nowrap">
                    AutomateLanka
                </span>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-1 flex-1">
                {primaryItems.map(item => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                    />
                ))}

                <div className="h-4" />
                <div className="text-[10px] font-bold text-n8n-text-tint uppercase px-3 mb-2 tracking-wider">
                    Resources
                </div>

                {secondaryItems.map(item => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                    />
                ))}
            </div>

            {/* Bottom Area */}
            <div className="flex flex-col gap-1 pt-4 border-t border-n8n-background">
                {bottomItems.map(item => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                    />
                ))}

                <div className="mt-4 flex items-center gap-3 px-3 py-2 border-t border-n8n-background pt-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-n8n-text-shade truncate">{user?.name || user?.email || 'User'}</span>
                        <span className="text-[10px] text-n8n-text-tint truncate">{workspace?.plan?.name || 'Free Plan'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
