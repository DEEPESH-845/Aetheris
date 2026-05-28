import { create } from 'zustand';

export type TelemetrySource = 'ZEEK' | 'SURICATA' | 'EBPF';

export interface TelemetryEvent {
  id: string;
  ts: number;
  source: TelemetrySource;
  raw: string; // Formatted display string
  severity: 'low' | 'medium' | 'high' | 'critical';
  // Source-specific data
  srcIp?: string;
  destIp?: string;
  proto?: string;
  signature?: string;
  syscall?: string;
  process?: string;
}

export interface PipelineHealth {
  kafkaLag: number;
  zeekHeartbeat: number;
  suricataEventsPerSec: number;
  ebpfProbes: number;
  deceptionEngineStatus: 'ARMED' | 'ENGAGING' | 'STANDBY';
}

// ─── Phase 4: AI Threat Reasoning Models ─────────────────────────────────────

export type MitreTactic =
  | 'Reconnaissance' | 'Initial Access' | 'Execution' | 'Persistence'
  | 'Privilege Escalation' | 'Defense Evasion' | 'Credential Access'
  | 'Discovery' | 'Lateral Movement' | 'Collection' | 'Exfiltration' | 'Command & Control';

export interface MitreTTP {
  tactic: MitreTactic;
  technique: string;     // e.g. "T1059.001"
  name: string;          // e.g. "PowerShell"
  confidence: number;    // 0–100
  observed: boolean;
}

export interface AttackerProfile {
  id: string;
  threatId: string;
  sourceIp: string;
  countryCode: string;   // e.g. "RU", "CN", "KP"
  countryName: string;
  asnName: string;       // e.g. "AS12345 Fancy Bear LLC"
  tooling: string[];     // e.g. ["Cobalt Strike", "Mimikatz"]
  killChainStage: MitreTactic;
  ttps: MitreTTP[];
  firstSeen: number;     // timestamp
  lastSeen: number;
  confidence: number;
  isThreatActor: boolean;
  actorName?: string;    // e.g. "APT28"
}

export type AIReasoningPhase = 'INGEST' | 'ENRICH' | 'CORRELATE' | 'DECIDE' | 'EXECUTE' | 'IDLE';

export interface AIReasoningState {
  currentPhase: AIReasoningPhase;
  isThinking: boolean;
  currentThreatId: string | null;
  confidence: number;
  vectorDbHits: number;
  modelLatency: number;
}

// ─── Phase 5: Adaptive Sandbox Orchestration Models ────────────────────────────

export type TwinLifecycle = 'CLONING' | 'PROVISIONING' | 'HARDENING' | 'ONLINE' | 'COMBAT' | 'TEARDOWN';

export interface TerraformOperation {
  id: string;
  ts: number;
  step: string;     // e.g. "proxmox_vm_qemu.honey-db: Creating..."
  status: 'running' | 'complete' | 'error';
  duration?: number; // ms
}

export interface AttackerSession {
  id: string;
  ts: number;
  command: string;  // e.g. "cat /etc/passwd"
  response: string; // deceptive response from the twin
  isSuspicious: boolean;
}

export interface SandboxTwin {
  id: string;          // e.g. "TWIN-4f3a"
  threatId: string;
  attackerIp: string;
  lifecycle: TwinLifecycle;
  vmName: string;      // e.g. "honey-prod-twin-01"
  vmNode: string;      // Proxmox node
  vCpus: number;
  ramGb: number;
  diskGb: number;
  ipAddress: string;   // fake IP inside twin
  spawnedAt: number;
  terraformOps: TerraformOperation[];
  attackerSessions: AttackerSession[];
  exfilAttempts: number;
  credentialHits: number; // times attacker accessed fake creds
  iocsCaptured: string[];
}

// ─── Phase 6: Autonomous Defensive Operations Models ──────────────────────────

export type DefensiveActionType = 'ISOLATE_NODE' | 'BLOCK_ASN' | 'TERMINATE_PROCESS' | 'ENFORCE_ZERO_TRUST';

export interface DefensiveOperation {
  id: string;
  threatId: string;
  action: DefensiveActionType;
  target: string; // e.g. "Node web-cluster-1" or "ASN 4134"
  status: 'PENDING' | 'EXECUTING' | 'VERIFYING' | 'SUCCESS' | 'FAILED';
  startedAt: number;
  completedAt?: number;
  logs: string[];
}

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
  status: 'healthy' | 'warning' | 'compromised' | 'isolated' | 'redirected';
  cpuUsage: number;
  memoryUsage: number;
  connections: string[]; // IDs of connected nodes
  isHoneyNode?: boolean;
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
  systemHealth: { cpu: number; networkTraffic: number; };
  // Phase 3: Telemetry pipeline state
  telemetryEvents: TelemetryEvent[];
  pipelineHealth: PipelineHealth;
  // Phase 4: AI Reasoning state
  attackerProfiles: Record<string, AttackerProfile>;
  aiReasoningState: AIReasoningState;
  
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
  // Phase 3 actions
  addTelemetryEvent: (event: Omit<TelemetryEvent, 'id'>) => void;
  updatePipelineHealth: (health: Partial<PipelineHealth>) => void;
  // Phase 4 actions
  upsertAttackerProfile: (profile: AttackerProfile) => void;
  updateAIReasoningState: (state: Partial<AIReasoningState>) => void;
  // Phase 5 actions
  sandboxTwins: Record<string, SandboxTwin>;
  spawnSandboxTwin: (twin: SandboxTwin) => void;
  updateTwinLifecycle: (twinId: string, lifecycle: TwinLifecycle) => void;
  addTerraformOp: (twinId: string, op: TerraformOperation) => void;
  addAttackerSession: (twinId: string, session: AttackerSession) => void;
  updateTwinStats: (twinId: string, patch: Partial<Pick<SandboxTwin, 'exfilAttempts' | 'credentialHits' | 'iocsCaptured'>>) => void;
  // Phase 6 actions
  defensiveOperations: Record<string, DefensiveOperation>;
  addDefensiveOperation: (op: DefensiveOperation) => void;
  updateOperationStatus: (opId: string, status: DefensiveOperation['status'], log?: string) => void;
}

