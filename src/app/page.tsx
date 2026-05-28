"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Terminal, Fingerprint, Lock, Unlock, Cpu, Activity } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

const bootSequence = [
  "INITIALIZING NEURAL KERNEL...",
  "LOADING HEURISTIC MODELS...",
  "ESTABLISHING QUANTUM ENCRYPTION...",
  "CONNECTING TO GLOBAL THREAT INTEL...",
  "CALIBRATING AUTONOMOUS RESPONSE ENGINES...",
  "SYSTEM ONLINE. AWAITING AUTHORIZATION."
];

export default function LandingPage() {
  const router = useRouter();
  const [bootIndex, setBootIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (bootIndex < bootSequence.length) {
      const timer = setTimeout(() => setBootIndex(prev => prev + 1), 800 + Math.random() * 500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setBootComplete(true), 500);
    }
  }, [bootIndex]);

  const handleAuth = () => {
    setAuthenticating(true);
    setTimeout(() => {
      setAuthSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-cyber-darker text-neon-cyan font-mono overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDAsMjQzLDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iMCIgeTE9IjIwIiB4Mj0iNDAiIHkyPSIyMCIvPjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjQwIi8+PC9nPjwvc3ZnPg==')] pointer-events-none" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-2xl w-full p-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <Shield className="w-24 h-24 text-neon-cyan relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-neon-cyan/30 rounded-full scale-150"
            />
             <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-0 border border-neon-magenta/20 rounded-full scale-[2]"
            />
          </div>
          
          <h1 className="text-5xl font-outfit font-bold text-white tracking-widest text-center mb-2">Aetheris<span className="text-neon-cyan">.ai</span></h1>
          <p className="text-sm tracking-[0.3em] text-neon-cyan/70 uppercase text-center">Autonomous Defense Platform</p>
        </motion.div>

        <div className="w-full max-w-md min-h-[250px] bg-black/60 border border-white/10 p-6 rounded-sm backdrop-blur-md relative overflow-hidden">
           {/* Scanline inside panel */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-30 pointer-events-none" />
           
           <AnimatePresence mode="wait">
             {!bootComplete ? (
                <motion.div 
                  key="booting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <Terminal className="w-4 h-4 text-neon-magenta" />
                    <span className="text-neon-magenta uppercase text-xs">Boot Sequence Initiated</span>
                  </div>
                  {bootSequence.slice(0, bootIndex).map((line, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-text-secondary"
                    >
                      &gt; {line}
                    </motion.div>
                  ))}
                  {bootIndex < bootSequence.length && (
                    <motion.div 
                      animate={{ opacity: [1, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="text-neon-cyan"
                    >
                      _
                    </motion.div>
                  )}
                </motion.div>
             ) : (
                <motion.div 
                  key="auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full space-y-6 pt-4"
                >
                  {!authenticating ? (
                    <>
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-80" />
                        <p className="text-sm text-text-secondary mb-1">SYSTEM LOCKED</p>
                        <p className="text-xs text-text-muted">Biometric or Key verification required</p>
                      </div>
                      <CyberButton onClick={handleAuth} variant="primary" className="w-full" icon={<Fingerprint className="w-4 h-4" />}>
                        Authenticate User
                      </CyberButton>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {authSuccess ? (
                        <motion.div 
                           initial={{ scale: 0.8, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="flex flex-col items-center"
                        >
                          <Unlock className="w-16 h-16 text-neon-green mb-4 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                          <p className="text-neon-green font-bold tracking-widest uppercase">Access Granted</p>
                        </motion.div>
                      ) : (
                        <>
                          <Activity className="w-12 h-12 text-neon-magenta animate-spin" />
                          <p className="text-neon-magenta text-sm animate-pulse">Verifying Credentials...</p>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
      
      <div className="absolute bottom-6 flex gap-8 text-[10px] text-text-muted/50 tracking-widest uppercase">
        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Core: Active</span>
        <span>Version: 9.4.2</span>
        <span>Status: Restricted Access</span>
      </div>
    </div>
  );
}
