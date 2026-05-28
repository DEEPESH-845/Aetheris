"use client";

import React from 'react';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import { ShieldAlert, Crosshair, Zap, Database } from 'lucide-react';
import { useSimulationStore, ThreatLevel } from '@/store/useSimulationStore';
import { StatusBadge } from '@/components/core/StatusBadge';

const attackVectors = [
  { id: 'ransomware', name: 'Ransomware Outbreak', type: 'Ransomware', severity: 'CRITICAL', icon: ShieldAlert },
  { id: 'phishing', name: 'Spear Phishing', type: 'Phishing', severity: 'HIGH', icon: Crosshair },
  { id: 'ddos', name: 'DDoS Attack', type: 'DDoS', severity: 'MEDIUM', icon: Zap },
  { id: 'sqli', name: 'SQL Injection', type: 'Database Breach', severity: 'CRITICAL', icon: Database },
];

export default function SandboxPage() {
  const { addThreat, networkNodes, updateNodeStatus, isSimulationRunning, toggleSimulation } = useSimulationStore();
  const nodesList = Object.keys(networkNodes);

  const triggerAttack = (type: string, severity: ThreatLevel) => {
    if (nodesList.length === 0) return;
    
    // Pick a random target node
    const targetNode = nodesList[Math.floor(Math.random() * nodesList.length)];
    
    addThreat({
      id: `SIM-${Math.floor(Math.random() * 10000)}`,
      type,
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetNode,
      severity,
      confidence: 100, // Simulation is 100% confident
      timestamp: Date.now(),
      status: 'DETECTED'
    });

    updateNodeStatus(targetNode, 'compromised');
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
          <Database className="w-8 h-8 text-neon-cyan" />
          SANDBOX ATTACK SIMULATOR
        </h1>
        <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Manually trigger threat vectors to test AI autonomous response.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <CyberButton 
          variant={isSimulationRunning ? "danger" : "primary"} 
          onClick={toggleSimulation}
        >
          {isSimulationRunning ? "HALT BACKGROUND SIMULATION" : "RESUME BACKGROUND SIMULATION"}
        </CyberButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {attackVectors.map((attack) => {
          const Icon = attack.icon;
          return (
            <CyberPanel key={attack.id} variant="outline" className="flex flex-col h-full group" scanline>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-black/40 border border-white/10 rounded-sm">
                  <Icon className={`w-6 h-6 ${attack.severity === 'CRITICAL' ? 'text-neon-red' : 'text-neon-cyan'}`} />
                </div>
                <StatusBadge 
                  status={attack.severity === 'CRITICAL' ? 'critical' : attack.severity === 'HIGH' ? 'warning' : 'active'} 
                  label={attack.severity} 
                  pulse={false}
                />
              </div>
              
              <h3 className="text-lg font-outfit font-bold text-white mb-1">{attack.name}</h3>
              <p className="text-xs font-mono text-text-secondary mb-6 flex-1">
                Triggers a simulated {attack.name.toLowerCase()} targeting a random network node.
              </p>

              <CyberButton 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => triggerAttack(attack.type, attack.severity as ThreatLevel)}
              >
                <span>DEPLOY ATTACK</span>
                <Crosshair className="w-4 h-4 text-neon-magenta group-hover:animate-ping" />
              </CyberButton>
            </CyberPanel>
          );
        })}
      </div>
      
      <CyberPanel className="mt-8">
         <h2 className="text-lg font-outfit font-bold text-white mb-4 border-b border-white/10 pb-2">Simulator Instructions</h2>
         <ul className="space-y-2 text-sm font-mono text-text-secondary">
           <li><span className="text-neon-cyan">1.</span> Select an attack vector from the panel above.</li>
           <li><span className="text-neon-cyan">2.</span> Watch the global Threat Score increase.</li>
           <li><span className="text-neon-cyan">3.</span> Switch to the Command Center to watch the AI Reasoning Stream analyze the threat in real-time.</li>
           <li><span className="text-neon-cyan">4.</span> Observe the Network Topology map update as the target node becomes compromised, then isolated.</li>
         </ul>
      </CyberPanel>
    </div>
  );
}
