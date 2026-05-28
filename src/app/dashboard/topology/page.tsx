"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CyberPanel } from '@/components/core/CyberPanel';
import { NetworkTopology } from '@/components/visualization/NetworkTopology';
import { Network, Search, Filter } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", bounce: 0, duration: 0.8 } 
  }
};

export default function TopologyPage() {
  const { networkNodes } = useSimulationStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalNodes = Object.keys(networkNodes).length;
  const compromisedNodes = Object.values(networkNodes).filter(n => n.status === 'compromised').length;
  const isolatedNodes = Object.values(networkNodes).filter(n => n.status === 'isolated').length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 h-full flex flex-col"
    >
      <motion.header variants={itemVariants} className="flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            >
              <Network className="w-8 h-8 text-neon-cyan" />
            </motion.div>
            ENTERPRISE NETWORK TOPOLOGY
          </h1>
          <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Live asset tracking and path visualization.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-mono uppercase tracking-widest bg-black/40 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col items-center px-4 border-r border-white/10 group cursor-default">
             <span className="text-text-muted group-hover:text-white transition-colors">TOTAL NODES</span>
             <motion.span 
               key={totalNodes}
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-lg text-white font-bold"
             >
               {totalNodes}
             </motion.span>
           </div>
           <div className="flex flex-col items-center px-4 border-r border-white/10 group cursor-default">
             <span className="text-text-muted group-hover:text-neon-red transition-colors">COMPROMISED</span>
             <motion.span 
               key={compromisedNodes}
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-lg text-neon-red font-bold drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]"
             >
               {compromisedNodes}
             </motion.span>
           </div>
           <div className="flex flex-col items-center px-4 group cursor-default">
             <span className="text-text-muted group-hover:text-text-secondary transition-colors">ISOLATED</span>
             <motion.span 
               key={isolatedNodes}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-lg text-text-secondary font-bold"
             >
               {isolatedNodes}
             </motion.span>
           </div>
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="flex-1 overflow-hidden">
        <CyberPanel className="h-full p-0 relative" scanline glowColor="cyan">
           <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none">
              <div className="flex items-center gap-4 pointer-events-auto">
                 <div className="relative group">
                   <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-neon-cyan transition-colors" />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search Nodes..." 
                     className="bg-black/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/5 transition-all w-[240px]"
                   />
                 </div>
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="p-2 bg-black/60 border border-white/10 rounded-lg text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-colors"
                 >
                   <Filter className="w-4 h-4" />
                 </motion.button>
              </div>
              
              <div className="flex items-center gap-3 bg-black/50 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                <span className="text-xs font-mono text-neon-cyan tracking-widest font-semibold">SYNCED</span>
              </div>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, filter: "blur(10px)" }}
             animate={{ opacity: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.2, delay: 0.4 }}
             className="h-full"
           >
             <NetworkTopology searchQuery={searchQuery} />
           </motion.div>
        </CyberPanel>
      </motion.div>
    </motion.div>
  );
}
