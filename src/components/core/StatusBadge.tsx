"use client";

import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export type StatusType = 'healthy' | 'warning' | 'critical' | 'neutral' | 'active' | 'mitigating';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, label, className, pulse = true }: StatusBadgeProps) {
  const statusConfig = {
    healthy: { bg: 'bg-neon-green/20', text: 'text-neon-green', border: 'border-neon-green/50', dot: 'bg-neon-green' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', dot: 'bg-yellow-400' },
    critical: { bg: 'bg-neon-red/20', text: 'text-neon-red', border: 'border-neon-red/50', dot: 'bg-neon-red' },
    neutral: { bg: 'bg-white/10', text: 'text-text-secondary', border: 'border-white/20', dot: 'bg-text-secondary' },
    active: { bg: 'bg-neon-cyan/20', text: 'text-neon-cyan', border: 'border-neon-cyan/50', dot: 'bg-neon-cyan' },
    mitigating: { bg: 'bg-neon-purple/20', text: 'text-neon-purple', border: 'border-neon-purple/50', dot: 'bg-neon-purple' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border text-xs font-mono font-medium tracking-wide uppercase",
      config.bg, config.text, config.border, className
    )}>
      <div className="relative flex items-center justify-center w-2 h-2">
        {pulse && (
          <motion.div
            className={cn("absolute inset-0 rounded-full", config.dot)}
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <div className={cn("relative w-1.5 h-1.5 rounded-full", config.dot)} />
      </div>
      {label || status}
    </div>
  );
}
