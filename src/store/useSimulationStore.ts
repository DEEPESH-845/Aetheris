import { create } from 'zustand';

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Threat {
  id: string;
  type: string; // e.g. "Ransomware", "DDoS", "Phishing"
  sourceIp: string;
  targetNode: string;
  severity: ThreatLevel;
  confidence: number;
  timestamp: number;
  status: 'DETECTED' | 'ANALYZING' | 'MITIGATING' | 'RESOLVED';
  mitigationAction?: string;
}

export interface AIThought {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'warning' | 'action' | 'success';
}

export interface SandboxEnvironment {
  id: string;
  status: 'PROVISIONING' | 'ONLINE' | 'DESTROYED';
  logs: string[];
  ebpfLogs: any[];
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'server' | 'database' | 'endpoint' | 'firewall' | 'cloud';
  status: 'healthy' | 'warning' | 'compromised' | 'isolated';
  cpuUsage: number;
  memoryUsage: number;
  connections: string[]; // IDs of connected nodes
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  networkTraffic: number; // Mbps
  activeSensors: number;
  uptime: number; // seconds
}

interface SimulationState {
  isSimulationRunning: boolean;
  globalThreatScore: number;
  networkNodes: Record<string, NetworkNode>;
  activeThreats: Threat[];
  incidentLog: Threat[];
  aiThoughts: AIThought[];
  sandboxEnvironments: Record<string, SandboxEnvironment>;
  systemHealth: {
    cpu: number;
    networkTraffic: number;
  };
  
  toggleSimulation: () => void;
  setGlobalThreatScore: (score: number) => void;
  updateSystemHealth: (health: { cpu: number; networkTraffic: number }) => void;
  updateNodeStatus: (nodeId: string, status: NetworkNode['status']) => void;
  addThreat: (threat: Threat) => void;
  updateThreatStatus: (id: string, status: Threat['status'], mitigationAction?: string) => void;
  addAIThought: (thought: Omit<AIThought, 'id' | 'timestamp'>) => void;
  initSandboxEnvironment: (envId: string) => void;
  addOrchestrationLog: (envId: string, log: string) => void;
  updateSandboxStatus: (envId: string, status: SandboxEnvironment['status']) => void;
  addEBPFLog: (envId: string, log: any) => void;
}

// Initial mock network
const initialNodes: Record<string, NetworkNode> = {
  'fw-1': { id: 'fw-1', label: 'Edge Firewall', type: 'firewall', status: 'healthy', cpuUsage: 12, memoryUsage: 45, connections: ['web-cluster-1'] },
  'web-cluster-1': { id: 'web-cluster-1', label: 'Web Cluster', type: 'server', status: 'healthy', cpuUsage: 65, memoryUsage: 80, connections: ['db-main', 'internal-api'] },
  'db-main': { id: 'db-main', label: 'Main Database', type: 'database', status: 'healthy', cpuUsage: 35, memoryUsage: 90, connections: [] },
  'internal-api': { id: 'internal-api', label: 'Internal API', type: 'server', status: 'healthy', cpuUsage: 25, memoryUsage: 40, connections: ['cloud-storage'] },
  'cloud-storage': { id: 'cloud-storage', label: 'Cloud Blob Storage', type: 'cloud', status: 'healthy', cpuUsage: 5, memoryUsage: 10, connections: [] },
};

export const useSimulationStore = create<SimulationState>((set) => ({
  globalThreatScore: 12,
  activeThreats: [],
  incidentLog: [],
  aiThoughts: [],
  networkNodes: initialNodes,
  isSimulationRunning: true,
  systemHealth: {
    cpu: 40,
    networkTraffic: 200,
  },
  sandboxEnvironments: {
    'PROD-ORCHESTRATOR': {
      id: 'PROD-ORCHESTRATOR',
      status: 'ONLINE',
      logs: ['[SYSTEM] Autonomous Orchestration Engine Online.', '[SYSTEM] Standing by for AI mitigation commands...'],
      ebpfLogs: []
    }
  },

  addThreat: (threat) => set((state) => ({
    activeThreats: [threat, ...state.activeThreats],
    incidentLog: [threat, ...state.incidentLog],
    globalThreatScore: Math.min(100, state.globalThreatScore + (threat.severity === 'CRITICAL' ? 30 : threat.severity === 'HIGH' ? 20 : 10))
  })),

  updateThreatStatus: (id, status, mitigationAction) => set((state) => {
    const existing = state.activeThreats.find(t => t.id === id);
    if (!existing) return state;
    
    const updatedThreat = { ...existing, status, mitigationAction };
    
    return {
      activeThreats: state.activeThreats.map(t => t.id === id ? updatedThreat : t).filter(t => t.status !== 'RESOLVED'),
      incidentLog: state.incidentLog.map(t => t.id === id ? updatedThreat : t)
    };
  }),

  addAIThought: (thought) => set((state) => ({
    aiThoughts: [
      ...state.aiThoughts.slice(-49), // Keep last 50 thoughts
      {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString().substring(11, 19),
        ...thought
      }
    ]
  })),

  updateNodeStatus: (id, status) => set((state) => ({
    networkNodes: {
      ...state.networkNodes,
      [id]: { ...state.networkNodes[id], status }
    }
  })),

  updateSystemHealth: (health) => set((state) => ({
    systemHealth: { ...state.systemHealth, ...health }
  })),

  setGlobalThreatScore: (score) => set({ globalThreatScore: score }),
  
  toggleSimulation: () => set((state) => ({ isSimulationRunning: !state.isSimulationRunning })),

  initSandboxEnvironment: (envId) => set((state) => ({
    sandboxEnvironments: {
      ...state.sandboxEnvironments,
      [envId]: { id: envId, status: 'PROVISIONING', logs: [], ebpfLogs: [] }
    }
  })),

  addOrchestrationLog: (envId, log) => set((state) => {
    const env = state.sandboxEnvironments[envId];
    if (!env) return state;
    return {
      sandboxEnvironments: {
        ...state.sandboxEnvironments,
        [envId]: { ...env, logs: [...env.logs, log] }
      }
    };
  }),

  updateSandboxStatus: (envId, status) => set((state) => {
    const env = state.sandboxEnvironments[envId];
    if (!env) return state;
    return {
      sandboxEnvironments: {
        ...state.sandboxEnvironments,
        [envId]: { ...env, status }
      }
    };
  }),

  addEBPFLog: (envId, log) => set((state) => {
    const env = state.sandboxEnvironments[envId];
    if (!env) return state;
    return {
      sandboxEnvironments: {
        ...state.sandboxEnvironments,
        [envId]: { ...env, ebpfLogs: [log, ...env.ebpfLogs].slice(0, 100) }
      }
    };
  }),
}));
