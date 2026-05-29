"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion } from 'framer-motion';
import { Layers, Wifi, Eye, Cpu, Shield } from 'lucide-react';

interface MetricPillProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'ok' | 'warn' | 'critical' | 'active';
}

function MetricPill({ icon, label, value, unit, status = 'ok' }: MetricPillProps) {
  const statusColors = {
    ok:       'border-white/10 text-text-secondary',
    warn:     'border-yellow-500/30 text-yellow-400',
    critical: 'border-neon-red/40 text-neon-red',
    active:   'border-neon-magenta/40 text-neon-magenta',
  };

  const dotColors = {
    ok:       'bg-neon-green',
    warn:     'bg-yellow-400',
    critical: 'bg-neon-red animate-ping',
    active:   'bg-neon-magenta animate-pulse',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border bg-black/40 ${statusColors[status]} text-[10px] font-mono`}>
      <span className="text-white/40">{icon}</span>
      <span className="uppercase tracking-widest text-white/40">{label}</span>
      <span className="tabular-nums font-bold text-[11px]">
        {value}
        {unit && <span className="text-white/30 ml-0.5">{unit}</span>}
      </span>
      <span className={`relative flex h-1.5 w-1.5 ml-1 rounded-full ${dotColors[status]}`} />
    </div>
  );
}

export function PipelineStatusBar() {
  const { pipelineHealth, isSimulationRunning } = useSimulationStore();

  const kafkaStatus = pipelineHealth.kafkaLag > 500 ? 'critical' : pipelineHealth.kafkaLag > 100 ? 'warn' : 'ok';
  const deceptionStatus = pipelineHealth.deceptionEngineStatus === 'ENGAGING' ? 'active' : 'ok';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 flex-wrap border border-white/5 bg-black/60 backdrop-blur-xl rounded-sm px-4 py-2 relative overflow-hidden"
    >
      {/* Ambient scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />

      {/* System indicator */}
      <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-neon-cyan/60 border-r border-white/10 pr-3 mr-1">
        <span className={`w-1.5 h-1.5 rounded-full ${isSimulationRunning ? 'bg-neon-green animate-pulse' : 'bg-text-muted'}`} />
        PIPELINE STATUS
      </div>

      <MetricPill
        icon={<Layers className="w-3 h-3" />}
        label="Kafka Lag"
        value={pipelineHealth.kafkaLag}
        unit="msg"
        status={kafkaStatus}
      />
      <MetricPill
        icon={<Wifi className="w-3 h-3" />}
        label="Zeek"
        value={pipelineHealth.zeekHeartbeat}
        unit="ms"
        status={pipelineHealth.zeekHeartbeat > 100 ? 'warn' : 'ok'}
      />
      <MetricPill
        icon={<Eye className="w-3 h-3" />}
        label="Suricata"
        value={pipelineHealth.suricataEventsPerSec}
        unit="evt/s"
        status="ok"
      />
      <MetricPill
        icon={<Cpu className="w-3 h-3" />}
        label="eBPF Probes"
        value={pipelineHealth.ebpfProbes}
        status="ok"
      />

      {/* Deception engine status — always rightmost */}
      <div className="ml-auto">
        <MetricPill
          icon={<Shield className="w-3 h-3" />}
          label="Deception Engine"
          value={pipelineHealth.deceptionEngineStatus}
          status={deceptionStatus}
        />
      </div>
    </motion.div>
  );
}
