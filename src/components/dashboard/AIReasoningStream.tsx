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
  const { incidentLog, systemHealth } = useSimulationStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Generate generic AI logs when no specific incidents occur
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLogs(prev => [
          ...prev.slice(-20), // Keep last 20
          {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString().substring(11, 19),
            text: `Analyzing network telemetry... CPU: ${systemHealth.cpu}%, Traffic: ${Math.round(systemHealth.networkTraffic)}Mbps. Status nominal.`,
            type: 'info'
          }
        ]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [systemHealth]);

  // Add logs based on actual incidents
  useEffect(() => {
    if (incidentLog.length > 0) {
      const latest = incidentLog[0];
      setLogs(prev => {
        // Prevent duplicate immediate logs for the same status change
        if (prev.length > 0 && prev[prev.length - 1].text.includes(latest.id)) return prev;

        let newLogs: LogEntry[] = [];
        const time = new Date().toISOString().substring(11, 19);

        if (latest.status === 'DETECTED') {
          newLogs.push({ id: Math.random().toString(), timestamp: time, text: `[${latest.id}] ANOMALY DETECTED: ${latest.type} from ${latest.sourceIp}`, type: 'warning' });
        } else if (latest.status === 'ANALYZING') {
          newLogs.push({ id: Math.random().toString(), timestamp: time, text: `[${latest.id}] AI CORRELATING EVENTS... Severity assessed as ${latest.severity}. Confidence: ${latest.confidence}%`, type: 'info' });
        } else if (latest.status === 'MITIGATING') {
          newLogs.push({ id: Math.random().toString(), timestamp: time, text: `[${latest.id}] INITIATING AUTONOMOUS RESPONSE: ${latest.mitigationAction}`, type: 'action' });
        } else if (latest.status === 'RESOLVED') {
          newLogs.push({ id: Math.random().toString(), timestamp: time, text: `[${latest.id}] THREAT NEUTRALIZED. System restored to normal parameters.`, type: 'success' });
        }

        return [...prev.slice(-20), ...newLogs];
      });
    }
  }, [incidentLog]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col font-mono text-xs p-2 bg-black/40 rounded-sm border border-white/5 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3 text-neon-magenta border-b border-white/10 pb-2">
        <Terminal className="w-4 h-4" />
        <span className="uppercase tracking-widest">Neural Link Active</span>
        <span className="ml-auto w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
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
