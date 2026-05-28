"use client";

import React from 'react';
import { CyberPanel } from '@/components/core/CyberPanel';
import { NetworkTopology } from '@/components/visualization/NetworkTopology';
import { Network, Search, Filter } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function TopologyPage() {
  const { networkNodes } = useSimulationStore();
  
  const totalNodes = Object.keys(networkNodes).length;
  const compromisedNodes = Object.values(networkNodes).filter(n => n.status === 'compromised').length;
  const isolatedNodes = Object.values(networkNodes).filter(n => n.status === 'isolated').length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
            <Network className="w-8 h-8 text-neon-cyan" />
            ENTERPRISE NETWORK TOPOLOGY
          </h1>
          <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Live asset tracking and path visualization.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-mono uppercase tracking-widest bg-black/40 border border-white/10 p-3 rounded-sm">
           <div className="flex flex-col items-center px-4 border-r border-white/10">
             <span className="text-text-muted">TOTAL NODES</span>
             <span className="text-lg text-white font-bold">{totalNodes}</span>
           </div>
           <div className="flex flex-col items-center px-4 border-r border-white/10">
             <span className="text-text-muted">COMPROMISED</span>
             <span className="text-lg text-neon-red font-bold">{compromisedNodes}</span>
           </div>
           <div className="flex flex-col items-center px-4">
             <span className="text-text-muted">ISOLATED</span>
             <span className="text-lg text-text-secondary font-bold">{isolatedNodes}</span>
           </div>
        </div>
      </header>

      <CyberPanel className="flex-1 overflow-hidden p-0" scanline glowColor="cyan">
         <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
               <div className="relative">
                 <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Search Nodes..." 
                   className="bg-black/60 border border-white/10 rounded-sm py-1.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-neon-cyan/50"
                 />
               </div>
               <button className="p-1.5 bg-black/60 border border-white/10 rounded-sm text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/50 transition-colors">
                 <Filter className="w-4 h-4" />
               </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-xs font-mono text-neon-cyan tracking-widest">SYNCED</span>
            </div>
         </div>
         <NetworkTopology />
      </CyberPanel>
    </div>
  );
}
