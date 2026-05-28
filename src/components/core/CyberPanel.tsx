"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CyberPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'outline' | 'ghost';
  glowColor?: 'cyan' | 'magenta' | 'red' | 'purple' | 'none';
  scanline?: boolean;
}

const glowVariants = {
  cyan: 'hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]',
  magenta: 'hover:border-neon-magenta/50 hover:shadow-[0_0_15px_rgba(255,0,255,0.2)]',
  red: 'hover:border-neon-red/50 hover:shadow-[0_0_15px_rgba(255,42,42,0.2)]',
  purple: 'hover:border-neon-purple/50 hover:shadow-[0_0_15px_rgba(176,38,255,0.2)]',
  none: '',
};

export function CyberPanel({
  children,
  className,
  variant = 'default',
  glowColor = 'cyan',
  scanline = false,
  ...props
}: CyberPanelProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-sm border overflow-hidden',
        variant === 'default' && 'bg-cyber-panel border-white/10 backdrop-blur-md',
        variant === 'interactive' && 'glass-panel glass-panel-interactive cursor-pointer',
        variant === 'outline' && 'bg-transparent border-white/20',
        variant === 'ghost' && 'bg-transparent border-transparent',
        scanline && 'scanline-bg',
        glowColor !== 'none' && glowVariants[glowColor],
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      <div className="relative z-10 w-full h-full p-4">
        {children}
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 z-20 pointer-events-none" />
    </motion.div>
  );
}
