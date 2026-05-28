"use client";

import React, { useMemo } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion } from 'framer-motion';
import { Server, Database, Cloud, Shield, Laptop } from 'lucide-react';
import { cn } from '@/utils/cn';

const nodeIcons = {
  server: Server,
  database: Database,
  cloud: Cloud,
  firewall: Shield,
  endpoint: Laptop,
};

// Fixed positions for the mock network to make it look like a clean enterprise architecture
const nodePositions: Record<string, { x: number, y: number }> = {
  'fw-1': { x: 20, y: 50 },
  'web-cluster-1': { x: 50, y: 30 },
  'internal-api': { x: 50, y: 70 },
  'db-main': { x: 80, y: 30 },
  'cloud-storage': { x: 80, y: 70 },
};

export function NetworkTopology({ searchQuery = '' }: { searchQuery?: string }) {
  const { networkNodes, activeThreats } = useSimulationStore();

  const nodes = Object.values(networkNodes);
  const searchLower = searchQuery.toLowerCase();

  // Generate edges based on connections
  const edges = useMemo(() => {
    const list: { source: string, target: string, id: string, hasThreat: boolean }[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        // Check if there is an active threat targeting this path (mock logic: if threat targets the targetNode)
        const hasThreat = activeThreats.some(t => t.targetNode === targetId || t.targetNode === node.id);
        list.push({ source: node.id, target: targetId, id: `${node.id}-${targetId}`, hasThreat });
      });
    });
    return list;
  }, [nodes, activeThreats]);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'compromised': return 'text-neon-red border-neon-red shadow-[0_0_15px_rgba(255,42,42,0.5)]';
      case 'warning': return 'text-yellow-400 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
      case 'isolated': return 'text-text-muted border-text-muted opacity-50';
      default: return 'text-neon-cyan border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]';
    }
  };

  return (
    <div className="w-full h-full relative bg-cyber-darker/50 rounded-sm overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIHgxPSIwIiB5MT0iMjAiIHgyPSI0MCIgeTI9IjIwIi8+PGxpbmUgeDE9IjIwIiB5MT0iMCIgeDI9IjIwIiB5Mj0iNDAiLz48L2c+PC9zdmc+')] pointer-events-none" />

      {/* Edges layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {edges.map(edge => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;

          return (
            <g key={edge.id}>
              <line
                x1={`${sourcePos.x}%`}
                y1={`${sourcePos.y}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
                stroke={edge.hasThreat ? '#ff2a2a' : 'rgba(0, 243, 255, 0.2)'}
                strokeWidth={edge.hasThreat ? 2 : 1}
                strokeDasharray={edge.hasThreat ? "4 4" : "none"}
              />
              {/* Traffic animation dot */}
              {!edge.hasThreat && (
                <circle r="2" fill="#00f3ff">
                  <animateMotion
                    dur={`${2 + Math.random()}s`}
                    repeatCount="indefinite"
                    path={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`} // This is a rough approximation, SVG paths need absolute pixels ideally, but % works in some browsers, otherwise we use CSS or re-calculate on resize.
                    // Actually, animateMotion with % doesn't work well across browsers. Let's use CSS or just skip the moving dot for now and use a stroke dash animation.
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* CSS-based animated edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
         {edges.map(edge => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;

          return (
             <line
                key={`${edge.id}-anim`}
                x1={`${sourcePos.x}%`}
                y1={`${sourcePos.y}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
                stroke={edge.hasThreat ? 'rgba(255, 42, 42, 0.8)' : 'rgba(0, 243, 255, 0.8)'}
                strokeWidth={1.5}
                strokeDasharray="4 12"
                className="animate-[dash_2s_linear_infinite]"
              />
          );
         })}
      </svg>

      {/* Nodes layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {nodes.map(node => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          
          const Icon = nodeIcons[node.type];
          
              const isMatched = searchLower && (node.id.toLowerCase().includes(searchLower) || node.label.toLowerCase().includes(searchLower));
              
              return (
                <motion.div
                  key={node.id}
                  className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  whileHover={{ scale: 1.1 }}
                  animate={isMatched ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isMatched ? Infinity : 0, duration: 1 }}
                >
                  {/* Node glow effect based on status */}
                  {node.status === 'compromised' && (
                    <div className="absolute inset-0 bg-neon-red/30 blur-xl rounded-full animate-pulse" />
                  )}
                  {isMatched && (
                    <div className="absolute inset-0 bg-white/40 blur-md rounded-full animate-pulse" />
                  )}
                  
                  <div className={cn(
                    "w-12 h-12 rounded-sm border bg-black/60 flex items-center justify-center relative backdrop-blur-sm transition-colors duration-300",
                    getNodeColor(node.status),
                    isMatched && "border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  )}>
                    <Icon className="w-6 h-6 relative z-10" />
                
                {/* Node scanning line */}
                <div className="absolute inset-0 overflow-hidden rounded-sm pointer-events-none">
                   <div className="w-full h-[1px] bg-white/30 absolute top-0 animate-[scan-anim_2s_linear_infinite]" />
                </div>
              </div>
              
              {/* Node Label */}
              <div className="mt-2 text-center">
                <div className="text-xs font-mono text-white font-bold bg-black/50 px-2 py-0.5 rounded-sm border border-white/10">
                  {node.label}
                </div>
                <div className="text-[9px] font-mono text-text-secondary mt-1">
                  CPU: {node.cpuUsage}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}} />
    </div>
  );
}
