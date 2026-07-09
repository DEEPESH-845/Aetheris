"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Shield, Activity } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { CyberPanel } from "@/components/core/CyberPanel";
import { ThreatScoreChart } from "@/components/visualization/ThreatScoreChart";
import { NetworkTrafficChart } from "@/components/visualization/NetworkTrafficChart";

export default function AnalyticsPage() {
  const { incidentLog, activeThreats, aiThoughts, globalThreatScore } = useSimulationStore();

  const totalIncidents = incidentLog.length;
  const criticalCount = incidentLog.filter((t) => t.severity === "CRITICAL").length;
  const highCount = incidentLog.filter((t) => t.severity === "HIGH").length;
  const resolvedCount = incidentLog.filter((t) => t.status === "RESOLVED").length;
  const avgConfidence = totalIncidents > 0
    ? Math.round(incidentLog.reduce((acc, t) => acc + t.confidence, 0) / totalIncidents)
    : 0;

  const stats = [
    { label: "Total Incidents", value: totalIncidents, icon: Shield, color: "text-neon-cyan" },
    { label: "Critical Threats", value: criticalCount, icon: TrendingUp, color: "text-neon-red" },
    { label: "High Threats", value: highCount, icon: Activity, color: "text-yellow-400" },
    { label: "Resolved", value: resolvedCount, icon: Shield, color: "text-neon-green" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white">Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Threat trends and platform usage metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <CyberPanel className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-text-muted text-[10px] font-mono uppercase">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CyberPanel>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CyberPanel className="p-4">
          <h3 className="font-outfit font-bold text-white text-sm mb-3">Threat Score Over Time</h3>
          <ThreatScoreChart />
        </CyberPanel>
        <CyberPanel className="p-4">
          <h3 className="font-outfit font-bold text-white text-sm mb-3">Network Traffic</h3>
          <NetworkTrafficChart />
        </CyberPanel>
      </div>

      {/* AI Performance */}
      <CyberPanel className="p-6">
        <h3 className="font-outfit font-bold text-white mb-4">AI Reasoning Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/40 border border-white/10 rounded-sm p-4 text-center">
            <p className="text-text-muted text-[10px] font-mono uppercase">Avg Confidence</p>
            <p className="text-2xl font-bold text-neon-cyan mt-1">{avgConfidence}%</p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-sm p-4 text-center">
            <p className="text-text-muted text-[10px] font-mono uppercase">Active Threats</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{activeThreats.length}</p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-sm p-4 text-center">
            <p className="text-text-muted text-[10px] font-mono uppercase">AI Thoughts</p>
            <p className="text-2xl font-bold text-neon-purple mt-1">{aiThoughts.length}</p>
          </div>
        </div>
      </CyberPanel>
    </div>
  );
}
