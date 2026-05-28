"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Network, Target, Database, Settings, Menu, X, Cpu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useSimulationEngine } from '@/simulation/engine';
import { CyberButton } from '../core/CyberButton';
import { StatusBadge } from '../core/StatusBadge';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: Activity },
  { href: '/dashboard/monitoring', label: 'Threat Monitor', icon: Target },
  { href: '/dashboard/topology', label: 'Network Topology', icon: Network },
  { href: '/dashboard/sandbox', label: 'Sandbox Lab', icon: Database },
  { href: '/dashboard/settings', label: 'Configuration', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { globalThreatScore, systemHealth, activeThreats, updateThreatStatus, setGlobalThreatScore } = useSimulationStore();

  // Mount the global simulation engine
  useSimulationEngine();

  const handleForceDefense = () => {
    activeThreats.forEach(t => updateThreatStatus(t.id, 'RESOLVED'));
    setGlobalThreatScore(12);
  };

  const getThreatColor = (score: number) => {
    if (score > 75) return 'text-neon-red';
    if (score > 40) return 'text-yellow-400';
    return 'text-neon-cyan';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-darker text-text-primary">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col h-full border-r border-white/10 bg-cyber-dark z-40 relative flex-shrink-0"
          >
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
              <Shield className="w-8 h-8 text-neon-cyan" />
              <div>
                <h1 className="font-outfit font-bold text-lg tracking-wider text-white">Aetheris<span className="text-neon-cyan">.ai</span></h1>
                <p className="text-[10px] font-mono text-neon-cyan/70 uppercase tracking-widest">Autonomous Defense</p>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-mono text-sm uppercase tracking-wider relative group overflow-hidden",
                      isActive 
                        ? "text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30" 
                        : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                    )}>
                      {isActive && (
                        <motion.div 
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-transparent pointer-events-none"
                        />
                      )}
                      <Icon className="w-4 h-4 z-10" />
                      <span className="z-10 mt-0.5">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <div className="bg-black/40 border border-white/10 rounded-sm p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-text-muted">SYSTEM STATUS</span>
                  <StatusBadge status={systemHealth.cpu > 80 ? 'warning' : 'healthy'} label="ONLINE" pulse />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">Global Threat</span>
                    <span className={cn("font-bold", getThreatColor(globalThreatScore))}>{globalThreatScore}/100</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className={cn("h-full", globalThreatScore > 75 ? 'bg-neon-red' : globalThreatScore > 40 ? 'bg-yellow-400' : 'bg-neon-cyan')}
                      initial={{ width: 0 }}
                      animate={{ width: `${globalThreatScore}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Background ambient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/5 via-cyber-darker to-cyber-darker pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-white/10 bg-cyber-dark/50 backdrop-blur-md flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-text-secondary hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <Cpu className="w-3 h-3 text-neon-magenta" />
              <span>AI CORE: ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <CyberButton onClick={handleForceDefense} variant="outline" size="sm" icon={<Shield className="w-3 h-3" />}>
              Force Defense
            </CyberButton>
            <div className="w-8 h-8 rounded-full border border-neon-cyan/50 bg-neon-cyan/10 flex items-center justify-center relative">
              <span className="text-neon-cyan font-mono text-xs">OP</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full border border-cyber-darker" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
