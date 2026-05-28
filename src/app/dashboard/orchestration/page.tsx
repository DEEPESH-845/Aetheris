"use client";

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { sendToBackend } from '@/simulation/engine';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import { Database, Server, Terminal, Network, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrchestrationPage() {
  const { sandboxEnvironments, initSandboxEnvironment } = useSimulationStore();
  
  const handleProvision = () => {
    const envId = `ENV-${Math.floor(Math.random() * 9000) + 1000}`;
    initSandboxEnvironment(envId);
    if (sendToBackend) {
      sendToBackend({ type: 'PROVISION_SANDBOX', envId });
    }
  };

  const envs = Object.values(sandboxEnvironments);
  const activeEnv = envs.length > 0 ? envs[envs.length - 1] : null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
            <Database className="w-8 h-8 text-neon-cyan" />
            AUTONOMOUS ORCHESTRATION
          </h1>
          <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">
            Real-time execution of AI-driven Ansible & Kubernetes containment workflows.
          </p>
        </div>
        <CyberButton 
          variant="primary" 
          onClick={handleProvision}
          className="flex items-center gap-2"
        >
          <Server className="w-4 h-4" />
          PROVISION SANDBOX
        </CyberButton>
      </header>

      {!activeEnv ? (
        <CyberPanel className="flex-1 flex flex-col items-center justify-center p-8 border-dashed border-white/20">
          <Database className="w-16 h-16 text-white/10 mb-4" />
          <h2 className="text-xl text-text-muted font-mono uppercase tracking-widest">No Active Environments</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-md text-center">
            Click 'Provision Sandbox' to deploy a Kubernetes cluster with Cilium eBPF networking and vulnerable workloads for isolated attack replay.
          </p>
        </CyberPanel>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
          
          {/* Provisioning Terminal */}
          <CyberPanel className="flex flex-col overflow-hidden" scanline glowColor="cyan">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
              <Terminal className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-lg font-outfit text-white tracking-widest uppercase">
                Ansible / Terraform Execution
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted">ID: {activeEnv.id}</span>
                {activeEnv.status === 'PROVISIONING' ? (
                  <span className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-mono animate-pulse">EXECUTING</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs font-mono">ONLINE / IDLE</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-xs text-text-secondary space-y-2 p-4 bg-black/60 rounded-sm border border-white/5">
              <AnimatePresence>
                {activeEnv.logs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                  >
                    <span className="text-neon-cyan opacity-50 shrink-0">{`>`}</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeEnv.status === 'PROVISIONING' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="flex gap-4"
                >
                  <span className="text-neon-cyan opacity-50">{`>`}</span>
                  <span className="w-2 h-4 bg-neon-cyan/50" />
                </motion.div>
              )}
            </div>
          </CyberPanel>

          {/* eBPF Network Telemetry */}
          <CyberPanel className="flex flex-col overflow-hidden" scanline glowColor="magenta">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
              <Network className="w-5 h-5 text-neon-magenta" />
              <h2 className="text-lg font-outfit text-white tracking-widest uppercase">
                Cilium eBPF Sensors
              </h2>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {activeEnv.status === 'PROVISIONING' ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                  <ShieldCheck className="w-12 h-12 text-white/20 mb-4 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest">Awaiting kernel hooks...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-text-muted sticky top-0 bg-[#06060c] z-10 border-b border-white/10">
                      <tr>
                        <th className="pb-2 font-normal">ENDPOINT</th>
                        <th className="pb-2 font-normal">SYSCALL</th>
                        <th className="pb-2 font-normal">PID</th>
                        <th className="pb-2 font-normal text-right">VERDICT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence initial={false}>
                        {activeEnv.ebpfLogs.map((log, i) => (
                          <motion.tr 
                            key={`${log.timestamp}-${i}`}
                            initial={{ opacity: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            animate={{ opacity: 1, backgroundColor: 'transparent' }}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 text-white">{log.pod}</td>
                            <td className="py-2 text-neon-cyan">{log.syscall}</td>
                            <td className="py-2 text-text-muted">{log.pid}</td>
                            <td className="py-2 text-right">
                              {log.verdict === 'FORWARDED' ? (
                                <span className="text-neon-green">FORWARDED</span>
                              ) : (
                                <span className="text-neon-red font-bold">DROPPED</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CyberPanel>

        </div>
      )}
    </div>
  );
}
