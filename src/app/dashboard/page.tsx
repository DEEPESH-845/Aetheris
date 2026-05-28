"use client";

import { CyberPanel } from "@/components/core/CyberPanel";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Activity, ShieldAlert, Zap, Server } from "lucide-react";
import { ThreatScoreChart } from "@/components/visualization/ThreatScoreChart";
import { NetworkTrafficChart } from "@/components/visualization/NetworkTrafficChart";
import { ActiveThreatsList } from "@/components/dashboard/ActiveThreatsList";
import { AIReasoningStream } from "@/components/dashboard/AIReasoningStream";
import { NetworkTopology } from "@/components/visualization/NetworkTopology";

export default function DashboardPage() {
  const { globalThreatScore, activeThreats, systemHealth } = useSimulationStore();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-outfit font-bold text-white mb-1 tracking-wide">COMMAND CENTER</h1>
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">Autonomous Multimodal AI Defense System // Live Telemetry</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <CyberPanel variant="interactive" glowColor={globalThreatScore > 75 ? 'red' : 'cyan'} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase">
            <ShieldAlert className="w-4 h-4" />
            Global Threat Level
          </div>
          <div className="text-4xl font-bold font-outfit text-white flex items-end gap-2">
            {globalThreatScore}<span className="text-lg text-text-secondary font-mono pb-1">/100</span>
          </div>
          <div className="h-16 mt-2 -mx-4 -mb-4 opacity-70">
            <ThreatScoreChart />
          </div>
        </CyberPanel>

        <CyberPanel variant="interactive" glowColor="magenta" className="flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase">
            <Activity className="w-4 h-4" />
            Active Incidents
          </div>
          <div className="text-4xl font-bold font-outfit text-white">
            {activeThreats.length}
          </div>
          {activeThreats.length > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-neon-magenta/20 blur-xl rounded-full" />
          )}
        </CyberPanel>

        <CyberPanel variant="interactive" glowColor="cyan" className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase">
            <Server className="w-4 h-4" />
            Network Traffic
          </div>
          <div className="text-4xl font-bold font-outfit text-white flex items-end gap-2">
            {Math.round(systemHealth.networkTraffic)} <span className="text-lg text-text-secondary font-mono pb-1">Mbps</span>
          </div>
          <div className="h-16 mt-2 -mx-4 -mb-4 opacity-50">
            <NetworkTrafficChart />
          </div>
        </CyberPanel>

        <CyberPanel variant="interactive" glowColor="purple" className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase">
            <Zap className="w-4 h-4" />
            AI Confidence
          </div>
          <div className="text-4xl font-bold font-outfit text-white flex items-end gap-2">
            94.2<span className="text-lg text-text-secondary font-mono pb-1">%</span>
          </div>
        </CyberPanel>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Left Column: Network Map & Active Threats */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0 min-h-0">
          <CyberPanel className="flex-1 min-h-[300px] p-0 overflow-hidden" scanline glowColor="cyan">
            <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
              <h2 className="text-sm font-mono text-neon-cyan uppercase">Network Topology Visualization</h2>
              <span className="text-[10px] font-mono text-neon-cyan/70 bg-neon-cyan/10 px-2 py-1 rounded-sm border border-neon-cyan/30">LIVE FEED</span>
            </div>
            <NetworkTopology />
          </CyberPanel>
        </div>

        {/* Right Column: Reasoning Stream & Threat List */}
        <div className="flex flex-col gap-6 min-w-0 min-h-0">
          <CyberPanel className="flex-[2]" glowColor="none">
            <h2 className="text-sm font-mono text-white uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-magenta" /> 
              Active Threats
            </h2>
            <div className="h-[calc(100%-40px)]">
               <ActiveThreatsList />
            </div>
          </CyberPanel>

          <CyberPanel className="flex-[3] p-0 overflow-hidden" glowColor="magenta">
            <AIReasoningStream />
          </CyberPanel>
        </div>
      </div>
    </div>
  );
}
