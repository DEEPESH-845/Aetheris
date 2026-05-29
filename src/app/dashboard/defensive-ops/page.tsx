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
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className={`relative bg-black/60 border rounded-sm p-4 space-y-4 overflow-hidden transition-colors ${op.status === 'EXECUTING' ? 'border-yellow-400/40' : op.status === 'SUCCESS' ? 'border-neon-green/20' : 'border-white/10'}`}
    >
      {/* Active Glow */}
      {(op.status === 'EXECUTING' || op.status === 'VERIFYING') && (
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[30px] pointer-events-none ${op.status === 'EXECUTING' ? 'bg-yellow-400/10' : 'bg-neon-cyan/10'}`} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sm border bg-black/40 ${op.status === 'SUCCESS' ? 'border-neon-green/30 text-neon-green' : `border-white/10 ${config.color}`}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">{op.id}</div>
            <div className="text-[10px] font-mono text-text-muted mt-0.5">{config.label}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-mono uppercase tracking-widest bg-black/40 ${statConfig.color} ${op.status === 'SUCCESS' ? 'border-neon-green/30' : 'border-white/10'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statConfig.dot}`} />
              {op.status}
           </span>
           <span className="text-[9px] font-mono text-text-muted">{uptimeStr}</span>
        </div>
      </div>

      {/* Target Info */}
      <div className="bg-black/40 border border-white/5 rounded-sm p-2 text-[10px] font-mono flex items-center justify-between z-10 relative">
        <span className="text-text-muted">Target:</span>
        <span className="text-white font-bold">{op.target}</span>
      </div>
      
      {/* Threat Association */}
      <div className="text-[9px] font-mono flex items-center justify-between text-text-muted z-10 relative">
        <span>Associated Threat:</span>
        <span className="text-neon-red">{op.threatId}</span>
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
    <div className="flex-1 overflow-y-auto bg-black/90 rounded-sm border border-white/5 p-3 font-mono text-[10px] space-y-1">
      {allLogs.length === 0 ? (
        <div className="flex items-center gap-2 text-text-muted opacity-50">
          <Terminal className="w-3 h-3" />
          <span>Awaiting autonomous operations...</span>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {allLogs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <span className="shrink-0 text-text-muted">
                {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 })}
              </span>
              <span className="shrink-0 text-neon-cyan/40">›</span>
              <span className={
                log.text.includes('SUCCESS') ? 'text-neon-green' :
                log.text.includes('EXEC') ? 'text-yellow-400' :
                log.text.includes('VERIFY') ? 'text-neon-cyan' :
                log.text.includes('FAIL') ? 'text-neon-red' :
                'text-text-secondary'
              }>{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
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
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
            <Shield className="w-8 h-8 text-neon-cyan" />
            AUTONOMOUS DEFENSIVE OPERATIONS
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">
            Real-time countermeasure deployment · Network quarantine · Threat neutralization
          </p>
        </div>
        <div className="flex gap-4 items-center bg-black/40 border border-white/5 rounded-sm p-3">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Active Ops</span>
             <span className="text-lg font-outfit font-bold text-yellow-400">{activeOps.length}</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Neutralized</span>
             <span className="text-lg font-outfit font-bold text-neon-green">{completedOps.length}</span>
           </div>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Column: Active Countermeasures & Quarantine */}
        <div className="lg:col-span-1 flex flex-col gap-6 min-h-0 overflow-y-auto">
          
          {/* Active Countermeasures */}
          <CyberPanel className="flex flex-col flex-shrink-0 gap-3" glowColor="cyan">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldAlert className="w-4 h-4 text-neon-cyan" />
              <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest">Active Countermeasures</h2>
            </div>
            <div className="space-y-3">
               {activeOps.length === 0 ? (
                 <div className="text-[10px] font-mono text-text-muted opacity-50 p-4 text-center border border-dashed border-white/10 rounded-sm">
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
          <CyberPanel className="flex flex-col flex-shrink-0 gap-3" glowColor="magenta">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Network className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest">Network Quarantine</h2>
              <span className="ml-auto text-[10px] font-mono text-orange-400">{isolatedNodes.length} Isolated</span>
            </div>
            <div className="space-y-2">
              {isolatedNodes.length === 0 ? (
                <div className="text-[10px] font-mono text-text-muted opacity-50 p-4 text-center">
                  No nodes currently isolated.
                </div>
              ) : (
                <AnimatePresence>
                  {isolatedNodes.map(node => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 bg-orange-400/5 border border-orange-400/20 rounded-sm"
                    >
                      <div className="flex items-center gap-2">
                        <XOctagon className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] font-mono text-white">{node.label}</span>
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
        <CyberPanel className="lg:col-span-2 flex flex-col overflow-hidden gap-3" scanline glowColor="cyan">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 flex-shrink-0">
            <Terminal className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest">Defensive Operations Log</h2>
          </div>
          <DefensiveLogTerminal operations={operations} />
        </CyberPanel>

      </div>
    </div>
  );
}
