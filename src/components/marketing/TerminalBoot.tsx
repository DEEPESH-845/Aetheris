"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Unlock, Fingerprint, Activity } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

const bootSequence = [
  "INITIALIZING NEURAL KERNEL...",
  "LOADING HEURISTIC MODELS...",
  "ESTABLISHING QUANTUM ENCRYPTION...",
  "CONNECTING TO GLOBAL THREAT INTEL...",
  "CALIBRATING AUTONOMOUS RESPONSE ENGINES...",
  "SYSTEM ONLINE. AWAITING AUTHORIZATION."
];

export function TerminalBoot() {
  const router = useRouter();
  const [bootIndex, setBootIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (bootIndex < bootSequence.length) {
      const timer = setTimeout(() => setBootIndex(prev => prev + 1), 600 + Math.random() * 400);
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
    <div className="w-full h-full min-h-[320px] bg-cyber-darker border border-white/10 rounded-sm relative overflow-hidden flex flex-col font-mono shadow-[0_0_40px_rgba(0,243,255,0.05)]">
      {/* Terminal Header */}
      <div className="h-8 bg-black/60 border-b border-white/10 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>
        <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase ml-2">aetheris-core-v9.4.2</span>
      </div>

      {/* Terminal Body */}
      <div className="p-6 relative flex-1 flex flex-col justify-center">
        {/* Scanline inside panel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!bootComplete ? (
            <motion.div 
              key="booting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 relative z-10"
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
                  className="text-[11px] md:text-xs text-text-secondary"
                >
                  &gt; {line}
                </motion.div>
              ))}
              {bootIndex < bootSequence.length && (
                <motion.div 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-neon-cyan text-xs inline-block"
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
              className="flex flex-col items-center justify-center h-full space-y-6 relative z-10"
            >
              {!authenticating ? (
                <>
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-80" />
                    <p className="text-sm text-text-secondary mb-1">SYSTEM LOCKED</p>
                    <p className="text-[10px] md:text-xs text-text-muted">Biometric or Key verification required</p>
                  </div>
                  <CyberButton onClick={handleAuth} variant="primary" className="w-full max-w-[200px]" icon={<Fingerprint className="w-4 h-4" />}>
                    Authenticate
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
                      <p className="text-neon-green font-bold tracking-widest uppercase text-sm">Access Granted</p>
                    </motion.div>
                  ) : (
                    <>
                      <Activity className="w-12 h-12 text-neon-magenta animate-spin" />
                      <p className="text-neon-magenta text-[10px] md:text-xs animate-pulse">Verifying Credentials...</p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
