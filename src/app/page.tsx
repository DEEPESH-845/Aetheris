"use client";

import React from 'react';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { Hero } from '@/components/marketing/Hero';
import { LogoWall } from '@/components/marketing/LogoWall';
import { BentoFeatures } from '@/components/marketing/BentoFeatures';
import { SiteFooter } from '@/components/marketing/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-cyber-darker text-foreground overflow-x-hidden">
      <SiteHeader />
      
      <main>
        <Hero />
        <LogoWall />
        <BentoFeatures />
      </main>
      
      <SiteFooter />
    </div>
  );
}
