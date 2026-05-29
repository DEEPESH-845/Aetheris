"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberPanel } from '@/components/core/CyberPanel';
import { useSimulationStore, DefensiveOperation, DefensiveActionType } from '@/store/useSimulationStore';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Network, AlertTriangle, CheckCircle2, Loader2, XOctagon } from 'lucide-react';
import { StatusBadge } from '@/components/core/StatusBadge';

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const ACTION_CONFIG: Record<DefensiveActionType, { icon: any; color: string; label: string }> = {
  ISOLATE_NODE: { icon: Network, color: 'text-orange-400', label: 'Network Isolation' },
  BLOCK_ASN: { icon: ShieldAlert, color: 'text-neon-red', label: 'BGP Route Nulling' },
  TERMINATE_PROCESS: { icon: XOctagon, color: 'text-yellow-400', label: 'Process Termination' },
  ENFORCE_ZERO_TRUST: { icon: ShieldCheck, color: 'text-neon-cyan', label: 'Zero Trust Enforcement' },
};

const STATUS_CONFIG = {
  PENDING: { color: 'text-text-muted', dot: 'bg-text-muted animate-pulse' },
  EXECUTING: { color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
  VERIFYING: { color: 'text-neon-cyan', dot: 'bg-neon-cyan animate-pulse' },
  SUCCESS: { color: 'text-neon-green', dot: 'bg-neon-green' },
  FAILED: { color: 'text-neon-red', dot: 'bg-neon-red animate-ping' },
};

// ─── Countermeasure Card ──────────────────────────────────────────────────────

function CountermeasureCard({ op }: { op: DefensiveOperation }) {
  const config = ACTION_CONFIG[op.action];
  const statConfig = STATUS_CONFIG[op.status];
  const Icon = config.icon;

  const uptime = op.completedAt 
    ? Math.floor((op.completedAt - op.startedAt) / 1000) 
    : Math.floor((Date.now() - op.startedAt) / 1000);
  const uptimeStr = uptime < 60 ? `${uptime}s` : `${Math.floor(uptime/60)}m ${uptime%60}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-black/40 backdrop-blur-xl border rounded-xl p-5 space-y-4 overflow-hidden transition-all duration-500 group ${op.status === 'EXECUTING' ? 'border-yellow-400/40 shadow-[0_0_15px_rgba(255,200,0,0.1)]' : op.status === 'SUCCESS' ? 'border-neon-green/20' : 'border-white/5 hover:border-white/10'}`}
    >
      {/* Active Glow */}
      {(op.status === 'EXECUTING' || op.status === 'VERIFYING') && (
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-opacity duration-700 opacity-20 group-hover:opacity-40 ${op.status === 'EXECUTING' ? 'bg-yellow-400' : 'bg-neon-cyan'}`} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between z-10 relative">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-lg border bg-black/40 transition-colors ${op.status === 'SUCCESS' ? 'border-neon-green/30 text-neon-green bg-neon-green/5' : `border-white/10 ${config.color} group-hover:bg-white/5`}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-outfit font-bold text-white tracking-wide">{op.id}</div>
            <div className="text-[10px] font-mono text-text-muted mt-1 uppercase tracking-widest">{config.label}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-mono uppercase tracking-widest bg-black/60 shadow-sm ${statConfig.color} ${op.status === 'SUCCESS' ? 'border-neon-green/30' : 'border-white/10'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statConfig.dot}`} />
              {op.status}
           </span>
           <span className="text-[9px] font-mono text-text-muted font-semibold">{uptimeStr}</span>
        </div>
      </div>

      {/* Progress bar for active states */}
      {(op.status === 'EXECUTING' || op.status === 'VERIFYING') && (
        <div className="h-1 bg-black/40 rounded-full overflow-hidden relative z-10">
          <motion.div 
            className={`h-full ${op.status === 'EXECUTING' ? 'bg-yellow-400' : 'bg-neon-cyan'}`}
            initial={{ width: "10%" }}
            animate={{ width: op.status === 'VERIFYING' ? "80%" : "40%" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 z-10 relative pt-2 border-t border-white/5">
        {/* Target Info */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 text-[10px] font-mono flex flex-col gap-1">
          <span className="text-text-muted uppercase tracking-wider text-[8px]">Target</span>
          <span className="text-white font-semibold truncate">{op.target}</span>
        </div>
        
        {/* Threat Association */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 text-[10px] font-mono flex flex-col gap-1">
          <span className="text-text-muted uppercase tracking-wider text-[8px]">Threat ID</span>
          <span className="text-neon-red font-semibold drop-shadow-[0_0_5px_rgba(255,0,0,0.5)] truncate">{op.threatId}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Defensive Operations Log Terminal ────────────────────────────────────────

function DefensiveLogTerminal({ operations }: { operations: DefensiveOperation[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Flatten and sort all logs across operations
  const allLogs = operations.flatMap(op => 
    op.logs.map((log, index) => ({ id: `${op.id}-${index}`, text: log, timestamp: op.startedAt + index * 2000 }))
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allLogs.length]);

  return (
    <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[10px] space-y-2 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
      
      {allLogs.length === 0 ? (
        <div className="flex items-center gap-3 text-text-muted opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="uppercase tracking-widest text-[9px]">Awaiting autonomous operations...</span>
        </div>
      ) : (
        <div className="relative z-10 space-y-1.5">
          <AnimatePresence initial={false}>
            {allLogs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 text-text-muted opacity-60">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 })}
                </span>
                <span className="shrink-0 text-neon-cyan/40 select-none">❯</span>
                <span className={`leading-relaxed ${
                  log.text.includes('SUCCESS') ? 'text-neon-green font-semibold' :
                  log.text.includes('EXEC') ? 'text-yellow-400' :
                  log.text.includes('VERIFY') ? 'text-neon-cyan' :
                  log.text.includes('FAIL') ? 'text-neon-red' :
                  'text-text-secondary'
                }`}>{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Main Defensive Ops Page ──────────────────────────────────────────────────

export default function DefensiveOpsPage() {
  const { defensiveOperations, networkNodes } = useSimulationStore();
  const operations = Object.values(defensiveOperations).sort((a, b) => b.startedAt - a.startedAt);
  const activeOps = operations.filter(op => op.status !== 'SUCCESS' && op.status !== 'FAILED');
  const completedOps = operations.filter(op => op.status === 'SUCCESS' || op.status === 'FAILED');

  const isolatedNodes = Object.values(networkNodes).filter(n => n.status === 'isolated');

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <header className="flex-shrink-0 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
            <Shield className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-wide">AUTONOMOUS DEFENSIVE OPERATIONS</h1>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest mt-1">
              Real-time countermeasure deployment · Network quarantine · Threat neutralization
            </p>
          </div>
        </div>
        <div className="flex gap-6 items-center bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Active Ops</span>
             <span className="text-2xl font-outfit font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]">{activeOps.length}</span>
           </div>
           <div className="w-px h-10 bg-white/10" />
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Neutralized</span>
             <span className="text-2xl font-outfit font-bold text-neon-green drop-shadow-[0_0_8px_rgba(0,255,100,0.5)]">{completedOps.length}</span>
           </div>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Active Countermeasures & Quarantine */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* Active Countermeasures */}
          <CyberPanel className="flex flex-col flex-shrink-0 gap-4 bg-black/40 backdrop-blur-2xl border-white/5 p-5" glowColor="cyan">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <ShieldAlert className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Active Countermeasures</h2>
            </div>
            <div className="space-y-4">
               {activeOps.length === 0 ? (
                 <div className="text-[10px] font-mono text-text-muted opacity-50 p-6 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                   No active countermeasures. System is secure.
                 </div>
               ) : (
                 <AnimatePresence>
                   {activeOps.map(op => <CountermeasureCard key={op.id} op={op} />)}
                 </AnimatePresence>
               )}
            </div>
          </CyberPanel>

          {/* Quarantine Visualizer */}
          <CyberPanel className="flex flex-col flex-shrink-0 gap-4 bg-black/40 backdrop-blur-2xl border-white/5 p-5 relative overflow-hidden" glowColor="magenta">
            {/* Warning striping background if isolated nodes exist */}
            {isolatedNodes.length > 0 && (
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff8800_10px,#ff8800_20px)]" />
            )}
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,136,0,0.5)]">Network Quarantine</h2>
              </div>
              {isolatedNodes.length > 0 && (
                <span className="text-[10px] font-mono text-orange-400 border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 rounded-sm animate-pulse">
                  {isolatedNodes.length} ISOLATED
                </span>
              )}
            </div>
            
            <div className="space-y-3 relative z-10">
              {isolatedNodes.length === 0 ? (
                <div className="text-[10px] font-mono text-text-muted opacity-50 p-6 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                  No nodes currently isolated.
                </div>
              ) : (
                <AnimatePresence>
                  {isolatedNodes.map(node => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-orange-400/5 border border-orange-400/20 rounded-lg group hover:bg-orange-400/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-orange-400/10 rounded-md">
                          <XOctagon className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-xs font-mono text-white font-semibold">{node.label}</span>
                      </div>
                      <StatusBadge status="warning" label="ISOLATED" pulse />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CyberPanel>

        </div>

        {/* Right Column: Execution Log & History */}
        <CyberPanel className="lg:col-span-7 xl:col-span-8 flex flex-col overflow-hidden gap-4 bg-black/40 backdrop-blur-2xl border-white/5 p-5" scanline glowColor="cyan">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10 flex-shrink-0">
            <Terminal className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Defensive Operations Log</h2>
          </div>
          <DefensiveLogTerminal operations={operations} />
        </CyberPanel>

      </div>
    </div>
  );
}
