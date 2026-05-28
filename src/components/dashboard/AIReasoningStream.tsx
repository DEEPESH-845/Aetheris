"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'warning' | 'action' | 'success';
}

export function AIReasoningStream() {
  const { aiThoughts, systemHealth } = useSimulationStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiThoughts]);

  return (
    <div className="h-full flex flex-col font-mono text-xs p-2 bg-black/40 rounded-sm border border-white/5 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3 text-neon-magenta border-b border-white/10 pb-2">
        <Terminal className="w-4 h-4" />
        <span className="uppercase tracking-widest">Neural Link Active</span>
        <span className="ml-auto w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        <AnimatePresence initial={false}>
          {aiThoughts.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 leading-relaxed
                ${log.type === 'info' ? 'text-text-secondary' : ''}
                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                ${log.type === 'action' ? 'text-neon-purple font-bold' : ''}
                ${log.type === 'success' ? 'text-neon-green' : ''}
              `}
            >
              <span className="text-white/30 shrink-0">[{log.timestamp}]</span>
              <span className="break-words">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />
    </div>
  );
}
