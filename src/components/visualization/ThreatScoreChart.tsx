"use client";

import React, { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export function ThreatScoreChart() {
  const { globalThreatScore } = useSimulationStore();
  const [data, setData] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, score: 10 })));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1), { time: prevData[prevData.length - 1].time + 1, score: globalThreatScore }];
        return newData;
      });
    }, 1000); // update every second for the chart

    return () => clearInterval(interval);
  }, [globalThreatScore]);

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={globalThreatScore > 75 ? '#ff2a2a' : '#00f3ff'} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={globalThreatScore > 75 ? '#ff2a2a' : '#00f3ff'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020205', borderColor: 'rgba(0, 243, 255, 0.3)', borderRadius: '4px' }}
            itemStyle={{ color: '#00f3ff' }}
            labelStyle={{ display: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke={globalThreatScore > 75 ? '#ff2a2a' : '#00f3ff'} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
    </div>
  );
}
