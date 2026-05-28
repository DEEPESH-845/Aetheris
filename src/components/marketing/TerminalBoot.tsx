"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Unlock, Fingerprint, Loader2 } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

const bootSequence = [
  "INITIALIZING NEURAL KERNEL...",
  "LOADING HEURISTIC MODELS...",
  "ESTABLISHING QUANTUM ENCRYPTION...",
  "CONNECTING TO GLOBAL THREAT INTEL...",
  "CALIBRATING AUTONOMOUS RESPONSE ENGINES...",
  "SYSTEM ONLINE. AWAITING AUTHORIZATION."
];

const springTransition = { type: "spring", bounce: 0, duration: 0.8 };

export function TerminalBoot() {
  const router = useRouter();
  const [bootIndex, setBootIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (bootIndex < bootSequence.length) {
      const timer = setTimeout(() => setBootIndex(prev => prev + 1), 400 + Math.random() * 300);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setBootComplete(true), 400);
    }
  }, [bootIndex]);

  const handleAuth = () => {
    setAuthenticating(true);
    setTimeout(() => {
      setAuthSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    }, 1800);
  };

  return (
    <motion.div 
      layoutId="terminal-boot-container"
      transition={springTransition}
      className="w-full h-full min-h-[320px] bg-[#050505] border border-white/5 rounded-xl relative overflow-hidden flex flex-col font-mono shadow-[0_0_80px_rgba(0,243,255,0.03)]"
    >
      {/* Terminal Header */}
      <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center px-4 gap-3 backdrop-blur-md z-20 relative">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-neon-red/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-yellow-400/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-neon-green/80 transition-colors" />
        </div>
        <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase ml-2 flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          aetheris-core-v9.4.2
        </span>
      </div>

      {/* Terminal Body */}
      <div className="p-8 relative flex-1 flex flex-col justify-center overflow-hidden">
        {/* Subtle glowing orb in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!bootComplete ? (
            <motion.div 
              key="booting"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
              transition={springTransition}
              className="space-y-3 relative z-10"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4 text-neon-cyan" />
                </motion.div>
                <span className="text-neon-cyan uppercase text-xs tracking-widest">Boot Sequence Initiated</span>
              </div>
              {bootSequence.slice(0, bootIndex).map((line, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  className="text-xs md:text-sm text-text-secondary tracking-wide"
                >
                  <span className="text-neon-magenta/70 mr-2">&gt;</span> {line}
                </motion.div>
              ))}
              {bootIndex < bootSequence.length && (
                <motion.div 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="text-neon-cyan text-sm inline-block ml-2"
                >
                  █
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full relative z-10"
            >
              {!authenticating ? (
                <motion.div 
                  layout
                  className="flex flex-col items-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={springTransition}
                    className="relative mb-8 cursor-default"
                  >
                    <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full" />
                    <div className="w-20 h-20 rounded-full border border-white/10 bg-black flex items-center justify-center relative z-10">
                      <Lock className="w-8 h-8 text-neon-cyan" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-outfit font-light text-white tracking-widest mb-2">SYSTEM LOCKED</h2>
                    <p className="text-xs text-text-muted uppercase tracking-widest">Biometric verification required</p>
                  </div>
                  <CyberButton 
                    onClick={handleAuth} 
                    variant="primary" 
                    className="w-[240px] h-12 shadow-[0_0_20px_rgba(0,243,255,0.15)] group"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      AUTHENTICATE
                    </span>
                  </CyberButton>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="flex flex-col items-center justify-center h-[200px]"
                >
                  {authSuccess ? (
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                      <div className="relative mb-6">
                         <div className="absolute inset-0 bg-neon-green/30 blur-2xl rounded-full" />
                         <div className="w-24 h-24 rounded-full border border-neon-green/30 bg-black flex items-center justify-center relative z-10">
                           <Unlock className="w-10 h-10 text-neon-green" strokeWidth={1.5} />
                         </div>
                      </div>
                      <p className="text-neon-green font-outfit font-light tracking-[0.2em] uppercase text-lg">Access Granted</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-neon-cyan animate-spin" />
                        <div className="w-12 h-12 rounded-full border-b-2 border-l-2 border-neon-magenta animate-[spin_2s_reverse_infinite] absolute top-2 left-2" />
                        <Fingerprint className="w-6 h-6 text-white/50 absolute top-5 left-5 opacity-50 pulse" />
                      </div>
                      <p className="text-white/60 text-xs font-mono tracking-[0.2em] animate-pulse">VERIFYING NEURAL SIGNATURE...</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
