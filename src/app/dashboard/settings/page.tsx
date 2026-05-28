"use client";

import React, { useState } from 'react';
import { CyberPanel } from '@/components/core/CyberPanel';
import { Settings, Sliders, ShieldCheck, Database, Radio, Save } from 'lucide-react';
import { CyberButton } from '@/components/core/CyberButton';

export default function SettingsPage() {
  const [aggressiveness, setAggressiveness] = useState(80);
  const [autonomousMitigation, setAutonomousMitigation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-outfit font-bold text-white mb-2 tracking-wide flex items-center gap-3">
          <Settings className="w-8 h-8 text-neon-cyan" />
          SYSTEM CONFIGURATION
        </h1>
        <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">Adjust AI operational parameters and global defense posture.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        
        {/* AI Parameters */}
        <CyberPanel variant="default" glowColor="purple" scanline className="h-fit">
           <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10 text-neon-purple font-mono uppercase">
              <Sliders className="w-5 h-5" />
              <h2>AI Heuristics Engine</h2>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-mono text-white">
                    <label>Response Aggressiveness</label>
                    <span className="text-neon-cyan">{aggressiveness}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={aggressiveness}
                   onChange={(e) => setAggressiveness(parseInt(e.target.value))}
                   className="w-full accent-neon-cyan cursor-pointer"
                 />
                 <p className="text-[10px] font-mono text-text-muted">Higher values increase false positives but reduce response latency.</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-sm">
                 <div>
                    <div className="text-sm font-mono text-white">Autonomous Mitigation</div>
                    <div className="text-[10px] font-mono text-text-secondary">Allow AI to execute countermeasures without human approval.</div>
                 </div>
                 <button 
                   onClick={() => setAutonomousMitigation(!autonomousMitigation)}
                   className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${autonomousMitigation ? 'bg-neon-cyan/20 border-neon-cyan/50' : 'bg-white/10 border-white/20'} border`}
                 >
                   <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${autonomousMitigation ? 'left-[26px] bg-neon-cyan shadow-[0_0_10px_#00f3ff]' : 'left-1 bg-text-muted'}`} />
                 </button>
              </div>
           </div>
        </CyberPanel>

        {/* Global Posture */}
        <CyberPanel variant="default" glowColor="cyan" className="h-fit">
           <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10 text-neon-cyan font-mono uppercase">
              <ShieldCheck className="w-5 h-5" />
              <h2>Defense Posture</h2>
           </div>
           
           <div className="space-y-3">
             {['DEFCON 1 (Critical)', 'DEFCON 2 (Severe)', 'DEFCON 3 (Elevated)', 'DEFCON 4 (Guarded)', 'DEFCON 5 (Standard)'].map((level, i) => (
               <div key={level} className={`p-3 border rounded-sm font-mono text-xs cursor-pointer transition-colors ${i === 4 ? 'bg-neon-cyan/10 border-neon-cyan/50 text-white' : 'bg-black/40 border-white/10 text-text-muted hover:border-white/30'}`}>
                 {level}
               </div>
             ))}
           </div>
        </CyberPanel>

        {/* Telemetry settings */}
        <CyberPanel variant="default" glowColor="magenta" className="h-fit">
           <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10 text-neon-magenta font-mono uppercase">
              <Radio className="w-5 h-5" />
              <h2>Telemetry Sensors</h2>
           </div>
           
           <div className="space-y-4 font-mono text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                 <input type="checkbox" defaultChecked className="accent-neon-magenta w-4 h-4 bg-transparent border-white/20" />
                 <span>Enable Deep Packet Inspection</span>
              </div>
              <div className="flex items-center gap-3">
                 <input type="checkbox" defaultChecked className="accent-neon-magenta w-4 h-4 bg-transparent border-white/20" />
                 <span>Correlate Dark Web Intel Feeds</span>
              </div>
              <div className="flex items-center gap-3">
                 <input type="checkbox" defaultChecked className="accent-neon-magenta w-4 h-4 bg-transparent border-white/20" />
                 <span>Monitor Insider Threat Vectors</span>
              </div>
              <div className="flex items-center gap-3">
                 <input type="checkbox" defaultChecked className="accent-neon-magenta w-4 h-4 bg-transparent border-white/20" />
                 <span>Real-time Cloud Asset Discovery</span>
              </div>
           </div>

           <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <CyberButton 
                onClick={handleSave} 
                variant={saved ? "outline" : "primary"} 
                icon={saved ? <ShieldCheck className="w-4 h-4 text-neon-green" /> : <Save className="w-4 h-4" />}
                className={saved ? "text-neon-green border-neon-green hover:border-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.4)]" : ""}
              >
                {saved ? "Configuration Applied" : "Apply Configuration"}
              </CyberButton>
           </div>
        </CyberPanel>

      </div>
    </div>
  );
}
