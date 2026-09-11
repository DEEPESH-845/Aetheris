"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { useSimulationStore } from "@/store/useSimulationStore";
import { tooltipStyle, useChartColors } from "./chart-theme";

interface ThreatScoreChartProps {
  showAxis?: boolean;
}

export function ThreatScoreChart({ showAxis = false }: ThreatScoreChartProps) {
  const globalThreatScore = useSimulationStore((s) => s.globalThreatScore);
  const colors = useChartColors();
  const [data, setData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, score: 12 })));

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => [...prev.slice(1), { t: prev[prev.length - 1].t + 1, score: globalThreatScore }]);
    }, 1000);
    return () => clearInterval(id);
  }, [globalThreatScore]);

  const stroke = globalThreatScore > 75 ? colors.danger : colors.accent;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: showAxis ? 0 : 0, bottom: 0 }}>
        <defs>
          <linearGradient id="threatFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxis && (
          <YAxis
            domain={[0, 100]}
            width={28}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.subtle, fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
          />
        )}
        <Tooltip {...tooltipStyle(colors)} formatter={(v) => [`${v}`, "Score"]} />
        <Area
          type="monotone"
          dataKey="score"
          stroke={stroke}
          strokeWidth={1.5}
          fill="url(#threatFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
