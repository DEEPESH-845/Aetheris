"use client";

import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { NetworkTopology } from "@/components/visualization/NetworkTopology";
import { cn } from "@/lib/utils";

function Stat({ label, value, tone }: { label: string; value: number; tone?: "danger" | "muted" }) {
  return (
    <div className="flex flex-col px-4 first:pl-0 last:pr-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className={cn("font-mono text-lg leading-tight tabular-nums", tone === "danger" && value > 0 ? "text-danger" : "text-ink")}>
        {value}
      </span>
    </div>
  );
}

export default function TopologyPage() {
  const networkNodes = useSimulationStore((s) => s.networkNodes);
  const [query, setQuery] = useState("");
  const nodes = Object.values(networkNodes);
  const compromised = nodes.filter((n) => n.status === "compromised").length;
  const isolated = nodes.filter((n) => n.status === "isolated").length;
  const redirected = nodes.filter((n) => n.status === "redirected").length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title="Network topology"
        description="Live asset state and the paths an attacker is being steered along."
        actions={
          <div className="flex divide-x">
            <Stat label="Nodes" value={nodes.length} />
            <Stat label="Compromised" value={compromised} tone="danger" />
            <Stat label="Redirected" value={redirected} />
            <Stat label="Isolated" value={isolated} tone="muted" />
          </div>
        }
      />

      <Panel className="min-h-[420px] flex-1">
        <PanelHeader
          title="Deception map"
          actions={
            <>
              <div className="relative">
                <MagnifyingGlass size={14} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-ink-subtle" />
                <Input
                  type="search"
                  name="node"
                  aria-label="Search nodes"
                  placeholder="Find a node…"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-7 w-48 pl-7 text-xs"
                />
              </div>
              <StatusBadge label="Synced" tone="success" live />
            </>
          }
        />
        <PanelBody padded={false}>
          <NetworkTopology searchQuery={query} />
        </PanelBody>
      </Panel>
    </div>
  );
}
