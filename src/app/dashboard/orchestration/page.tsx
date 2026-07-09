"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, SandboxTwin, TwinLifecycle, TerraformOperation } from '@/store/useSimulationStore';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import {
  Server, Terminal, Network, ShieldCheck, Cpu, HardDrive,
  MemoryStick, Globe, CheckCircle2, Loader2, Zap, Database,
  AlertTriangle, Eye
} from 'lucide-react';

// ─── Lifecycle badge ─────────────────────────────────────────────────────────
const LIFECYCLE_CONFIG: Record<TwinLifecycle, { label: string; color: string; dot: string }> = {
  CLONING:      { label: 'CLONING',      color: 'text-blue-400   border-blue-400/30   bg-blue-400/10',    dot: 'bg-blue-400 animate-pulse' },
  PROVISIONING: { label: 'PROVISIONING', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',  dot: 'bg-yellow-400 animate-pulse' },
  HARDENING:    { label: 'HARDENING',    color: 'text-orange-400 border-orange-400/30 bg-orange-400/10',  dot: 'bg-orange-400 animate-pulse' },
  ONLINE:       { label: 'ONLINE',       color: 'text-neon-cyan  border-neon-cyan/30  bg-neon-cyan/10',   dot: 'bg-neon-cyan' },
  COMBAT:       { label: 'COMBAT',       color: 'text-neon-magenta border-neon-magenta/30 bg-neon-magenta/10', dot: 'bg-neon-magenta animate-ping' },
  TEARDOWN:     { label: 'TEARDOWN',     color: 'text-text-muted border-white/20 bg-white/5',             dot: 'bg-text-muted' },
};

function LifecycleBadge({ lifecycle }: { lifecycle: TwinLifecycle }) {
  const cfg = LIFECYCLE_CONFIG[lifecycle];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-mono uppercase tracking-widest ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Twin stats card ─────────────────────────────────────────────────────────
function TwinStatsCard({ twin }: { twin: SandboxTwin }) {
  const cfg = LIFECYCLE_CONFIG[twin.lifecycle];
  const uptime = Math.floor((Date.now() - twin.spawnedAt) / 1000);
  const uptimeStr = uptime < 60 ? `${uptime}s` : `${Math.floor(uptime/60)}m ${uptime%60}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-5 space-y-5 overflow-hidden group hover:border-white/20 transition-all duration-500"
    >
      {/* Dynamic Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-40 ${
        twin.lifecycle === 'COMBAT' ? 'bg-neon-magenta' :
        twin.lifecycle === 'ONLINE' ? 'bg-neon-cyan' :
        twin.lifecycle === 'PROVISIONING' ? 'bg-yellow-400' : 'bg-transparent'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-sm font-outfit font-bold text-white tracking-wide">{twin.id}</div>
          <div className="text-[10px] font-mono text-text-muted mt-1 uppercase tracking-widest">{twin.vmName} · {twin.vmNode}</div>
        </div>
        <LifecycleBadge lifecycle={twin.lifecycle} />
      </div>

      {/* VM Specs */}
      <div className="grid grid-cols-4 gap-3 text-[10px] font-mono text-center relative z-10">
        {[
          { icon: <Cpu className="w-3.5 h-3.5 mx-auto mb-1.5" />, val: `${twin.vCpus}vCPU`, label: 'Compute' },
          { icon: <MemoryStick className="w-3.5 h-3.5 mx-auto mb-1.5" />, val: `${twin.ramGb}GB`, label: 'RAM' },
          { icon: <HardDrive className="w-3.5 h-3.5 mx-auto mb-1.5" />, val: `${twin.diskGb}GB`, label: 'Disk' },
          { icon: <Globe className="w-3.5 h-3.5 mx-auto mb-1.5" />, val: twin.ipAddress, label: 'IP' },
        ].map(s => (
          <div key={s.label} className="bg-black/40 border border-white/5 rounded-lg p-2.5 transition-colors group-hover:bg-white/5">
            <div className="text-text-muted">{s.icon}</div>
            <div className="text-white text-[10px] tabular-nums font-semibold mt-1">{s.val}</div>
            <div className="text-text-muted text-[8px] mt-0.5 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Combat stats */}
      {twin.lifecycle === 'COMBAT' && (
        <div className="grid grid-cols-3 gap-3 text-[10px] font-mono text-center relative z-10">
          <div className="bg-neon-red/5 border border-neon-red/20 rounded-lg p-3">
            <div className="text-neon-red text-xl font-outfit font-bold drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">{twin.credentialHits}</div>
            <div className="text-text-muted text-[8px] uppercase tracking-widest mt-1">Cred Hits</div>
          </div>
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
            <div className="text-yellow-400 text-xl font-outfit font-bold drop-shadow-[0_0_5px_rgba(255,200,0,0.5)]">{twin.exfilAttempts}</div>
            <div className="text-text-muted text-[8px] uppercase tracking-widest mt-1">Exfil Attempts</div>
          </div>
          <div className="bg-neon-magenta/5 border border-neon-magenta/20 rounded-lg p-3">
            <div className="text-neon-magenta text-xl font-outfit font-bold drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">{twin.iocsCaptured.length}</div>
            <div className="text-text-muted text-[8px] uppercase tracking-widest mt-1">IOCs</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-[9px] font-mono text-text-muted pt-2 border-t border-white/5 relative z-10 uppercase tracking-widest">
        <span>Attacker: <span className="text-neon-red ml-1 font-semibold">{twin.attackerIp}</span></span>
        <span>Uptime: <span className="text-white ml-1 font-semibold">{uptimeStr}</span></span>
      </div>
    </motion.div>
  );
}

// ─── Terraform log terminal ──────────────────────────────────────────────────
function TerraformTerminal({ twin }: { twin: SandboxTwin }) {
  return (
    <div className="flex-1 overflow-y-auto font-mono text-[10px] bg-black/60 rounded-xl border border-white/5 p-4 space-y-2 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
      
      {twin.terraformOps.length === 0 ? (
        <div className="flex items-center gap-3 text-text-muted opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
          <span className="uppercase tracking-widest text-[9px]">Initializing Terraform State...</span>
        </div>
      ) : (
        <div className="relative z-10 space-y-1.5">
          <AnimatePresence initial={false}>
            {twin.terraformOps.map(op => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 text-neon-cyan/40 select-none">❯</span>
                <span className={`leading-relaxed ${
                  op.step.includes('complete') || op.step.includes('DECEPTION') ? 'text-neon-green font-semibold' :
                  op.step.includes('TASK') ? 'text-neon-cyan' :
                  op.step.includes('error') ? 'text-neon-red' :
                  'text-text-secondary'
                }`}>{op.step}</span>
                {op.status === 'running' && (
                  <span className="shrink-0 mt-0.5 w-1.5 h-3 bg-yellow-400 animate-pulse" />
                )}
                {op.status === 'complete' && (
                  <CheckCircle2 className="w-3 h-3 text-neon-green shrink-0 mt-0.5" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main Orchestration Page ──────────────────────────────────────────────────
export default function OrchestrationPage() {
  const { sandboxEnvironments, sandboxTwins, initSandboxEnvironment, spawnSandboxTwin, addTerraformOp, updateTwinLifecycle } = useSimulationStore();
  const twins = Object.values(sandboxTwins);
  const activeTwin = twins.find(t => ['COMBAT', 'ONLINE', 'HARDENING', 'PROVISIONING', 'CLONING'].includes(t.lifecycle));

  const handleProvision = () => {
    const twinId = `TWIN-${Math.floor(Math.random() * 9000) + 1000}`;
    const envId = `ENV-${twinId}`;
    initSandboxEnvironment(envId);

    const newTwin: SandboxTwin = {
      id: twinId,
      threatId: `SIM-${Math.floor(Math.random() * 90000) + 10000}`,
      attackerIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.12.5`,
      lifecycle: 'PROVISIONING',
      vmName: `honey-prod-${twinId.toLowerCase()}`,
      vmNode: 'pve-02',
      vCpus: 4,
      ramGb: 16,
      diskGb: 50,
      ipAddress: '10.0.9.155',
      spawnedAt: Date.now(),
      terraformOps: [],
      attackerSessions: [],
      exfilAttempts: 0,
      credentialHits: 0,
      iocsCaptured: [],
    };

    spawnSandboxTwin(newTwin);

    // Simulate provisioning workflow
    setTimeout(() => {
      addTerraformOp(twinId, {
        id: `op-1-${Date.now()}`,
        ts: Date.now(),
        step: 'proxmox_vm_qemu.honey-db: Creating...',
        status: 'running'
      });
      
      setTimeout(() => {
        addTerraformOp(twinId, {
          id: `op-2-${Date.now()}`,
          ts: Date.now(),
          step: 'proxmox_vm_qemu.honey-db: Creation complete',
          status: 'complete',
          duration: 1200
        });
        updateTwinLifecycle(twinId, 'HARDENING');
        
        setTimeout(() => {
           addTerraformOp(twinId, {
             id: `op-3-${Date.now()}`,
             ts: Date.now(),
             step: 'ansible_playbook.harden_nginx: TASK [Apply Zero Trust config]',
             status: 'complete'
           });
           updateTwinLifecycle(twinId, 'ONLINE');
        }, 1500);

      }, 2000);
    }, 500);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <header className="flex-shrink-0 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
            <Server className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-wide">SANDBOX ORCHESTRATION</h1>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest mt-1">
              Proxmox VM Cloning · Terraform · Ansible · Cilium eBPF Deceptive Routing
            </p>
          </div>
        </div>
        <CyberButton variant="primary" onClick={handleProvision} className="flex items-center gap-2 group">
          <Server className="w-4 h-4 group-hover:scale-110 transition-transform" />
          PROVISION TWIN
        </CyberButton>
      </header>

      {/* Active twin cards */}
      {twins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-shrink-0">
          <AnimatePresence>
            {twins.map(twin => <TwinStatsCard key={twin.id} twin={twin} />)}
          </AnimatePresence>
        </div>
      )}

      {/* Main panels */}
      {activeTwin ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

          {/* Terraform / Ansible Execution Log */}
          <CyberPanel className="flex flex-col overflow-hidden gap-4 bg-black/40 backdrop-blur-2xl border-white/5 p-5" glowColor="cyan">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                  Terraform · Ansible Execution
                </h2>
              </div>
              <LifecycleBadge lifecycle={activeTwin.lifecycle} />
            </div>
            <TerraformTerminal twin={activeTwin} />
          </CyberPanel>

          {/* Cilium eBPF Sensor feed */}
          <CyberPanel className="flex flex-col overflow-hidden gap-4 bg-black/40 backdrop-blur-2xl border-white/5 p-5" glowColor="magenta">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-neon-magenta" />
                <h2 className="text-sm font-outfit font-bold text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">
                  Cilium eBPF Sensors
                </h2>
              </div>
              {activeTwin.lifecycle === 'COMBAT' && (
                <span className="text-[9px] font-mono text-neon-magenta uppercase tracking-widest animate-pulse border border-neon-magenta/20 bg-neon-magenta/10 px-2 py-0.5 rounded-sm">
                  DECEPTION ACTIVE
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              {activeTwin.lifecycle === 'PROVISIONING' || activeTwin.lifecycle === 'CLONING' ? (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <ShieldCheck className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
                  <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting kernel probe activation...</p>
                </div>
              ) : (
                <table className="w-full text-left text-[10px] font-mono">
                  <thead className="text-text-muted border-b border-white/10 bg-black/40 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold tracking-wider">ENDPOINT</th>
                      <th className="py-2.5 px-3 font-semibold tracking-wider">SYSCALL</th>
                      <th className="py-2.5 px-3 font-semibold tracking-wider">PID</th>
                      <th className="py-2.5 px-3 font-semibold tracking-wider text-right">VERDICT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                      {Object.values(sandboxEnvironments).flatMap(e => e.ebpfLogs).slice(0, 20).map((log, i) => (
                        <motion.tr
                          key={`${log.timestamp}-${i}`}
                          initial={{ opacity: 0, backgroundColor: 'rgba(255,255,255,0.08)' }}
                          animate={{ opacity: 1, backgroundColor: 'transparent' }}
                          className="group hover:bg-white/5 transition-colors"
                        >
                          <td className="py-2 px-3 text-white">{log.pod ?? activeTwin.vmName}</td>
                          <td className="py-2 px-3 text-neon-cyan">{log.syscall}</td>
                          <td className="py-2 px-3 text-text-muted">{log.pid}</td>
                          <td className="py-2 px-3 text-right">
                            {log.verdict === 'FORWARDED'
                              ? <span className="text-neon-green">FORWARDED</span>
                              : <span className="text-neon-red font-bold drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">DROPPED</span>}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </CyberPanel>
        </div>
      ) : (
        <CyberPanel className="flex-1 flex flex-col items-center justify-center border-dashed border-white/10 text-center p-8 bg-black/20 backdrop-blur-xl">
          <Database className="w-16 h-16 text-white/5 mb-6" />
          <h2 className="text-2xl font-outfit font-bold text-text-muted uppercase tracking-widest mb-3">No Active Sandbox Twins</h2>
          <p className="text-text-secondary text-sm font-mono max-w-lg leading-relaxed mx-auto text-center">
            Sandbox twins are provisioned automatically when a threat enters the MITIGATING phase.
            Trigger an attack in the Sandbox Lab or wait for the simulation engine to detect a threat.
          </p>
        </CyberPanel>
      )}
    </div>
  );
}
