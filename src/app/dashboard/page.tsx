"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatBlock } from "@/components/shared/StatBlock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PipelineStatusBar } from "@/components/dashboard/PipelineStatusBar";
import { ActiveThreatsList } from "@/components/dashboard/ActiveThreatsList";
import { AIReasoningStream } from "@/components/dashboard/AIReasoningStream";
import { TelemetryPacketFeed } from "@/components/dashboard/TelemetryPacketFeed";
import { NetworkTopology } from "@/components/visualization/NetworkTopology";
import { ThreatScoreChart } from "@/components/visualization/ThreatScoreChart";
import { NetworkTrafficChart } from "@/components/visualization/NetworkTrafficChart";
import { threatTone } from "@/lib/nav";

export default function DashboardPage() {
  const globalThreatScore = useSimulationStore((s) => s.globalThreatScore);
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const traffic = useSimulationStore((s) => s.systemHealth.networkTraffic);
  const confidence = useSimulationStore((s) => s.aiReasoningState.confidence);
  const events = useSimulationStore((s) => s.telemetryEvents.length);

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full">
      <PageHeader title="Command center" description="Detection, deception, and response on a simulated network." />

      <PipelineStatusBar />

      <Panel className="grid grid-cols-2 divide-y md:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <StatBlock label="Threat score" value={globalThreatScore} unit="/100" tone={threatTone(globalThreatScore)}>
          <ThreatScoreChart />
        </StatBlock>
        <StatBlock
          label="Active incidents"
          value={activeThreats.length}
          tone={activeThreats.length > 0 ? "danger" : "default"}
          hint={activeThreats.length === 0 ? "Nothing open" : `${activeThreats.filter((t) => t.severity === "CRITICAL").length} critical`}
        />
        <StatBlock label="Network traffic" value={Math.round(traffic)} unit="Mbps">
          <NetworkTrafficChart />
        </StatBlock>
        <StatBlock label="AI confidence" value={confidence} unit="%" hint="Latest reasoning pass" />
      </Panel>

      <div className="grid min-h-0 gap-4 lg:flex-1 lg:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-4 lg:col-span-2">
          <Panel className="min-h-[300px] flex-1">
            <PanelHeader title="Deception map" description="Production on the left, twins on the right" actions={<StatusBadge label="Simulated" tone="accent" live />} />
            <PanelBody padded={false}>
              <NetworkTopology />
            </PanelBody>
          </Panel>
          <Panel className="h-56 shrink-0">
            <PanelHeader title="Telemetry" description={`${events} events in buffer`} />
            <PanelBody padded={false}>
              <TelemetryPacketFeed />
            </PanelBody>
          </Panel>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <Panel className="min-h-[220px] flex-[2]">
            <PanelHeader title="Active threats" actions={<span className="font-mono text-xs text-ink-subtle">{activeThreats.length}</span>} />
            <PanelBody padded={false} scroll>
              <ActiveThreatsList />
            </PanelBody>
          </Panel>
          <Panel className="min-h-[260px] flex-[3]">
            <PanelHeader title="AI reasoning" />
            <PanelBody padded={false}>
              <AIReasoningStream />
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
