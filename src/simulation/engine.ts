"use client";

import { useEffect, useRef } from 'react';
import { useSimulationStore, Threat } from '@/store/useSimulationStore';

export let sendToBackend: ((message: any) => void) | null = null;

export function useSimulationEngine() {
  const isSimulationRunning = useSimulationStore(state => state.isSimulationRunning);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: any;

    const connect = () => {
      if (!isSimulationRunning || wsRef.current) return;

      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;
      
      sendToBackend = (msg) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      };

      ws.onopen = () => {
        console.log("[Aetheris] Connected to Telemetry Stream");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const state = useSimulationStore.getState();
          
          switch(payload.type) {
            case 'SYSTEM_HEALTH':
              state.updateSystemHealth({
                cpu: payload.data.cpu,
                networkTraffic: payload.data.networkTraffic
              });
              break;
              
            case 'NEW_THREAT':
              state.addThreat(payload.data as Threat);
              state.updateNodeStatus(payload.data.targetNode, 'warning');
              break;
              
            case 'UPDATE_THREAT':
              state.updateThreatStatus(payload.data.id, payload.data.status, payload.data.action);
              const currentThreat = state.activeThreats.find(t => t.id === payload.data.id);
              if (currentThreat) {
                  if (payload.data.status === 'MITIGATING') {
                      state.updateNodeStatus(currentThreat.targetNode, 'isolated');
                  } else if (payload.data.status === 'RESOLVED') {
                      state.updateNodeStatus(currentThreat.targetNode, 'healthy');
                      state.setGlobalThreatScore(Math.max(12, state.globalThreatScore - 5));
                  }
              }
              break;

            case 'ORCHESTRATION_LOG':
              state.addOrchestrationLog(payload.data.envId, payload.data.log);
              break;
              
            case 'AI_REASONING_LOG':
              state.addAIThought({
                text: payload.data.text,
                type: payload.data.type
              });
              break;

            case 'ORCHESTRATION_STATUS':
              state.updateSandboxStatus(payload.data.envId, payload.data.status);
              break;

            case 'EBPF_LOG':
              state.addEBPFLog(payload.data.envId, payload.data);
              break;
          }
        } catch (e) {
          console.error("Error parsing telemetry payload", e);
        }
      };

      ws.onclose = () => {
        console.log("[Aetheris] Disconnected from Telemetry Stream. Reconnecting in 3s...");
        wsRef.current = null;
        sendToBackend = null;
        if (useSimulationStore.getState().isSimulationRunning) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
      
      ws.onerror = (err) => {
        console.error("[Aetheris] WebSocket error:", err);
        ws.close();
      };
    };

    if (isSimulationRunning) {
      connect();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        sendToBackend = null;
      }
      clearTimeout(reconnectTimeout);
    }

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        sendToBackend = null;
      }
    };
  }, [isSimulationRunning]);

  return null;
}
