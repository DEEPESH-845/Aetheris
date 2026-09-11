"use client";

import { useMemo } from "react";
import { HardDrives, Database, Cloud, ShieldCheck, Laptop, type Icon } from "@phosphor-icons/react";
import { useSimulationStore, type NetworkNode } from "@/store/useSimulationStore";
import { cn } from "@/lib/utils";

const nodeIcons: Record<NetworkNode["type"], Icon> = {
  server: HardDrives,
  database: Database,
  cloud: Cloud,
  firewall: ShieldCheck,
  endpoint: Laptop,
};

// Fixed layout: production on the left, deception twins grouped on the right.
const nodePositions: Record<string, { x: number; y: number }> = {
  "fw-1": { x: 12, y: 50 },
  "web-cluster-1": { x: 32, y: 28 },
  "internal-api": { x: 32, y: 72 },
  "db-main": { x: 52, y: 28 },
  "cloud-storage": { x: 52, y: 72 },
  "honey-api-proxy": { x: 74, y: 58 },
  "honey-db-1": { x: 90, y: 80 },
};

const statusStyles: Record<NetworkNode["status"], { box: string; label: string }> = {
  healthy: { box: "border-border-strong text-ink-muted", label: "Healthy" },
  warning: { box: "border-accent text-accent", label: "Warning" },
  compromised: { box: "border-danger bg-danger-soft text-danger", label: "Compromised" },
  isolated: { box: "border-dashed border-border-strong text-ink-subtle opacity-70", label: "Isolated" },
  redirected: { box: "border-accent bg-accent-soft text-accent", label: "Redirected to twin" },
};

interface NetworkTopologyProps {
  searchQuery?: string;
  /** Static render for previews: no hover affordance. */
  interactive?: boolean;
}

export function NetworkTopology({ searchQuery = "", interactive = true }: NetworkTopologyProps) {
  const networkNodes = useSimulationStore((s) => s.networkNodes);
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const nodes = useMemo(() => Object.values(networkNodes), [networkNodes]);
  const q = searchQuery.trim().toLowerCase();

  const edges = useMemo(() => {
    const list: { id: string; from: string; to: string; threat: boolean; deceptive: boolean }[] = [];
    for (const node of nodes) {
      for (const to of node.connections) {
        const target = networkNodes[to];
        list.push({
          id: `${node.id}-${to}`,
          from: node.id,
          to,
          deceptive: Boolean(target?.isHoneyNode || node.isHoneyNode),
          threat: activeThreats.some((t) => t.targetNode === to || t.targetNode === node.id),
        });
      }
    }
    return list;
  }, [nodes, networkNodes, activeThreats]);

  return (
    <div className="relative h-full w-full overflow-hidden" role="img" aria-label="Network topology map">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {edges.map((edge) => {
          const a = nodePositions[edge.from];
          const b = nodePositions[edge.to];
          if (!a || !b) return null;
          const stroke = edge.threat
            ? "var(--color-danger)"
            : edge.deceptive
              ? "var(--color-accent)"
              : "var(--color-border-strong)";
          return (
            <line
              key={edge.id}
              x1={`${a.x}%`}
              y1={`${a.y}%`}
              x2={`${b.x}%`}
              y2={`${b.y}%`}
              stroke={stroke}
              strokeWidth={edge.threat || edge.deceptive ? 1.5 : 1}
              strokeDasharray={edge.threat || edge.deceptive ? "6 6" : undefined}
              style={edge.threat || edge.deceptive ? { animation: "dash 1.2s linear infinite" } : undefined}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        const NodeIcon = nodeIcons[node.type];
        const style = statusStyles[node.status];
        const matched = q.length > 0 && (node.id.toLowerCase().includes(q) || node.label.toLowerCase().includes(q));
        return (
          <div
            key={node.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-control border bg-surface-2 transition-[border-color,background-color,color] duration-200",
                style.box,
                node.isHoneyNode && node.status === "healthy" && "border-dashed border-accent/60 text-accent",
                matched && "ring-2 ring-ring",
                interactive && "hover:bg-surface-3",
              )}
              title={`${node.label}: ${style.label}`}
            >
              <NodeIcon size={20} aria-hidden="true" />
            </div>
            <div className="text-center">
              <div className="whitespace-nowrap text-xs text-ink">{node.label}</div>
              <div className="font-mono text-[11px] text-ink-subtle">
                {node.status === "healthy" ? `CPU ${node.cpuUsage}%` : style.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
