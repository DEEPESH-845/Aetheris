"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Network, Server, Shield, Database, Lock, Cpu, Globe } from 'lucide-react';
import { CyberPanel } from '@/components/core/CyberPanel';
import { CyberButton } from '@/components/core/CyberButton';
import Link from 'next/link';

const springTransition = { type: "spring", bounce: 0, duration: 0.8 };
const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: springTransition }
};

const capabilities = [
  { icon: Network, title: "Autonomous Routing", desc: "AI-driven network segmentation that reroutes traffic instantly during breaches." },
  { icon: Database, title: "Vector Memory RAG", desc: "Historical threat context retrieved sub-millisecond via embedding clustering." },
  { icon: Shield, title: "Zero-Trust Mesh", desc: "Every node authenticated, monitored, and verified in real-time." },
  { icon: Cpu, title: "Kernel-Level Hooks", desc: "Deep eBPF observability providing unmatched telemetry streams." },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen w-full bg-cyber-darker text-foreground overflow-x-hidden selection:bg-neon-cyan/30">
      <SiteHeader />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 max-w-[1400px] mx-auto mb-32">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-neon-magenta/5 rounded-full blur-[100px] pointer-events-none" />

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="flex flex-col lg:flex-row items-center gap-16 relative z-10"
          >
            <div className="flex-1 space-y-6">
              <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-xs font-mono tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                </span>
                SYSTEM ARCHITECTURE V9.0
              </motion.div>
              
              <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl font-outfit font-bold text-white leading-[1.1] tracking-tight">
                Architected for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">
                  Global Defense.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUpVariants} className="text-text-secondary text-lg md:text-xl font-mono max-w-2xl leading-relaxed">
                Aetheris leverages a decoupled, highly-scalable microservice mesh. 
                Combining LangGraph cognitive orchestrators with an asynchronous FastAPI telemetry ingestion layer.
              </motion.p>

              <motion.div variants={fadeUpVariants} className="pt-6">
                <Link href="/dashboard">
                  <CyberButton variant="primary" className="h-12 px-8">
                    ACCESS COMMAND CENTER
                  </CyberButton>
                </Link>
              </motion.div>
            </div>

            {/* Abstract SVG / Framer Graphic */}
            <motion.div 
              variants={fadeUpVariants}
              className="flex-1 w-full relative h-[400px] flex items-center justify-center perspective-[1000px]"
            >
              <div className="relative w-64 h-64 border border-white/10 rounded-3xl bg-black/50 backdrop-blur-3xl transform rotate-x-[20deg] rotate-y-[-20deg] shadow-[0_0_50px_rgba(0,243,255,0.1)] flex items-center justify-center group hover:rotate-x-[0deg] hover:rotate-y-[0deg] transition-transform duration-1000">
                 <div className="absolute inset-0 border border-neon-cyan/20 rounded-3xl animate-[pulse_4s_ease-in-out_infinite]" />
                 <Server className="w-20 h-20 text-neon-cyan drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] group-hover:scale-110 transition-transform duration-700" />
                 
                 {/* Floating nodes */}
                 <motion.div 
                   animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-10 -left-10 p-4 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md"
                 >
                   <Globe className="w-6 h-6 text-blue-400" />
                 </motion.div>
                 
                 <motion.div 
                   animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -bottom-10 -right-10 p-4 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md"
                 >
                   <Lock className="w-6 h-6 text-neon-magenta" />
                 </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-5xl font-outfit font-bold text-white mb-4">Core Infrastructure</motion.h2>
            <motion.p variants={fadeUpVariants} className="text-text-muted font-mono uppercase tracking-widest">Built to handle terabytes of telemetry per second.</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div key={i} variants={fadeUpVariants} whileHover={{ y: -8 }}>
                  <CyberPanel className="h-full bg-black/40 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-300 group" scanline>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/30 transition-all duration-300">
                      <Icon className="w-6 h-6 text-text-secondary group-hover:text-neon-cyan transition-colors" />
                    </div>
                    <h3 className="text-xl font-outfit font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">{cap.title}</h3>
                    <p className="text-sm font-mono text-text-muted leading-relaxed">{cap.desc}</p>
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