// Initial mock network
const initialNodes: Record<string, NetworkNode> = {
  'fw-1': { id: 'fw-1', label: 'Edge Firewall', type: 'firewall', status: 'healthy', cpuUsage: 12, memoryUsage: 45, connections: ['web-cluster-1'] },
  'web-cluster-1': { id: 'web-cluster-1', label: 'Web Cluster', type: 'server', status: 'healthy', cpuUsage: 65, memoryUsage: 80, connections: ['db-main', 'internal-api'] },
  'db-main': { id: 'db-main', label: 'Main Database', type: 'database', status: 'healthy', cpuUsage: 35, memoryUsage: 90, connections: [] },
  'internal-api': { id: 'internal-api', label: 'Internal API', type: 'server', status: 'healthy', cpuUsage: 25, memoryUsage: 40, connections: ['cloud-storage', 'honey-api-proxy'] },
  'cloud-storage': { id: 'cloud-storage', label: 'Cloud Blob Storage', type: 'cloud', status: 'healthy', cpuUsage: 5, memoryUsage: 10, connections: [] },
  // Deceptive Digital Twin Infrastructure (Proxmox Sandboxed)
  'honey-api-proxy': { id: 'honey-api-proxy', label: 'Decoy API Proxy', type: 'server', status: 'healthy', cpuUsage: 2, memoryUsage: 10, connections: ['honey-db-1'], isHoneyNode: true },
  'honey-db-1': { id: 'honey-db-1', label: 'Synthetic Database Twin', type: 'database', status: 'healthy', cpuUsage: 1, memoryUsage: 5, connections: [], isHoneyNode: true },
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
  // Phase 3: Telemetry pipeline initial state
  telemetryEvents: [],
  pipelineHealth: {
    kafkaLag: 0,
    zeekHeartbeat: 0,
    suricataEventsPerSec: 0,
    ebpfProbes: 128,
    deceptionEngineStatus: 'ARMED',
  },
  // Phase 4: AI Reasoning initial state
  attackerProfiles: {},
  aiReasoningState: {
    currentPhase: 'IDLE',
    isThinking: false,
    currentThreatId: null,
    confidence: 0,
    vectorDbHits: 0,
    modelLatency: 0,
  },
  // Phase 5: Sandbox Twins initial state
  sandboxTwins: {},
  // Phase 6: Defensive Operations initial state
  defensiveOperations: {},

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

  // Phase 3: Telemetry pipeline actions
  addTelemetryEvent: (event) => set((state) => ({
    telemetryEvents: [
      { ...event, id: Math.random().toString(36).substring(2, 11) },
      ...state.telemetryEvents,
    ].slice(0, 200), // Rolling buffer capped at 200 events
  })),

  updatePipelineHealth: (health) => set((state) => ({
    pipelineHealth: { ...state.pipelineHealth, ...health },
  })),

  // Phase 4: AI Reasoning actions
  upsertAttackerProfile: (profile) => set((state) => ({
    attackerProfiles: { ...state.attackerProfiles, [profile.id]: profile },
  })),

  updateAIReasoningState: (update) => set((state) => ({
    aiReasoningState: { ...state.aiReasoningState, ...update },
  })),

  // Phase 5: Sandbox Twin actions
  spawnSandboxTwin: (twin) => set((state) => ({
    sandboxTwins: { ...state.sandboxTwins, [twin.id]: twin },
  })),

  updateTwinLifecycle: (twinId, lifecycle) => set((state) => {
    const twin = state.sandboxTwins[twinId];
    if (!twin) return state;
    return { sandboxTwins: { ...state.sandboxTwins, [twinId]: { ...twin, lifecycle } } };
  }),

  addTerraformOp: (twinId, op) => set((state) => {
    const twin = state.sandboxTwins[twinId];
    if (!twin) return state;
    return { sandboxTwins: { ...state.sandboxTwins, [twinId]: { ...twin, terraformOps: [...twin.terraformOps, op].slice(-30) } } };
  }),

  addAttackerSession: (twinId, session) => set((state) => {
    const twin = state.sandboxTwins[twinId];
    if (!twin) return state;
    return { sandboxTwins: { ...state.sandboxTwins, [twinId]: { ...twin, attackerSessions: [...twin.attackerSessions, session].slice(-50) } } };
  }),

  updateTwinStats: (twinId, patch) => set((state) => {
    const twin = state.sandboxTwins[twinId];
    if (!twin) return state;
    return { sandboxTwins: { ...state.sandboxTwins, [twinId]: { ...twin, ...patch } } };
  }),

  // Phase 6: Defensive Operation actions
  addDefensiveOperation: (op) => set((state) => ({
    defensiveOperations: { ...state.defensiveOperations, [op.id]: op },
  })),

  updateOperationStatus: (opId, status, log) => set((state) => {
    const op = state.defensiveOperations[opId];
    if (!op) return state;
    return {
      defensiveOperations: {
        ...state.defensiveOperations,
        [opId]: {
          ...op,
          status,
          ...(status === 'SUCCESS' || status === 'FAILED' ? { completedAt: Date.now() } : {}),
          ...(log ? { logs: [...op.logs, log] } : {})
        }
      }
    };
  }),
}));
