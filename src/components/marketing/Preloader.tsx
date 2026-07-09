"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplitFlapDisplay } from "@/components/ui/split-flap-display";

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export function Preloader({ onComplete, duration = 3000 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [splitFlapSize, setSplitFlapSize] = useState<"sm" | "md" | "lg">("lg");

  useEffect(() => {
    const updateSize = () => {
      setSplitFlapSize(window.innerWidth < 640 ? "md" : "lg");
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyber-darker"
        >
          {/* Background grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDAsMjQzLDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iMCIgeTE9IjIwIiB4Mj0iNDAiIHkyPSIyMCIvPjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjQwIi8+PC9nPjwvc3ZnPg==')] pointer-events-none" />

          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            <SplitFlapDisplay
              text="AETHERIS"
              columns={10}
              size={splitFlapSize}
              accentColor="#00f3ff"
              showIndicators={true}
              staggerDelay={50}
              flipSpeed={40}
              className="mb-8"
            />

            <div className="w-64 mb-6">
              <div className="flex justify-between text-[10px] font-mono text-neon-cyan/70 mb-2 tracking-widest">
                <span>INITIALIZING</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-neon-cyan/20 blur-sm" />
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple relative z-10"
                />
              </div>
            </div>

            <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
              Autonomous Cyber Deception Platform
            </p>
          </motion.div>

          {/* Decorative corners */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-neon-cyan/20 opacity-50" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-neon-cyan/20 opacity-50" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-neon-magenta/20 opacity-50" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-neon-magenta/20 opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}