"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSimulationStore } from "@/store/useSimulationStore";
import { tooltipStyle, useChartColors } from "./chart-theme";

export function NetworkTrafficChart() {
  const traffic = useSimulationStore((s) => s.systemHealth.networkTraffic);
  const colors = useChartColors();
  const [data, setData] = useState(() => Array.from({ length: 24 }, (_, i) => ({ t: i, mbps: 200 })));

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => [
        ...prev.slice(1),
        { t: prev[prev.length - 1].t + 1, mbps: Math.round(traffic * (0.85 + Math.random() * 0.3)) },
      ]);
    }, 1000);
    return () => clearInterval(id);
  }, [traffic]);

  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 48 }}>
      <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
        <Tooltip
          cursor={{ fill: colors.border }}
          {...tooltipStyle(colors)}
          formatter={(v) => [`${v}\u00a0Mbps`, "Traffic"]}
        />
        <Bar dataKey="mbps" fill={colors.muted} fillOpacity={0.55} isAnimationActive={false} radius={[1, 1, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
