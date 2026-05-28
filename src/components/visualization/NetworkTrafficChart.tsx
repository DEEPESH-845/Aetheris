"use client";

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export function NetworkTrafficChart() {
  const { systemHealth } = useSimulationStore();
  const [data, setData] = useState(Array.from({ length: 15 }, (_, i) => ({ time: i, traffic: Math.random() * 500 + 200 })));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newTraffic = systemHealth.networkTraffic * (0.8 + Math.random() * 0.4); // Add some jitter
        return [...prevData.slice(1), { time: prevData[prevData.length - 1].time + 1, traffic: newTraffic }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [systemHealth.networkTraffic]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="time" hide />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 243, 255, 0.1)' }}
            contentStyle={{ backgroundColor: '#020205', borderColor: 'rgba(0, 243, 255, 0.3)', borderRadius: '4px' }}
            itemStyle={{ color: '#00f3ff' }}
            labelStyle={{ display: 'none' }}
          />
          <Bar 
            dataKey="traffic" 
            fill="#00f3ff" 
            fillOpacity={0.8}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
