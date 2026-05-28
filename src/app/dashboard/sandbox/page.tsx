"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import { ShieldAlert, Crosshair, Zap, Database } from 'lucide-react';
import { useSimulationStore, ThreatLevel } from '@/store/useSimulationStore';
import { StatusBadge } from '@/components/core/StatusBadge';

const attackVectors = [
  { id: 'ransomware', name: 'Ransomware Outbreak', type: 'Ransomware', severity: 'CRITICAL', icon: ShieldAlert },
  { id: 'phishing', name: 'Spear Phishing', type: 'Phishing', severity: 'HIGH', icon: Crosshair },
  { id: 'ddos', name: 'DDoS Attack', type: 'DDoS', severity: 'MEDIUM', icon: Zap },
  { id: 'sqli', name: 'SQL Injection', type: 'Database Breach', severity: 'CRITICAL', icon: Database },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", bounce: 0, duration: 0.8 } 
  }
};

const instructionsVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { staggerChildren: 0.1, delayChildren: 0.5 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0, duration: 0.5 } }
};

export default function SandboxPage() {
  const { addThreat, networkNodes, updateNodeStatus, isSimulationRunning, toggleSimulation } = useSimulationStore();
  const nodesList = Object.keys(networkNodes);

  const triggerAttack = (type: string, severity: ThreatLevel) => {
    if (nodesList.length === 0) return;
    
    const targetNode = nodesList[Math.floor(Math.random() * nodesList.length)];
    
    addThreat({
      id: `SIM-${Math.floor(Math.random() * 10000)}`,
      type,
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetNode,
      severity,
      confidence: 100,
      timestamp: Date.now(),
      status: 'DETECTED'
    });

    updateNodeStatus(targetNode, 'compromised');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8 pb-10"
    >
      <header className="mb-8 relative">
        <motion.div 
           initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
           animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
           transition={{ type: "spring", bounce: 0, duration: 0.8 }}
        >
          <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="p-2 bg-neon-cyan/10 rounded-xl"
            >
              <Database className="w-8 h-8 text-neon-cyan" />
            </motion.div>
            SANDBOX ATTACK SIMULATOR
          </h1>
          <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Manually trigger threat vectors to test AI autonomous response.</p>
        </motion.div>
      </header>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0, duration: 0.8 }}
        className="flex gap-4 mb-8"
      >
        <CyberButton 
          variant={isSimulationRunning ? "danger" : "primary"} 
          onClick={toggleSimulation}
          className="shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500"
        >
          <motion.span layoutId="sim-btn-text">
             {isSimulationRunning ? "HALT BACKGROUND SIMULATION" : "RESUME BACKGROUND SIMULATION"}
          </motion.span>
        </CyberButton>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {attackVectors.map((attack) => {
          const Icon = attack.icon;
          const isCritical = attack.severity === 'CRITICAL';
          return (
            <motion.div key={attack.id} variants={cardVariants} whileHover={{ y: -6 }}>
              <CyberPanel 
                variant="outline" 
                className="flex flex-col h-full group relative overflow-hidden bg-black/60 backdrop-blur-xl border-white/5 hover:border-white/20 transition-all duration-300"
                scanline 
              >
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40 ${isCritical ? 'bg-neon-red' : 'bg-neon-cyan'}`} />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`p-3 bg-white/5 border rounded-xl backdrop-blur-sm transition-colors duration-300 ${isCritical ? 'border-neon-red/30 group-hover:border-neon-red' : 'border-neon-cyan/30 group-hover:border-neon-cyan'}`}>
                    <Icon className={`w-6 h-6 ${isCritical ? 'text-neon-red' : 'text-neon-cyan'}`} />
                  </div>
                  <StatusBadge 
                    status={isCritical ? 'critical' : attack.severity === 'HIGH' ? 'warning' : 'active'} 
                    label={attack.severity} 
                    pulse={isCritical}
                  />
                </div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-outfit font-bold text-white mb-2">{attack.name}</h3>
                  <p className="text-xs font-mono text-text-secondary mb-8 leading-relaxed">
                    Triggers a simulated {attack.name.toLowerCase()} targeting a random network node.
                  </p>
                </div>

                <CyberButton 
                  variant="outline" 
                  className={`w-full justify-between relative z-10 overflow-hidden ${isCritical ? 'hover:border-neon-red hover:text-neon-red group-hover:shadow-[0_0_15px_rgba(255,0,85,0.2)]' : 'hover:border-neon-cyan hover:text-neon-cyan group-hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]'}`}
                  onClick={() => triggerAttack(attack.type, attack.severity as ThreatLevel)}
                >
                  <span className="font-semibold tracking-wider">DEPLOY ATTACK</span>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Crosshair className={`w-4 h-4 ${isCritical ? 'text-neon-red' : 'text-neon-cyan'}`} />
                  </motion.div>
                </CyberButton>
              </CyberPanel>
            </motion.div>
          );
        })}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.2 }}
      >
        <CyberPanel className="mt-8 bg-black/40 backdrop-blur-md border-white/5 shadow-2xl">
           <h2 className="text-xl font-outfit font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="w-1.5 h-6 bg-neon-cyan rounded-full" />
             Simulator Instructions
           </h2>
           <motion.ul 
             variants={instructionsVariants}
             initial="hidden"
             animate="visible"
             className="space-y-4 text-sm font-mono text-text-secondary"
           >
             <motion.li variants={itemVariants} className="flex items-start gap-3">
               <span className="text-neon-cyan font-bold bg-neon-cyan/10 px-2 py-0.5 rounded text-xs">01</span> 
               <span className="mt-0.5">Select an attack vector from the panel above.</span>
             </motion.li>
             <motion.li variants={itemVariants} className="flex items-start gap-3">
               <span className="text-neon-cyan font-bold bg-neon-cyan/10 px-2 py-0.5 rounded text-xs">02</span> 
               <span className="mt-0.5">Watch the global Threat Score increase exponentially.</span>
             </motion.li>
             <motion.li variants={itemVariants} className="flex items-start gap-3">
               <span className="text-neon-cyan font-bold bg-neon-cyan/10 px-2 py-0.5 rounded text-xs">03</span> 
               <span className="mt-0.5">Switch to the Command Center to watch the AI Reasoning Stream analyze the threat in real-time.</span>
             </motion.li>
             <motion.li variants={itemVariants} className="flex items-start gap-3">
               <span className="text-neon-cyan font-bold bg-neon-cyan/10 px-2 py-0.5 rounded text-xs">04</span> 
               <span className="mt-0.5">Observe the Network Topology map update as the target node becomes compromised, then isolated.</span>
             </motion.li>
           </motion.ul>
        </CyberPanel>
      </motion.div>
    </motion.div>
  );
}
