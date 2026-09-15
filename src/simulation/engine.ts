"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSimulationStore, type Threat } from '@/store/useSimulationStore';
import { seedFirstIncident, startGenerator, stopGenerator } from './generator';

/**
 * Drives the dashboard: the local generator runs whenever the simulation is on and no live
 * backend is connected. A backend (NEXT_PUBLIC_BACKEND_WS_URL) suspends the generator while
 * connected; on close the generator resumes immediately and the socket reconnects with backoff.
 */
export function useSimulationEngine() {
  const isSimulationRunning = useSimulationStore(state => state.isSimulationRunning);
  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isSimulationRunning) {
      stopGenerator();
      return;
    }
    const seedTimer = setTimeout(seedFirstIncident, 2500);
    startGenerator();
    return () => {
      clearTimeout(seedTimer);
      stopGenerator();
    };
  }, [isSimulationRunning]);

  // ── WebSocket Client (connects to real backend when available) ──
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const connect = async () => {
      if (!isSimulationRunning || wsRef.current) return;

      // No backend configured: stay on the local generator instead of retrying a dead socket every 3s.
      const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
      if (!wsUrl) return;

      const token = await getToken();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        ws.send(JSON.stringify({ type: "AUTH", token }));
        console.log("[Aetheris] Connected to Live Telemetry Stream - local generator suspended.");
        stopGenerator();
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const st = useSimulationStore.getState();
          
          switch(payload.type) {
            case 'SYSTEM_HEALTH':
              st.updateSystemHealth({ cpu: payload.data.cpu, networkTraffic: payload.data.networkTraffic });
              break;
            case 'NEW_THREAT':
              st.addThreat(payload.data as Threat);
              st.updateNodeStatus(payload.data.targetNode, 'warning');
              break;
            case 'UPDATE_THREAT':
              st.updateThreatStatus(payload.data.id, payload.data.status, payload.data.action);
              const currentThreat = st.activeThreats.find(t => t.id === payload.data.id);
              if (currentThreat) {
                if (payload.data.status === 'MITIGATING') {
                  st.updateNodeStatus(currentThreat.targetNode, 'redirected');
                } else if (payload.data.status === 'RESOLVED') {
                  st.updateNodeStatus(currentThreat.targetNode, 'healthy');
                  st.setGlobalThreatScore(Math.max(12, st.globalThreatScore - 5));
                }
              }
              break;
            case 'ORCHESTRATION_LOG':
              st.addOrchestrationLog(payload.data.envId, payload.data.log);
              break;
            case 'AI_REASONING_LOG':
              st.addAIThought({ text: payload.data.text, type: payload.data.type });
              break;
            case 'ORCHESTRATION_STATUS':
              st.updateSandboxStatus(payload.data.envId, payload.data.status);
              break;
            case 'EBPF_LOG':
              st.addEBPFLog(payload.data.envId, payload.data);
              break;
            case 'TELEMETRY_EVENT':
              st.addTelemetryEvent(payload.data);
              break;
            case 'PIPELINE_HEALTH':
              st.updatePipelineHealth(payload.data);
              break;
          }
        } catch (e) {
          console.error("[Aetheris] Error parsing telemetry payload", e);
        }
      };

      ws.onclose = () => {
        console.log("[Aetheris] Disconnected from Telemetry Stream - local generator resuming.");
        wsRef.current = null;
        if (useSimulationStore.getState().isSimulationRunning) {
          startGenerator();
          reconnectTimeout = setTimeout(connect, Math.min(30_000, 3000 * 2 ** attempt++));
        }
      };
      
      ws.onerror = () => ws.close();
    };

    if (isSimulationRunning) {
      connect();
    } else {
      wsRef.current?.close();
      wsRef.current = null;
      clearTimeout(reconnectTimeout);
    }

    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [isSimulationRunning, getToken]);

  return null;
}

