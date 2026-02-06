'use client';

import React from 'react';

// Components
import SiteHeader from '@/components/landing/SiteHeader';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import MarketplacePreviewSection from '@/components/landing/MarketplacePreviewSection';
import TrustSection from '@/components/landing/TrustSection';
import SiteFooter from '@/components/landing/SiteFooter';
import FinalCTA from '@/components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0e0918] text-white selection:bg-[#8b5cf6] selection:text-white">
      {/* 1. Header (Sticky/Fixed) */}
      <SiteHeader />

      {/* 2. Hero Section (High-end, Pro grade, No video) */}
      <HeroSection />

      {/* 3. Problem Section (Why this exists) */}
      <ProblemSection />

      {/* 4. Features Section (AI Capabilities) */}
      <FeaturesSection />

      {/* 5. How It Works (Step by step) */}
      <HowItWorksSection />

      {/* 6. Social Proof (Trust/Logos) */}
      <SocialProofSection />

      {/* 7. Integrations (Grid) */}
      <IntegrationsSection />

      {/* 8. Marketplace Preview (Value Showcase) */}
      <MarketplacePreviewSection />

      {/* 9. Trust/Security */}
      <TrustSection />

      {/* 10 & 11. Final CTA + Footer */}
      <div className="border-t border-white/5">
        <FinalCTA />
        <SiteFooter />
      </div>
    </main>
  );
}
