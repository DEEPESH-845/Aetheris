import React from 'react';
import Link from 'next/link';
import { Shield, Activity } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-cyber-dark pt-16 pb-8 px-6 md:px-12 mt-20 relative z-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-neon-cyan" />
            <span className="font-outfit font-bold tracking-widest text-white uppercase text-sm">
              Aetheris<span className="text-neon-cyan">.ai</span>
            </span>
          </Link>
          <p className="text-xs text-text-muted leading-relaxed font-mono max-w-[250px]">
            Next-Generation Autonomous Multimodal AI Cyber Defense Platform.
          </p>
        </div>

        <div>
          <h4 className="text-white font-mono text-[11px] uppercase tracking-widest mb-6">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="#architecture" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Core Architecture</Link></li>
            <li><Link href="#features" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Threat Detection</Link></li>
            <li><Link href="#features" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">AI Cognitive Agents</Link></li>
            <li><Link href="#sandbox" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Digital Twin Sandbox</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-mono text-[11px] uppercase tracking-widest mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><a href="https://github.com/aetheris" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Documentation</a></li>
            <li><a href="https://github.com/aetheris" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">GitHub Repository</a></li>
            <li><a href="#" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">API Reference</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-mono text-[11px] uppercase tracking-widest mb-6">System Status</h4>
          <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-sm w-fit">
            <Activity className="w-4 h-4 text-neon-green animate-pulse" />
            <span className="text-xs font-mono text-text-secondary uppercase">All Systems Nominal</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-text-muted font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Aetheris Defense Corp. All rights reserved.
        </p>
        <div className="flex gap-4">
          <span className="text-[10px] text-text-muted/50 font-mono tracking-widest uppercase">Version: 9.4.2</span>
        </div>
      </div>
    </footer>
  );
}
