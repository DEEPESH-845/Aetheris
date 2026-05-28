"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

export function SiteHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Architecture', href: '/architecture' },
    { name: 'Capabilities', href: '/#features' },
    { name: 'Sandbox', href: '/sandbox' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 h-16 md:h-20 z-50 glass-panel border-b border-white/5 bg-cyber-darker/60 flex items-center px-6 md:px-12 backdrop-blur-xl">
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-8 h-8">
            <Shield className="w-6 h-6 text-neon-cyan relative z-10 transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 border border-neon-cyan/40 rounded-full scale-125 transition-transform duration-700 group-hover:rotate-180" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-widest text-white uppercase">
            Aetheris<span className="text-neon-cyan">.ai</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={`text-sm font-mono uppercase tracking-widest transition-all duration-300 relative ${
                  isActive 
                    ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <CyberButton variant="ghost" className="hidden md:flex hover:text-white">
              Sign In
            </CyberButton>
          </Link>
          <Link href="/dashboard">
            <CyberButton variant="primary">
              Launch SOC
            </CyberButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
