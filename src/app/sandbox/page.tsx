"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ShieldAlert, Crosshair, Zap, Database, Activity, Code2, Terminal } from 'lucide-react';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import Link from 'next/link';

const springTransition = { type: "spring", bounce: 0, duration: 0.8 };
const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: springTransition }
};

const vectors = [
  { icon: ShieldAlert, color: "text-neon-red", border: "border-neon-red", bg: "bg-neon-red", title: "Ransomware Outbreak", desc: "Simulate a highly aggressive cryptoworm traversing the internal VLAN." },
  { icon: Crosshair, color: "text-neon-cyan", border: "border-neon-cyan", bg: "bg-neon-cyan", title: "Spear Phishing", desc: "Test heuristic analysis by dropping polymorphic payloads onto edge nodes." },
  { icon: Zap, color: "text-yellow-400", border: "border-yellow-400", bg: "bg-yellow-400", title: "Layer 7 DDoS", desc: "Saturate the ingress controllers to test autonomous load-balancer rerouting." },
  { icon: Database, color: "text-neon-magenta", border: "border-neon-magenta", bg: "bg-neon-magenta", title: "SQL Injection", desc: "Attempt lateral data exfiltration to trigger the Vector DB RAG memory." },
];

export default function SandboxMarketingPage() {
  return (
    <div className="min-h-screen w-full bg-cyber-darker text-foreground overflow-x-hidden selection:bg-neon-cyan/30">
      <SiteHeader />
      
      <main className="pt-32 pb-20">
        <section className="relative px-6 md:px-12 max-w-[1400px] mx-auto mb-32 flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(255,0,85,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="max-w-4xl relative z-10 space-y-6"
          >
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-red/30 bg-neon-red/5 text-neon-red text-xs font-mono tracking-widest mx-auto">
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE FIRE ENVIRONMENT
            </motion.div>
            
            <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl font-outfit font-bold text-white leading-[1.1] tracking-tight">
              Test the AI against <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-orange-500">
                Lethal Threat Vectors.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariants} className="text-text-secondary text-lg md:text-xl font-mono mx-auto max-w-2xl leading-relaxed">
              The Aetheris Sandbox provides an isolated, air-gapped cyber range where you can detonate sophisticated payloads and watch the cognitive engine mitigate them in real-time.
            </motion.p>

            <motion.div variants={fadeUpVariants} className="pt-8 flex items-center justify-center gap-6">
              <Link href="/dashboard/sandbox">
                <CyberButton variant="danger" className="h-14 px-10 text-lg group">
                   <span className="flex items-center gap-3">
                     <Terminal className="w-5 h-5 group-hover:animate-bounce" />
                     DEPLOY SIMULATION
                   </span>
                </CyberButton>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section className="px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {vectors.map((vec, i) => {
              const Icon = vec.icon;
              return (
                <motion.div key={i} variants={fadeUpVariants} whileHover={{ scale: 1.02 }}>
                  <CyberPanel 
                    className="h-full bg-black/60 backdrop-blur-2xl border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden group" 
                    scanline
                  >
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-30 ${vec.bg}`} />
                    
                    <div className="flex items-start justify-between mb-8">
                       <div className={`p-4 bg-white/5 border ${vec.border}/30 rounded-2xl group-hover:${vec.border} transition-colors duration-500 backdrop-blur-md`}>
                          <Icon className={`w-8 h-8 ${vec.color}`} />
                       </div>
                       <div className="flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                         <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                         <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                       </div>
                    </div>
                    
                    <h3 className="text-2xl font-outfit font-bold text-white mb-3 tracking-wide">{vec.title}</h3>
                    <p className="text-base font-mono text-text-secondary leading-relaxed">{vec.desc}</p>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-xs font-mono text-text-muted uppercase tracking-widest group-hover:text-white transition-colors">
                         Select in Dashboard
                       </span>
                       <Code2 className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                    </div>
                  </CyberPanel>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
