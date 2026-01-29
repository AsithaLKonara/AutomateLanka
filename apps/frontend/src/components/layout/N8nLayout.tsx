'use client';

import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import GradientBackground from '../GradientBackground';

interface N8nLayoutProps {
    children: React.ReactNode;
}

export default function N8nLayout({ children }: N8nLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-n8n-background overflow-hidden font-sans text-n8n-text">
            {/* Background Layer (Antigravity Style) */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <GradientBackground />
            </div>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <AppHeader />

                <main className="flex-1 overflow-auto relative custom-scrollbar">
                    {/* Content Wrapper */}
                    <div className="p-8 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global CSS for n8n scrollbar (optional, but nice) */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e1e2e6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d2d6;
        }
      `}</style>
        </div>
    );
}
