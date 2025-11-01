'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, Check, Plus } from 'lucide-react';

export default function WorkspaceSwitcher() {
  const { workspace, workspaces, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.workspace-switcher')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (!workspace) {
    return null;
  }

  return (
    <div className="relative workspace-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition border border-white/10"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-white font-medium text-sm truncate max-w-[150px]">
              {workspace.name}
            </div>
            <div className="text-white/50 text-xs">
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="p-2">
            <div className="text-white/50 text-xs uppercase font-semibold px-3 py-2">
              Your Workspaces
            </div>

            <div className="max-h-60 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    if (ws.id !== workspace.id) {
                      switchWorkspace(ws.id);
                    }
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/10 rounded-lg transition text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {ws.name}
                      </div>
                      <div className="text-white/50 text-xs">
                        {ws.slug}
                      </div>
                    </div>
                  </div>
                  {ws.id === workspace.id && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to create workspace page
                  window.location.href = '/workspaces/new';
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition text-purple-400"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

