"use client";

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { CyberPanel } from '@/components/core/CyberPanel';
import { StatusBadge } from '@/components/core/StatusBadge';
import { Target, Search, Filter, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThreatMonitorPage() {
  const { incidentLog } = useSimulationStore();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLogs = incidentLog.filter(log => {
    const matchesFilter = filter === 'ALL' || log.severity === filter;
    const matchesSearch = searchQuery === '' || 
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.sourceIp.includes(searchQuery) || 
      log.targetNode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
          <Target className="w-8 h-8 text-neon-cyan" />
          THREAT MONITOR & INCIDENT LOG
        </h1>
        <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Global incident history and autonomous response records.</p>
      </header>

      <div className="flex gap-4 items-center flex-shrink-0">
        <div className="flex bg-black/40 border border-white/10 rounded-sm p-1">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-colors ${filter === f ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-md relative">
           <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search incidents by IP, Node, or Type..." 
             className="w-full bg-black/40 border border-white/10 rounded-sm py-2 pl-9 pr-4 text-sm font-mono text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-white/20"
           />
        </div>
      </div>

      <CyberPanel className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 text-xs font-mono text-text-muted uppercase tracking-widest bg-black/20">
          <div className="col-span-1">Timestamp</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-2">Incident Type</div>
          <div className="col-span-1">Target Node</div>
          <div className="col-span-1">Status</div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50 p-8">
              <ShieldAlert className="w-12 h-12 mb-4 text-white/20" />
              <p className="font-mono">NO INCIDENTS RECORDED</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredLogs.map(log => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={log.id} 
                  className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="col-span-1 text-sm font-mono text-text-secondary group-hover:text-white">
                    {new Date(log.timestamp).toISOString().substring(11, 19)}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge 
                      status={log.severity === 'CRITICAL' ? 'critical' : log.severity === 'HIGH' ? 'warning' : 'neutral'} 
                      label={log.severity}
                      pulse={false}
                    />
                  </div>
                  <div className="col-span-2 text-sm font-mono text-white">
                    {log.type}
                    <div className="text-[10px] text-neon-magenta/70 mt-1 uppercase">Source: {log.sourceIp}</div>
                  </div>
                  <div className="col-span-1 text-sm font-mono text-neon-cyan truncate">
                    {log.targetNode}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge 
                      status={log.status === 'DETECTED' ? 'critical' : log.status === 'ANALYZING' ? 'warning' : log.status === 'MITIGATING' ? 'mitigating' : 'healthy'} 
                      label={log.status} 
                      pulse={log.status !== 'RESOLVED'}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CyberPanel>
    </div>
  );
}
