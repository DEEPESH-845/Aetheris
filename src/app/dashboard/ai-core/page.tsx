"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, AIReasoningPhase, MitreTTP } from '@/store/useSimulationStore';
import { CyberPanel } from '@/components/core/CyberPanel';
import { AIReasoningStream } from '@/components/dashboard/AIReasoningStream';
import { AttackerProfilePanel } from '@/components/dashboard/AttackerProfilePanel';
import { Brain, GitBranch, Database, Cpu, Zap, Activity } from 'lucide-react';

// ─── MITRE ATT&CK Matrix Component ──────────────────────────────────────────
const TACTIC_COLORS: Record<string, string> = {
  'Reconnaissance':       'border-gray-500/40 text-gray-400 bg-gray-500/5',
  'Initial Access':       'border-red-500/40 text-red-400 bg-red-500/5',
  'Execution':            'border-orange-500/40 text-orange-400 bg-orange-500/5',
  'Persistence':          'border-yellow-500/40 text-yellow-400 bg-yellow-500/5',
  'Privilege Escalation': 'border-amber-500/40 text-amber-400 bg-amber-500/5',
  'Defense Evasion':      'border-purple-500/40 text-purple-400 bg-purple-500/5',
  'Credential Access':    'border-pink-500/40 text-pink-400 bg-pink-500/5',
  'Discovery':            'border-blue-500/40 text-blue-400 bg-blue-500/5',
  'Lateral Movement':     'border-cyan-500/40 text-cyan-400 bg-cyan-500/5',
  'Collection':           'border-teal-500/40 text-teal-400 bg-teal-500/5',
  'Command & Control':    'border-indigo-500/40 text-indigo-400 bg-indigo-500/5',
  'Exfiltration':         'border-neon-red/40 text-neon-red bg-neon-red/5',
};

function MitreTTPCard({ ttp }: { ttp: MitreTTP }) {
  const color = TACTIC_COLORS[ttp.tactic] ?? 'border-white/10 text-white/60 bg-white/5';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className={`border rounded-lg p-3 space-y-2 ${color} ${ttp.observed ? 'backdrop-blur-md shadow-lg shadow-black/20' : 'opacity-30 grayscale'} relative overflow-hidden group`}
    >
      {ttp.observed && (
        <>
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
        </>
      )}
      <div className="text-[9px] font-mono opacity-80 uppercase tracking-widest">{ttp.technique}</div>
      <div className="text-[11px] font-outfit font-semibold leading-tight text-white">{ttp.name}</div>
      <div className="text-[9px] opacity-60 font-mono">{ttp.tactic}</div>
      {ttp.observed && (
        <div className="h-1 bg-black/40 rounded-full overflow-hidden mt-2 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ttp.confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-current rounded-full relative z-10"
          />
          <div className="absolute inset-0 bg-current opacity-20 blur-sm" />
        </div>
      )}
    </motion.div>
  );
}

// ─── LangGraph Visual State Machine ──────────────────────────────────────────
const GRAPH_PHASES: { id: AIReasoningPhase; label: string; description: string }[] = [
  { id: 'INGEST',    label: 'IngestTelemetry',     description: 'Kafka Consumer → Zeek/Suricata/eBPF' },
  { id: 'ENRICH',    label: 'EnrichContext',        description: 'Qdrant RAG · GeoIP · ASN Lookup' },
  { id: 'CORRELATE', label: 'CorrelateKillChain',   description: 'MITRE ATT&CK Mapping · Clustering' },
  { id: 'DECIDE',    label: 'FormulateMitigation',  description: 'Strategy scoring · Policy evaluation' },
  { id: 'EXECUTE',   label: 'ExecuteDeception',     description: 'eBPF Redirect · Honey Deploy · IOC Extract' },
];

