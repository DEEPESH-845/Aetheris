"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Crosshair, Cpu, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../core/StatusBadge';

export function ActiveThreatsList() {
  const { activeThreats } = useSimulationStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        <AnimatePresence>
          {activeThreats.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center h-full text-text-muted opacity-50 space-y-2"
            >
              <ShieldAlert className="w-8 h-8 mb-2" />
              <p className="text-sm font-mono uppercase tracking-widest">No Active Threats</p>
            </motion.div>
          ) : (
            activeThreats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/40 border border-white/10 p-3 rounded-sm flex flex-col gap-2 relative overflow-hidden group"
              >
                {/* Background warning pulse for critical */}
                {threat.severity === 'CRITICAL' && (
                  <div className="absolute inset-0 bg-neon-red/5 animate-pulse pointer-events-none" />
                )}
                
                <div className="flex justify-between items-start z-10 relative">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${threat.severity === 'CRITICAL' ? 'text-neon-red' : threat.severity === 'HIGH' ? 'text-yellow-500' : 'text-neon-cyan'}`} />
                    <span className="font-mono text-sm text-white font-bold">{threat.type}</span>
                  </div>
                  <StatusBadge 
                    status={threat.status === 'DETECTED' ? 'critical' : threat.status === 'ANALYZING' ? 'warning' : 'mitigating'} 
                    label={threat.status} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 z-10 relative">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                    <Crosshair className="w-3 h-3 text-neon-magenta" />
                    <span className="truncate">TGT: {threat.targetNode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                    <Cpu className="w-3 h-3 text-neon-cyan" />
                    <span>SRC: {threat.sourceIp}</span>
                  </div>
                </div>

                {threat.mitigationAction && (
                  <div className="mt-2 text-xs font-mono text-neon-purple bg-neon-purple/10 border border-neon-purple/20 p-2 rounded-sm z-10 relative">
                    &gt; {threat.mitigationAction}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
