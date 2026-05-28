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
  globalThreatScore: number;
  activeThreats: Threat[];
  incidentLog: Threat[];
  networkNodes: Record<string, NetworkNode>;
  systemHealth: SystemHealth;
  isSimulationRunning: boolean;

  // Actions
  addThreat: (threat: Threat) => void;
  updateThreatStatus: (id: string, status: Threat['status'], mitigationAction?: string) => void;
  updateNodeStatus: (id: string, status: NetworkNode['status']) => void;
  updateSystemHealth: (health: Partial<SystemHealth>) => void;
  setGlobalThreatScore: (score: number) => void;
  toggleSimulation: () => void;
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
  networkNodes: initialNodes,
  systemHealth: {
    cpu: 24,
    memory: 45,
    networkTraffic: 850,
    activeSensors: 142,
    uptime: 0,
  },
  isSimulationRunning: true,

  addThreat: (threat) => set((state) => ({
    activeThreats: [threat, ...state.activeThreats],
    incidentLog: [threat, ...state.incidentLog],
    globalThreatScore: Math.min(100, state.globalThreatScore + (threat.severity === 'CRITICAL' ? 30 : threat.severity === 'HIGH' ? 20 : 10))
  })),

  updateThreatStatus: (id, status, mitigationAction) => set((state) => ({
    activeThreats: state.activeThreats.map(t => t.id === id ? { ...t, status, mitigationAction } : t).filter(t => status !== 'RESOLVED'),
    incidentLog: state.incidentLog.map(t => t.id === id ? { ...t, status, mitigationAction } : t)
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
  
  toggleSimulation: () => set((state) => ({ isSimulationRunning: !state.isSimulationRunning }))
}));
