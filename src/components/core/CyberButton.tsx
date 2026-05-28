"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CyberButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300 overflow-hidden group";
    
    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    const variantStyles = {
      primary: "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:border-neon-cyan",
      danger: "bg-neon-red/10 text-neon-red border border-neon-red/50 hover:bg-neon-red/20 hover:shadow-[0_0_15px_rgba(255,42,42,0.4)] hover:border-neon-red",
      outline: "bg-transparent text-text-secondary border border-white/20 hover:border-white/50 hover:text-white",
      ghost: "bg-transparent text-text-secondary border border-transparent hover:bg-white/5 hover:text-white",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {/* Animated background scanline on hover */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:animate-[scan-anim_1.5s_linear_infinite]" />
        
        {/* Corner cutouts effect - visual flair */}
        <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-50" />
        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-50" />

        {icon && <span className="z-10">{icon as React.ReactNode}</span>}
        <span className="z-10 relative mt-[1px]">{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);
CyberButton.displayName = 'CyberButton';
