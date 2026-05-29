"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, AIReasoningPhase } from '@/store/useSimulationStore';
import { Terminal, Brain, Zap, CheckCircle2, Loader2 } from 'lucide-react';

const PHASE_CONFIG: Record<AIReasoningPhase, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  INGEST:    { label: 'INGEST',    color: 'text-neon-cyan',    icon: <Terminal className="w-3 h-3" />,      description: 'Consuming Kafka telemetry streams' },
  ENRICH:    { label: 'ENRICH',    color: 'text-blue-400',     icon: <Zap className="w-3 h-3" />,           description: 'Querying Qdrant vector DB · GeoIP enrichment' },
  CORRELATE: { label: 'CORRELATE', color: 'text-neon-magenta', icon: <Brain className="w-3 h-3" />,         description: 'MITRE ATT&CK kill chain mapping' },
  DECIDE:    { label: 'DECIDE',    color: 'text-yellow-400',   icon: <Loader2 className="w-3 h-3 animate-spin" />, description: 'Formulating optimal countermeasure' },
  EXECUTE:   { label: 'EXECUTE',   color: 'text-neon-green',   icon: <CheckCircle2 className="w-3 h-3" />,  description: 'Deploying deception infrastructure' },
  IDLE:      { label: 'IDLE',      color: 'text-text-muted',   icon: <Terminal className="w-3 h-3" />,      description: 'Awaiting threat signal' },
};

const LOG_COLORS = {
  info:    'text-text-secondary',
  warning: 'text-yellow-400',
  action:  'text-neon-magenta font-semibold',
  success: 'text-neon-green',
};

export function AIReasoningStream() {
  const { aiThoughts, aiReasoningState } = useSimulationStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { currentPhase, isThinking, confidence, vectorDbHits, modelLatency } = aiReasoningState;
  const phaseCfg = PHASE_CONFIG[currentPhase];

  const phases: AIReasoningPhase[] = ['INGEST', 'ENRICH', 'CORRELATE', 'DECIDE', 'EXECUTE'];

  useEffect(() => {
    const el = bottomRef.current?.parentElement;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiThoughts]);

  return (
    <div className="h-full flex flex-col font-mono text-xs bg-black/40 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/60 flex-shrink-0">
        <Brain className="w-3.5 h-3.5 text-neon-magenta" />
        <span className="uppercase tracking-widest text-neon-magenta">Neural Link Active</span>
        <span className={`ml-auto w-2 h-2 rounded-full ${isThinking ? 'bg-neon-magenta animate-pulse' : 'bg-text-muted'}`} />
      </div>

      {/* LangGraph Phase Pipeline */}
      <div className="flex items-center gap-0 px-3 py-2 border-b border-white/5 bg-black/40 overflow-x-auto flex-shrink-0">
        {phases.map((phase, i) => {
          const cfg = PHASE_CONFIG[phase];
          const isActive = currentPhase === phase;
          const phaseIdx = phases.indexOf(currentPhase);
          const isPast = i < phaseIdx;
          return (
            <React.Fragment key={phase}>
              <motion.div
                animate={isActive ? { opacity: 1, scale: 1.05 } : { opacity: isPast ? 0.9 : 0.35, scale: 1 }}
                className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest whitespace-nowrap
                  ${isActive ? `${cfg.color} bg-white/5 border border-current` : isPast ? 'text-neon-green border border-neon-green/20 bg-neon-green/5' : 'text-text-muted'}`}
              >
                {isPast && !isActive ? <CheckCircle2 className="w-2.5 h-2.5" /> : cfg.icon}
                {phase}
              </motion.div>
              {i < phases.length - 1 && (
                <div className={`w-4 h-px shrink-0 ${isPast || isActive ? 'bg-neon-green/40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Phase description */}
      <AnimatePresence mode="wait">
        {currentPhase !== 'IDLE' && (
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between flex-shrink-0"
          >
            <span className={`text-[9px] uppercase tracking-widest ${phaseCfg.color}`}>
              {phaseCfg.description}
            </span>
            <div className="flex items-center gap-3 text-[9px] text-text-muted">
              <span>CONF <span className="text-white">{confidence}%</span></span>
              <span>RAG <span className="text-white">{vectorDbHits}</span></span>
              <span>LAT <span className="text-white">{modelLatency}ms</span></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thought log */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <AnimatePresence initial={false}>
          {aiThoughts.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 leading-relaxed ${LOG_COLORS[log.type]}`}
            >
              <span className="text-white/25 shrink-0 tabular-nums">[{log.timestamp}]</span>
              <span className="break-words">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10" />
    </div>
  );
}
