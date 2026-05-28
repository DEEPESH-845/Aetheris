import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 md:h-20 z-50 glass-panel border-b border-white/5 bg-cyber-darker/60 flex items-center px-6 md:px-12">
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
          <Link href="#architecture" className="text-sm font-mono text-text-muted hover:text-neon-cyan transition-colors uppercase tracking-widest">
            Architecture
          </Link>
          <Link href="#features" className="text-sm font-mono text-text-muted hover:text-neon-cyan transition-colors uppercase tracking-widest">
            Capabilities
          </Link>
          <Link href="#sandbox" className="text-sm font-mono text-text-muted hover:text-neon-cyan transition-colors uppercase tracking-widest">
            Sandbox
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <CyberButton variant="ghost" className="hidden md:flex">
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
