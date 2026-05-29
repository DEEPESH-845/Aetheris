"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, TelemetrySource } from '@/store/useSimulationStore';
import { Radio } from 'lucide-react';

const SOURCE_CONFIG: Record<TelemetrySource, { label: string; color: string; bg: string }> = {
  ZEEK:     { label: 'ZEEK',     color: 'text-neon-cyan',    bg: 'bg-neon-cyan/10 border-neon-cyan/30' },
  SURICATA: { label: 'SURICATA', color: 'text-neon-red',     bg: 'bg-neon-red/10 border-neon-red/30' },
  EBPF:     { label: 'eBPF',     color: 'text-neon-magenta', bg: 'bg-neon-magenta/10 border-neon-magenta/30' },
};

const SEVERITY_COLOR: Record<string, string> = {
  low:      'text-text-secondary',
  medium:   'text-yellow-400',
  high:     'text-orange-400',
  critical: 'text-neon-red font-bold',
};

export function TelemetryPacketFeed() {
  const telemetryEvents = useSimulationStore(state => state.telemetryEvents);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll only when near the bottom
  useEffect(() => {
    const el = bottomRef.current?.parentElement;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [telemetryEvents]);

  return (
    <div className="h-full flex flex-col font-mono text-[10px] bg-black/50 rounded-sm border border-white/5 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/60 flex-shrink-0">
        <div className="flex items-center gap-2 text-white/70">
          <Radio className="w-3 h-3 text-neon-cyan animate-pulse" />
          <span className="uppercase tracking-widest text-[10px]">Live Packet Feed</span>
        </div>
        <div className="flex items-center gap-3">
          {(['ZEEK', 'SURICATA', 'EBPF'] as TelemetrySource[]).map(src => (
            <span key={src} className={`text-[9px] px-1.5 py-0.5 rounded border ${SOURCE_CONFIG[src].bg} ${SOURCE_CONFIG[src].color} uppercase tracking-widest`}>
              {SOURCE_CONFIG[src].label}
            </span>
          ))}
        </div>
        <span className="text-[9px] text-text-muted font-mono">{telemetryEvents.length} events</span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-20 z-10" />

        <AnimatePresence initial={false}>
          {[...telemetryEvents].reverse().map((evt) => {
            const cfg = SOURCE_CONFIG[evt.source];
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex items-start gap-2 leading-relaxed py-0.5 border-b border-white/[0.03] group relative z-0`}
              >
                {/* Source tag */}
                <span className={`shrink-0 px-1 py-px rounded-sm border text-[8px] uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
                {/* Timestamp */}
                <span className="shrink-0 text-white/25 tabular-nums">
                  {new Date(evt.ts).toISOString().substring(11, 23)}
                </span>
                {/* Raw log line */}
                <span className={`break-all leading-tight ${SEVERITY_COLOR[evt.severity]}`}>
                  {evt.raw.replace(/^\[(ZEEK|SURICATA|eBPF)\]\s/, '')}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
