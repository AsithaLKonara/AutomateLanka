'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumGlassCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  children?: ReactNode;
}

export default function PremiumGlassCard({ 
  title, 
  description, 
  icon: Icon, 
  gradient = 'from-purple-500 to-pink-500',
  children 
}: PremiumGlassCardProps) {
  return (
    <div className="group relative">
      {/* Hover Glow Effect */}
      <div 
        className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"
      ></div>

      {/* Main Card */}
      <div 
        className="relative glass-card rounded-2xl p-8 transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.074)',
          border: '1px solid rgba(255, 255, 255, 0.222)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated Gradient Spinner (Optional) */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${gradient.includes('purple') ? '#9333ea' : '#ec4899'} 10%, transparent 20%)`,
              animation: 'spin 2s linear infinite',
            }}
          />
        </div>

        {/* Icon with Gradient Background */}
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} p-0.5 mb-6`}>
          <div className="w-full h-full rounded-xl bg-black/90 flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/70 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Children (Optional Content) */}
        {children}

        {/* Bottom Border Accent */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl`}
        ></div>
      </div>

      <style jsx>{`
        .glass-card:hover {
          box-shadow: 0px 0px 20px 1px #ffbb763f;
          border: 1px solid rgba(255, 255, 255, 0.454);
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

