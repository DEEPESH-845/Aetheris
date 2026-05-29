"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import { useSimulationStore, ThreatLevel, SandboxTwin } from '@/store/useSimulationStore';
import { StatusBadge } from '@/components/core/StatusBadge';
import {
  ShieldAlert, Crosshair, Zap, Database, Terminal,
  Eye, AlertTriangle, Activity, Server, Skull, Loader2
} from 'lucide-react';

// ─── Attack Vector Data ──────────────────────────────────────────────────────
const attackVectors = [
  {
    id: 'apt-cobalt',
    name: 'APT — Cobalt Strike',
    type: 'APT Intrusion',
    severity: 'CRITICAL' as ThreatLevel,
    sourceIp: '185.220.101.3',
    icon: Skull,
    description: 'Simulates an APT28 Cobalt Strike beacon establishing C2 over HTTPS.',
  },
  {
    id: 'ransomware',
    name: 'Ransomware Outbreak',
    type: 'Ransomware',
    severity: 'CRITICAL' as ThreatLevel,
    sourceIp: '45.33.32.156',
    icon: ShieldAlert,
    description: 'Encrypts network shares and exfiltrates to Tor exit node.',
  },
  {
    id: 'sqli-exfil',
    name: 'SQL Injection + Exfil',
    type: 'Database Breach',
    severity: 'HIGH' as ThreatLevel,
    sourceIp: '104.21.33.9',
    icon: Database,
    description: 'Blind SQLi against the API gateway followed by data exfiltration.',
  },
  {
    id: 'ssh-bruteforce',
    name: 'SSH Brute Force',
    type: 'Credential Attack',
    severity: 'HIGH' as ThreatLevel,
    sourceIp: '203.0.113.72',
    icon: Crosshair,
    description: 'Distributed SSH credential stuffing from 12 source IPs.',
  },
  {
    id: 'ddos',
    name: 'Layer 7 DDoS',
    type: 'DDoS',
    severity: 'MEDIUM' as ThreatLevel,
    sourceIp: '91.108.4.1',
    icon: Zap,
    description: 'HTTP flood targeting the /api/auth endpoint at 50k req/s.',
  },
  {
    id: 'insider',
    name: 'Insider Lateral Pivot',
    type: 'Lateral Movement',
    severity: 'HIGH' as ThreatLevel,
    sourceIp: '172.16.1.88',
    icon: Activity,
    description: 'Compromised internal endpoint pivoting via RDP to production.',
  },
];

