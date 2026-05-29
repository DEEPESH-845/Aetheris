"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Network, Server, Shield, Database, Lock, Cpu, Globe } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';
import Link from 'next/link';

const springTransition: any = { type: "spring", bounce: 0, duration: 0.8 };
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yGraphic = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#06060c] text-foreground overflow-x-hidden selection:bg-neon-cyan/30 relative">
      <SiteHeader />
      
      {/* Noise overlay for cinematic texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <main className="pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 max-w-[1400px] mx-auto mb-32 min-h-[60vh] flex items-center">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-neon-magenta/5 rounded-full blur-[100px] pointer-events-none" />

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            style={{ opacity: opacityFade }}
            className="flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full"
          >
            <motion.div style={{ y: yText }} className="flex-1 space-y-6">
              <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-text-muted text-[10px] font-mono tracking-widest backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-cyan"></span>
                </span>
                SYSTEM ARCHITECTURE V9.0
              </motion.div>
              
              <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl lg:text-8xl font-outfit font-bold text-white leading-[1.05] tracking-tight">
                Architected for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-magenta animate-gradient-x">
                  Global Defense.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUpVariants} className="text-text-secondary text-lg md:text-xl font-mono max-w-2xl leading-relaxed">
                AETHERIS is built on a decentralized, event-driven mesh architecture. The platform combines kernel-level eBPF telemetry with real-time vector memory clustering, enabling our autonomous AI agent to seamlessly orchestrate deceptive infrastructure provisioning at the edge.
              </motion.p>

              <motion.div variants={fadeUpVariants} className="pt-6">
                <Link href="/dashboard">
                  <CyberButton variant="primary" className="h-12 px-8 group overflow-hidden">
                    <span className="relative z-10">ACCESS COMMAND CENTER</span>
                    <div className="absolute inset-0 bg-neon-cyan/20 blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </CyberButton>
                </Link>
              </motion.div>
            </motion.div>

            {/* Abstract SVG / Framer Graphic */}
            <motion.div 
              variants={fadeUpVariants}
              style={{ y: yGraphic }}
              className="flex-1 w-full relative h-[400px] lg:h-[500px] flex items-center justify-center perspective-[1200px]"
            >
              <motion.div 
                animate={{ rotateX: [20, 15, 20], rotateY: [-20, -15, -20], y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-64 h-64 md:w-80 md:h-80 border border-white/10 rounded-[2rem] bg-black/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,243,255,0.05)] flex items-center justify-center group"
              >
                 <div className="absolute inset-0 border border-neon-cyan/20 rounded-[2rem] animate-[pulse_4s_ease-in-out_infinite]" />
                 <Server className="w-24 h-24 text-neon-cyan drop-shadow-[0_0_20px_rgba(0,243,255,0.4)] group-hover:scale-110 transition-transform duration-700 ease-out" />
                 
                 {/* Floating nodes */}
                 <motion.div 
                   animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-12 -left-12 p-5 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl"
                 >
                   <Globe className="w-8 h-8 text-blue-400" />
                 </motion.div>
                 
                 <motion.div 
                   animate={{ y: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -bottom-12 -right-12 p-5 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl"
                 >
                   <Lock className="w-8 h-8 text-neon-magenta" />
                 </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto relative z-10 pb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerVariants}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-5xl font-outfit font-bold text-white mb-4">Core Infrastructure</motion.h2>
            <motion.p variants={fadeUpVariants} className="text-text-muted font-mono text-sm uppercase tracking-widest">Built to handle terabytes of telemetry per second.</motion.p>
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
                <motion.div key={i} variants={fadeUpVariants} whileHover={{ y: -8, scale: 1.02 }} className="h-full">
                  <div className="h-full bg-black/40 backdrop-blur-2xl border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-8 group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/30 transition-all duration-500 relative z-10">
                      <Icon className="w-5 h-5 text-text-secondary group-hover:text-neon-cyan transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-outfit font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors relative z-10">{cap.title}</h3>
                    <p className="text-sm font-mono text-text-muted leading-relaxed relative z-10">{cap.desc}</p>
                  </div>
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
