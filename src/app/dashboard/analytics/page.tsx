"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatBlock } from "@/components/shared/StatBlock";
import { ThreatScoreChart } from "@/components/visualization/ThreatScoreChart";
import { NetworkTrafficChart } from "@/components/visualization/NetworkTrafficChart";

export default function AnalyticsPage() {
  const incidentLog = useSimulationStore((s) => s.incidentLog);
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const aiThoughts = useSimulationStore((s) => s.aiThoughts);

  const total = incidentLog.length;
  const critical = incidentLog.filter((t) => t.severity === "CRITICAL").length;
  const high = incidentLog.filter((t) => t.severity === "HIGH").length;
  const resolved = incidentLog.filter((t) => t.status === "RESOLVED").length;
  const avgConfidence = total > 0 ? Math.round(incidentLog.reduce((acc, t) => acc + t.confidence, 0) / total) : 0;
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Analytics" description="Incident volume, severity mix, and how the model has performed this session." />

      <Panel className="grid grid-cols-2 divide-y md:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <StatBlock label="Incidents" value={total} />
        <StatBlock label="Critical" value={critical} tone={critical > 0 ? "danger" : "default"} />
        <StatBlock label="High" value={high} tone={high > 0 ? "accent" : "default"} />
        <StatBlock label="Resolved" value={resolved} tone="success" hint={total > 0 ? `${resolvedRate}% of incidents` : undefined} />
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="h-72">
          <PanelHeader title="Threat score" description="Last 30 seconds" />
          <PanelBody className="p-3">
            <ThreatScoreChart showAxis />
          </PanelBody>
        </Panel>
        <Panel className="h-72">
          <PanelHeader title="Network traffic" description="Mbps, last 24 seconds" />
          <PanelBody className="p-3">
            <NetworkTrafficChart />
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="AI reasoning" />
        <div className="grid grid-cols-3 divide-x">
          <StatBlock label="Average confidence" value={avgConfidence} unit="%" />
          <StatBlock label="Open threats" value={activeThreats.length} tone={activeThreats.length > 0 ? "accent" : "default"} />
          <StatBlock label="Reasoning steps" value={aiThoughts.length} />
        </div>
      </Panel>
    </div>
  );
}
