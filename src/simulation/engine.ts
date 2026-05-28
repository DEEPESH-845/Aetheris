"use client";

import { useEffect, useRef } from 'react';
import { useSimulationStore, Threat } from '@/store/useSimulationStore';

const THREAT_TYPES = [
  'Ransomware Payload',
  'DDoS Attack',
  'SQL Injection',
  'Phishing Campaign',
  'Lateral Movement',
  'Zero-Day Exploit',
  'Credential Stuffing',
];

const MITIGATION_ACTIONS = [
  'ISOLATING COMPROMISED NODE',
  'REROUTING TRAFFIC THROUGH SCRUBBING CENTER',
  'DEPLOYING MICRO-SEGMENTATION',
  'REVOKING STOLEN CREDENTIALS',
  'QUARANTINING MALICIOUS PAYLOAD',
  'UPDATING FIREWALL RULES DYNAMICALLY'
];

export function useSimulationEngine() {
  const store = useSimulationStore();
  const engineRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!store.isSimulationRunning) {
      if (engineRef.current) clearInterval(engineRef.current);
      return;
    }

    // Engine Loop - Runs every second
    engineRef.current = setInterval(() => {
      // 1. Randomly generate new threats (low probability per tick)
      if (Math.random() < 0.05) { // 5% chance every second
        const nodes = Object.keys(store.networkNodes);
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
        const threatType = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
        
        const newThreat: Threat = {
          id: `TRT-${Math.floor(Math.random() * 10000)}`,
          type: threatType,
          sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x`,
          targetNode,
          severity: Math.random() > 0.8 ? 'CRITICAL' : Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
          timestamp: Date.now(),
          status: 'DETECTED'
        };

        store.addThreat(newThreat);
        store.updateNodeStatus(targetNode, 'warning');
      }

      // 2. Progress active threats
      const { activeThreats } = useSimulationStore.getState();
      activeThreats.forEach(threat => {
        if (threat.status === 'DETECTED') {
          // Move to analyzing after 2-4 seconds
          if (Date.now() - threat.timestamp > 2000 + Math.random() * 2000) {
            store.updateThreatStatus(threat.id, 'ANALYZING');
          }
        } else if (threat.status === 'ANALYZING') {
          // Move to mitigating
          if (Date.now() - threat.timestamp > 5000 + Math.random() * 3000) {
            const action = MITIGATION_ACTIONS[Math.floor(Math.random() * MITIGATION_ACTIONS.length)];
            store.updateThreatStatus(threat.id, 'MITIGATING', action);
            store.updateNodeStatus(threat.targetNode, 'isolated');
          }
        } else if (threat.status === 'MITIGATING') {
          // Move to resolved
          if (Date.now() - threat.timestamp > 9000 + Math.random() * 4000) {
            store.updateThreatStatus(threat.id, 'RESOLVED');
            store.updateNodeStatus(threat.targetNode, 'healthy');
            
            // Cool down global threat score slightly
            const currentScore = useSimulationStore.getState().globalThreatScore;
            store.setGlobalThreatScore(Math.max(12, currentScore - 5));
          }
        }
      });

      // 3. Fluctuate System Health
      store.updateSystemHealth({
        cpu: Math.min(100, Math.max(10, store.systemHealth.cpu + (Math.random() * 10 - 5))),
        networkTraffic: store.systemHealth.networkTraffic + (Math.random() * 100 - 50)
      });

    }, 1000);

    return () => {
      if (engineRef.current) clearInterval(engineRef.current);
    };
  }, [store.isSimulationRunning]);

  return null; // This is a headless hook, but we can mount it in DashboardLayout
}
