'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import {
  LayoutDashboard,
  Workflow,
  PlayCircle,
  Settings,
  Users,
  CreditCard,
  Plug,
  Key,
  LogOut,
  Home,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { workspace, logout, user } = useAuth();

  if (!workspace) {
    return null;
  }

  const workspaceBase = `/w/${workspace.id}`;

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: `${workspaceBase}/dashboard`, icon: LayoutDashboard },
    { name: 'Workflows', href: `${workspaceBase}/workflows`, icon: Workflow },
    { name: 'Runs', href: `${workspaceBase}/runs`, icon: PlayCircle },
    { name: 'Integrations', href: `${workspaceBase}/integrations`, icon: Plug },
  ];

  const settingsItems: NavItem[] = [
    { name: 'Members', href: `${workspaceBase}/settings/members`, icon: Users },
    { name: 'Billing', href: `${workspaceBase}/settings/billing`, icon: CreditCard },
    { name: 'API Keys', href: `${workspaceBase}/settings/api-keys`, icon: Key },
    { name: 'Settings', href: `${workspaceBase}/settings`, icon: Settings },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="h-screen w-64 bg-slate-900 border-r border-white/10 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">AutomateLanka</span>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="p-4">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="text-white/50 text-xs uppercase font-semibold px-3 py-2">
            Settings
          </div>
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                    active
                      ? 'bg-purple-600 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-white text-sm font-medium truncate max-w-[120px]">
                {user?.name || 'User'}
              </div>
              <div className="text-white/50 text-xs truncate max-w-[120px]">
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-lg transition text-white/70 hover:text-white"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