// ─── Attacker Session Terminal ────────────────────────────────────────────────
function AttackerTerminal({ twin }: { twin: SandboxTwin }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [twin.attackerSessions]);

  return (
    <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[10px] space-y-2 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />

      {/* SSH banner */}
      <div className="text-neon-green/80 space-y-1 border-b border-white/10 pb-3 mb-3 relative z-10">
        <div className="font-semibold">OpenSSH_8.9p1 Ubuntu-3ubuntu0.6 (protocol 2.0)</div>
        <div className="text-text-muted text-[9px] uppercase tracking-widest mt-1">
          <span className="text-neon-magenta/80 animate-pulse mr-1">●</span>
          {'[DECEPTION] Attacker session proxied → '}<span className="text-neon-magenta font-bold">{twin.vmName}</span>{` (${twin.ipAddress})`}
        </div>
      </div>

      <div className="relative z-10 space-y-1">
        <AnimatePresence initial={false}>
          {twin.attackerSessions.map(session => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {/* Command line */}
              <div className="flex items-start gap-2">
                <span className="text-neon-green shrink-0">www-data@{twin.vmName}:~$</span>
                <span className={session.isSuspicious ? 'text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(255,200,0,0.5)]' : 'text-white'}>
                  {session.command}
                </span>
                {session.isSuspicious && (
                  <AlertTriangle className="w-3 h-3 text-neon-red shrink-0 mt-0.5 ml-1 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
                )}
              </div>
              {/* Response */}
              <div className="pl-4 text-text-secondary opacity-80 leading-relaxed whitespace-pre-wrap break-all pb-1">
                {session.response}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {twin.lifecycle === 'COMBAT' && twin.attackerSessions.length === 0 && (
        <div className="text-text-muted opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase tracking-widest text-[9px] flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-neon-magenta" />
          Awaiting attacker keystrokes...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

// ─── IOC Capture Feed ─────────────────────────────────────────────────────────
function IOCFeed({ twin }: { twin: SandboxTwin }) {
  return (
    <div className="space-y-2">
      {twin.iocsCaptured.length === 0 ? (
        <div className="text-[10px] font-mono text-text-muted opacity-50 italic text-center p-4 border border-dashed border-white/5 rounded-xl">No IOCs captured yet...</div>
      ) : (
        <AnimatePresence initial={false}>
          {twin.iocsCaptured.map((ioc, i) => (
            <motion.div
              key={`${ioc}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-[10px] font-mono p-2 bg-neon-red/5 border border-neon-red/10 rounded-lg group hover:bg-neon-red/10 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-neon-red shrink-0" />
              <span className="text-neon-red font-semibold">{ioc}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Main Sandbox Page ────────────────────────────────────────────────────────
export default function SandboxPage() {
  const { addThreat, networkNodes, updateNodeStatus, isSimulationRunning, toggleSimulation, sandboxTwins, updateThreatStatus } = useSimulationStore();
  const nodesList = Object.keys(networkNodes).filter(n => !networkNodes[n].isHoneyNode);
  const [justFired, setJustFired] = useState<string | null>(null);

  const combatTwins = Object.values(sandboxTwins).filter(t => t.lifecycle === 'COMBAT');
  const activeTwin = combatTwins[combatTwins.length - 1] ?? null;

  const triggerAttack = (vector: typeof attackVectors[0]) => {
    const targetNode = nodesList[Math.floor(Math.random() * nodesList.length)];
    addThreat({
      id: `SIM-${Math.floor(Math.random() * 90000) + 10000}`,
      type: vector.type,
      sourceIp: vector.sourceIp,
      targetNode,
      severity: vector.severity,
      confidence: 100,
      timestamp: Date.now(),
      status: 'DETECTED',
    });
    updateNodeStatus(targetNode, 'compromised');
    setJustFired(vector.id);
    setTimeout(() => setJustFired(null), 2000);
  };

  const escalateToMitigating = () => {
    const st = useSimulationStore.getState();
    st.activeThreats.filter(t => t.status === 'DETECTED' || t.status === 'ANALYZING').forEach(t => {
      st.updateThreatStatus(t.id, 'MITIGATING', 'eBPF traffic redirect → honey twin');
      st.updateNodeStatus(t.targetNode, 'redirected');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8 h-full flex flex-col relative"
    >
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-red/10 border border-neon-red/20 rounded-xl relative">
            <Skull className="w-8 h-8 text-neon-red relative z-10" />
            <div className="absolute inset-0 bg-neon-red blur-[20px] opacity-20 pointer-events-none" />
          </div>
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-wide">SANDBOX COMBAT LAB</h1>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest mt-1">
              Deploy attack vectors · Observe AI deception response · Monitor twin combat
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <CyberButton
            variant={isSimulationRunning ? 'danger' : 'primary'}
            onClick={toggleSimulation}
          >
            {isSimulationRunning ? 'HALT SIMULATION' : 'RESUME SIMULATION'}
          </CyberButton>
          <CyberButton
            variant="outline"
            onClick={escalateToMitigating}
            icon={<Eye className="w-4 h-4" />}
          >
            FORCE DECEPTION HANDOFF
          </CyberButton>
        </div>
      </header>

      {/* Attack Vector Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-shrink-0"
      >
        {attackVectors.map(vector => {
          const Icon = vector.icon;
          const isCritical = vector.severity === 'CRITICAL';
          const fired = justFired === vector.id;
          return (
            <motion.button
              key={vector.id}
              variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring", bounce: 0.4, duration: 0.6 } } }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerAttack(vector)}
              className={`relative flex flex-col items-start p-4 rounded-xl border bg-black/40 backdrop-blur-xl text-left transition-all duration-300 overflow-hidden group
                ${isCritical
                  ? 'border-neon-red/20 hover:border-neon-red/50 hover:bg-neon-red/10'
                  : 'border-white/10 hover:border-neon-cyan/40 hover:bg-neon-cyan/10'
                }
                ${fired ? (isCritical ? 'border-neon-red bg-neon-red/20 shadow-[0_0_20px_rgba(255,0,0,0.4)]' : 'border-neon-cyan bg-neon-cyan/20 shadow-[0_0_20px_rgba(0,243,255,0.4)]') : ''}
              `}
            >
              {/* Glow */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${isCritical ? 'bg-neon-red' : 'bg-neon-cyan'}`} />
              <div className={`p-2 rounded-lg mb-4 z-10 transition-colors ${isCritical ? 'bg-neon-red/10' : 'bg-neon-cyan/10'}`}>
                <Icon className={`w-5 h-5 ${isCritical ? 'text-neon-red drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-neon-cyan'}`} />
              </div>
              <div className="text-[11px] font-outfit font-bold text-white mb-1.5 z-10 leading-tight">{vector.name}</div>
              <div className={`text-[9px] font-mono uppercase tracking-widest z-10 font-semibold ${isCritical ? 'text-neon-red' : 'text-text-muted'}`}>{vector.severity}</div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Combat Arena */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* Attacker Session Terminal (full left 2 cols) */}
        <CyberPanel className="lg:col-span-8 flex flex-col overflow-hidden gap-4 p-5 bg-black/40 backdrop-blur-2xl border-white/5" scanline glowColor="magenta">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10 flex-shrink-0">
            <Terminal className="w-5 h-5 text-neon-magenta" />
            <span className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">Attacker Session Feed</span>
            {activeTwin && (
              <span className="ml-auto text-[10px] font-mono text-text-muted uppercase tracking-widest bg-black/40 px-3 py-1 rounded-md border border-white/5">
                Twin: <span className="text-neon-magenta font-bold">{activeTwin.id}</span> · {activeTwin.vmName}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {activeTwin ? (
              <AttackerTerminal twin={activeTwin} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-xl border border-dashed border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
                <Server className="w-16 h-16 text-white/5 mb-6 relative z-10" />
                <p className="font-mono text-sm uppercase tracking-widest text-text-muted mb-2 relative z-10">Awaiting sandbox twin deployment...</p>
                <p className="font-mono text-[10px] text-text-muted opacity-60 relative z-10">Deploy an attack vector above, then use FORCE DECEPTION HANDOFF</p>
              </div>
            )}
          </div>
        </CyberPanel>

        {/* Right col: stats + IOCs */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">

          {/* Active twins summary */}
          <CyberPanel className="flex-shrink-0 bg-black/40 backdrop-blur-2xl border-white/5 p-5" glowColor="cyan">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <Eye className="w-5 h-5 text-neon-cyan" />
              <span className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Active Twins</span>
            </div>
            <div className="space-y-3">
              {Object.values(sandboxTwins).length === 0 ? (
                <div className="text-[10px] font-mono text-text-muted opacity-50 p-4 border border-dashed border-white/5 rounded-xl text-center">No twins spawned</div>
              ) : (
                <AnimatePresence>
                  {Object.values(sandboxTwins).map(twin => (
                    <motion.div 
                      key={twin.id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between text-[10px] font-mono p-3 bg-black/40 border border-white/5 rounded-lg group hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-bold">{twin.id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted uppercase tracking-widest">{twin.lifecycle}</span>
                        <span className={`w-2 h-2 rounded-full ${twin.lifecycle === 'COMBAT' ? 'bg-neon-magenta animate-ping' : 'bg-neon-cyan animate-pulse shadow-[0_0_5px_rgba(0,243,255,0.8)]'}`} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CyberPanel>

          {/* IOC capture feed */}
          <CyberPanel className="flex-1 overflow-hidden flex flex-col bg-black/40 backdrop-blur-2xl border-white/5 p-5" glowColor="none">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10 flex-shrink-0 relative">
               {/* Optional glow for IOC panel */}
               {activeTwin && activeTwin.iocsCaptured.length > 0 && (
                 <div className="absolute top-0 right-0 w-32 h-10 bg-neon-red/20 blur-[20px] pointer-events-none" />
               )}
              <AlertTriangle className="w-5 h-5 text-neon-red" />
              <span className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">IOC Capture</span>
              {activeTwin && (
                <span className="ml-auto text-[10px] font-mono text-neon-red font-bold border border-neon-red/20 bg-neon-red/10 px-2 py-0.5 rounded-sm">
                  {activeTwin.iocsCaptured.length} EXTRACTED
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {activeTwin ? (
                <IOCFeed twin={activeTwin} />
              ) : (
                <div className="text-[10px] font-mono text-text-muted opacity-50 text-center p-6 border border-dashed border-white/10 rounded-xl bg-black/20">Awaiting IOC extraction...</div>
              )}
            </div>
          </CyberPanel>
        </div>
      </div>
    </motion.div>
  );
}
