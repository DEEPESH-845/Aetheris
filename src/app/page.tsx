"use client";

import React, { useState } from 'react';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { Hero } from '@/components/marketing/Hero';
import { LogoWall } from '@/components/marketing/LogoWall';
import { BentoFeatures } from '@/components/marketing/BentoFeatures';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Preloader } from '@/components/marketing/Preloader';

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);

  const handlePreloaderComplete = () => {
    setShowContent(true);
  };

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} duration={3000} />
      
      <div 
        className={`min-h-screen w-full bg-cyber-darker text-foreground overflow-x-hidden transition-opacity duration-1000 ease-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SiteHeader />
        
        <main>
          <Hero />
          <LogoWall />
          <BentoFeatures />
        </main>
        
        <SiteFooter />
      </div>
    </>
  );
}
