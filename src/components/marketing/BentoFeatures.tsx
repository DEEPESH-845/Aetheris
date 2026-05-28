"use client";

import React from 'react';
import { ShieldAlert, Network, BrainCircuit, ActivitySquare, TerminalSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function BentoFeatures() {
  return (
    <section id="features" className="py-24 px-6 md:px-12 relative max-w-[1400px] mx-auto">
      {/* Decorative header */}
      <div className="flex flex-col items-start mb-16">
        <h2 className="text-3xl md:text-5xl font-outfit font-bold tracking-tight text-white mb-4">
          Orchestrate <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Defenses</span>
        </h2>
        <p className="text-text-secondary max-w-2xl text-lg">
          Unlike reactive monitoring tools, Aetheris closes the loop. It detects, reasons, and contains zero-day lateral movement autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[340px]">
        {/* Cell 1: Threat Detection (Spans 2 columns on tablet+) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 glass-panel p-8 rounded-xl flex flex-col justify-between group overflow-hidden relative glass-panel-interactive"
        >
          {/* Subtle gradient orb inside cell */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative z-10 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-8">
            <ActivitySquare className="w-6 h-6 text-neon-cyan" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-outfit font-medium text-white mb-3">Real-time Telemetry Ingestion</h3>
            <p className="text-text-secondary leading-relaxed max-w-md">
              Ingests Kafka streams from Cilium eBPF and Zeek network sensors directly into an in-memory datastore.
              Detects anomalous packet flows in microseconds, eliminating MTTD delays.
            </p>
          </div>
        </motion.div>

        {/* Cell 2: AI Reasoning */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-1 glass-panel p-8 rounded-xl flex flex-col justify-between group overflow-hidden relative glass-panel-interactive"
        >
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-neon-magenta/10 rounded-full blur-[80px] transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative z-10 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-8">
            <BrainCircuit className="w-6 h-6 text-neon-magenta" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-outfit font-medium text-white mb-3">Cognitive Agents</h3>
            <p className="text-text-secondary leading-relaxed">
              LangGraph deterministic state machines evaluate the MITRE ATT&CK killchain and formulate proportional response policies.
            </p>
          </div>
        </motion.div>

        {/* Cell 3: Autonomous Containment */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1 glass-panel p-8 rounded-xl flex flex-col justify-between group overflow-hidden relative glass-panel-interactive"
        >
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative z-10 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-8">
            <ShieldAlert className="w-6 h-6 text-neon-purple" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-outfit font-medium text-white mb-3">eBPF Containment</h3>
            <p className="text-text-secondary leading-relaxed">
              Dynamically triggers gRPC policies to sever infected node connections instantly without halting the entire pod network.
            </p>
          </div>
        </motion.div>

        {/* Cell 4: Enterprise Digital Twin (Spans 2 columns) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-2 glass-panel p-8 rounded-xl flex flex-col md:flex-row gap-8 justify-between group overflow-hidden relative glass-panel-interactive items-center"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
           
           <div className="flex-1 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-8">
              <Network className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-outfit font-medium text-white mb-3">Enterprise Sandbox Twin</h3>
            <p className="text-text-secondary leading-relaxed max-w-md">
              Safely test AI remediation logic in an isolated Proxmox/K8s cyber range. 
              Inject live malware, watch the AI defend, and audit the playbook before deploying to production.
            </p>
           </div>

           {/* Stylized Node Graph Abstract */}
           <div className="hidden md:flex w-48 h-48 relative z-10 items-center justify-center">
             <div className="absolute w-full h-full border border-white/10 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
             <div className="absolute w-3/4 h-3/4 border border-neon-cyan/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
             <TerminalSquare className="w-8 h-8 text-neon-cyan relative z-10" />
           </div>
        </motion.div>

      </div>
    </section>
  );
}
