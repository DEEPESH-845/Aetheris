"use client";

import React from 'react';
import { motion } from 'framer-motion';

const integrations = [
  {
    name: 'Kubernetes',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.96 1L1.24 7.07l.38 5.61 5.09-3.26-.06 2.37-3.69 2.45v2.33l3.69 2.29.07 2.33L1.6 17.96l-.36 5.61 10.72 6.07 10.72-6.07-.36-5.61-5.11 3.23.07-2.33 3.69-2.29v-2.33l-3.69-2.45-.06-2.37 5.09 3.26.38-5.61L11.96 1zM9.54 13.91l2.42-1.39 2.42 1.39v2.79l-2.42 1.39-2.42-1.39v-2.79zm0-5.58l2.42-1.39 2.42 1.39v2.79l-2.42 1.39-2.42-1.39V8.33z" />
      </svg>
    )
  },
  {
    name: 'Cilium',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L2.14 5.63v12.74L12 24l9.86-5.63V5.63zM5.38 10.87l6.62 3.82 6.62-3.82v5.77l-6.62 3.82-6.62-3.82z" />
      </svg>
    )
  },
  {
    name: 'Kafka',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.73 7.82l-5.6-3.89c.12-.41.22-.84.28-1.28L18.4 5.61c-1.32.18-2.55.93-3.67 2.21zM9.06 4.39C7.62 5.09 6.42 6.16 5.6 7.42L.52 4.09c1.07-1.85 2.76-3.23 4.88-3.92l3.66 4.22zM4.1 9.38C3.86 10.23 3.73 11.11 3.73 12c0 1.25.21 2.47.61 3.63l-5.11 3.42C-1.34 16.94-1.66 14.54-1.66 12c0-1.21.16-2.39.46-3.52L4.1 9.38zm2.25 7.64c.95 1.09 2.15 1.95 3.51 2.53l-3.3 5.4c-2.06-.8-3.83-2.14-5.13-3.84l4.92-4.09zm6.65 2.24c1.23-.39 2.37-1.02 3.37-1.85l5.22 3.23c-1.57 1.54-3.54 2.62-5.74 3.11l-2.85-4.49zm6.54-3.57c.56-1.12.87-2.38.87-3.69 0-1.46-.35-2.87-1-4.14l5.31-3.11c.96 1.76 1.48 3.77 1.48 5.86 0 1.93-.44 3.76-1.22 5.42l-5.44-3.34z" />
      </svg>
    )
  },
  {
    name: 'ClickHouse',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 21.6h5.83V2.4H0v19.2zm9.08 0h5.83V9.67H9.08v11.93zm9.09 0H24v-6.55h-5.83v6.55z" />
      </svg>
    )
  },
  {
    name: 'LangGraph',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M7 12l5 5 5-10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
];

export function LogoWall() {
  return (
    <section className="py-12 border-y border-white/5 bg-cyber-darker/50 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cyber-darker to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cyber-darker to-transparent z-10 pointer-events-none" />
      
      <div className="flex overflow-hidden group">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex gap-16 lg:gap-32 items-center pr-16 lg:pr-32"
        >
          {/* Double map for endless scroll loop */}
          {[...integrations, ...integrations, ...integrations].map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 text-text-muted hover:text-white transition-colors duration-300 min-w-max grayscale hover:grayscale-0 opacity-50 hover:opacity-100"
            >
              {item.svg}
              <span className="font-sans font-medium text-lg tracking-wide">{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
