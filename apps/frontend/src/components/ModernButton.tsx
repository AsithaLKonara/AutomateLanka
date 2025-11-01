'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ModernButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  className?: string;
}

export default function ModernButton({ 
  children, 
  icon: Icon, 
  variant = 'primary', 
  onClick,
  className = '' 
}: ModernButtonProps) {
  const baseClasses = 'relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70',
    secondary: 'bg-gradient-to-r from-gray-800 to-black text-white border border-white/20 hover:border-white/40',
    outline: 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50'
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
      
      {/* Glow effect on hover */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity -z-10"></div>
      )}
    </button>
  );
}