function LangGraphVisualizer() {
  const { aiReasoningState } = useSimulationStore();
  const { currentPhase, isThinking, confidence, vectorDbHits, modelLatency } = aiReasoningState;
  const currentIdx = GRAPH_PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-magenta/5 rounded-full blur-[80px] pointer-events-none" />

      {/* vLLM stats bar */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        {[
          { label: 'Model Confidence', value: `${confidence}%`, icon: <Zap className="w-3.5 h-3.5" />, color: 'text-neon-cyan' },
          { label: 'RAG Retrievals', value: vectorDbHits, icon: <Database className="w-3.5 h-3.5" />, color: 'text-neon-magenta' },
          { label: 'Inference Latency', value: `${modelLatency}ms`, icon: <Cpu className="w-3.5 h-3.5" />, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 text-center group hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-text-muted mb-2 uppercase tracking-widest">
              {stat.icon} {stat.label}
            </div>
            <div className={`text-2xl font-outfit font-bold tabular-nums drop-shadow-[0_0_8px_currentColor] ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* State Machine Graph */}
      <div className="relative pl-2 py-4">
        {/* Connecting line */}
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-white/5 z-0" />
        <div className="space-y-4 relative z-10">
          {GRAPH_PHASES.map((phase, i) => {
            const isActive = currentPhase === phase.id;
            const isPast = currentIdx > i && currentPhase !== 'IDLE';
            return (
              <motion.div
                key={phase.id}
                animate={isActive ? { x: 8, scale: 1.02 } : { x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex items-center gap-5 p-4 rounded-xl border backdrop-blur-md transition-all duration-500 relative overflow-hidden ${
                  isActive
                    ? 'bg-neon-magenta/10 border-neon-magenta/30 shadow-[0_0_30px_rgba(255,0,255,0.1)]'
                    : isPast
                    ? 'bg-neon-green/5 border-neon-green/20'
                    : 'bg-black/40 border-white/5 opacity-60'
                }`}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta/5 to-transparent pointer-events-none" />}
                
                {/* Node circle */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 relative z-10 transition-colors duration-500 ${
                  isActive ? 'border-neon-magenta bg-neon-magenta/20' :
                  isPast ? 'border-neon-green bg-neon-green/10' : 'border-white/10 bg-black/40'
                }`}>
                  {isActive && isThinking
                    ? <span className="w-3 h-3 bg-neon-magenta rounded-full animate-ping" />
                    : isPast
                    ? <span className="w-3 h-3 bg-neon-green rounded-full shadow-[0_0_10px_rgba(0,255,100,0.5)]" />
                    : <span className="w-2 h-2 bg-white/20 rounded-full" />
                  }
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                  <div className={`text-sm font-outfit font-bold tracking-wide transition-colors duration-500 ${isActive ? 'text-neon-magenta' : isPast ? 'text-neon-green' : 'text-text-muted'}`}>
                    {phase.label}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted truncate mt-0.5">{phase.description}</div>
                </div>
                
                {isActive && (
                  <div className="text-[9px] font-mono text-neon-magenta uppercase tracking-widest shrink-0 animate-pulse bg-neon-magenta/10 px-2 py-1 rounded-sm border border-neon-magenta/20">
                    ACTIVE
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main AI Core Page ────────────────────────────────────────────────────────
export default function AICorePagePage() {
  const { attackerProfiles, aiReasoningState } = useSimulationStore();
  const profiles = Object.values(attackerProfiles);
  const allTtps = profiles.flatMap(p => p.ttps);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <header className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/20 rounded-xl">
            <Brain className="w-8 h-8 text-neon-magenta" />
          </div>
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-wide">AI REASONING CORE</h1>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest mt-1">
              LangGraph · vLLM · Qdrant RAG · MITRE ATT&CK Correlation
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Col 1: LangGraph State Machine */}
        <CyberPanel className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto bg-black/40 backdrop-blur-2xl border-white/5" glowColor="magenta">
          <div className="flex items-center gap-2 text-neon-magenta font-mono text-xs uppercase tracking-widest border-b border-white/10 pb-4 mb-2 flex-shrink-0">
            <GitBranch className="w-4 h-4" />
            LangGraph State Machine
          </div>
          <LangGraphVisualizer />
        </CyberPanel>

        {/* Col 2: MITRE ATT&CK TTP Matrix */}
        <CyberPanel className="lg:col-span-4 flex flex-col overflow-hidden bg-black/40 backdrop-blur-2xl border-white/5" glowColor="cyan">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              MITRE Correlation
            </div>
            <span className="text-[10px] font-mono bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded-sm border border-neon-cyan/20">
              {allTtps.filter(t => t.observed).length} OBSERVED
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {allTtps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
                <Activity className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Awaiting threat analysis…</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {allTtps.map((ttp, i) => (
                    <MitreTTPCard key={`${ttp.technique}-${i}`} ttp={ttp} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CyberPanel>

        {/* Col 3: Attacker Profile + AI Stream */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          <CyberPanel className="flex-1 p-0 overflow-hidden bg-black/40 backdrop-blur-2xl border-white/5" glowColor="none">
            <AttackerProfilePanel />
          </CyberPanel>
          <CyberPanel className="h-[280px] p-0 overflow-hidden bg-black/40 backdrop-blur-2xl border-white/5" glowColor="magenta">
            <AIReasoningStream />
          </CyberPanel>
        </div>
      </div>
    </div>
  );
}
