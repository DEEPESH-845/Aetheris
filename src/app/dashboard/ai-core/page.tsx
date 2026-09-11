"use client";

import { Check, Crosshair } from "@phosphor-icons/react";
import { useSimulationStore, type AIReasoningPhase, type MitreTTP } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatBlock } from "@/components/shared/StatBlock";
import { EmptyState } from "@/components/shared/EmptyState";
import { AIReasoningStream } from "@/components/dashboard/AIReasoningStream";
import { AttackerProfilePanel } from "@/components/dashboard/AttackerProfilePanel";
import { cn } from "@/lib/utils";

const GRAPH_PHASES: { id: AIReasoningPhase; label: string; description: string }[] = [
  { id: "INGEST", label: "IngestTelemetry", description: "Kafka consumer over Zeek, Suricata, and eBPF" },
  { id: "ENRICH", label: "EnrichContext", description: "Qdrant RAG, GeoIP, and ASN lookup" },
  { id: "CORRELATE", label: "CorrelateKillChain", description: "MITRE ATT&CK mapping and clustering" },
  { id: "DECIDE", label: "FormulateMitigation", description: "Strategy scoring and policy evaluation" },
  { id: "EXECUTE", label: "ExecuteDeception", description: "eBPF redirect, twin deploy, IOC extraction" },
];

function LangGraphState() {
  const { currentPhase, isThinking, confidence, vectorDbHits, modelLatency } = useSimulationStore((s) => s.aiReasoningState);
  const currentIdx = GRAPH_PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 divide-x border-b">
        <StatBlock label="Confidence" value={confidence} unit="%" className="p-3" />
        <StatBlock label="RAG hits" value={vectorDbHits} className="p-3" />
        <StatBlock label="Latency" value={modelLatency} unit="ms" className="p-3" />
      </div>
      <ol className="flex flex-col">
        {GRAPH_PHASES.map((phase, i) => {
          const isActive = i === currentIdx;
          const isPast = currentIdx > i;
          return (
            <li
              key={phase.id}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "grid grid-cols-[1.25rem_1fr] items-start gap-3 border-b px-4 py-3 last:border-b-0",
                isActive && "bg-accent-soft/60",
              )}
            >
              <span className="flex h-5 items-center justify-center">
                {isPast ? (
                  <Check size={14} className="text-success" aria-label="Completed" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full",
                      isActive ? "bg-accent" : "bg-surface-3",
                      isActive && isThinking && "animate-pulse",
                    )}
                  />
                )}
              </span>
              <div className="min-w-0">
                <div className={cn("font-mono text-sm", isActive ? "text-accent" : isPast ? "text-ink" : "text-ink-muted")}>
                  {phase.label}
                </div>
                <div className="text-xs text-ink-subtle">{phase.description}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TtpCard({ ttp }: { ttp: MitreTTP }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1 rounded-control border bg-surface-2 p-3 animate-in fade-in duration-200",
        !ttp.observed && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-accent">{ttp.technique}</span>
        {ttp.observed && <span className="font-mono text-xs tabular-nums text-ink-muted">{ttp.confidence}%</span>}
      </div>
      <div className="text-sm text-ink">{ttp.name}</div>
      <div className="text-xs text-ink-subtle">{ttp.tactic}</div>
    </li>
  );
}

export default function AICorePage() {
  const attackerProfiles = useSimulationStore((s) => s.attackerProfiles);
  const profiles = Object.values(attackerProfiles);
  const allTtps = profiles.flatMap((p) => p.ttps);
  const observed = allTtps.filter((t) => t.observed).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader title="AI core" description="LangGraph state, MITRE correlation, and attribution for the current threat." />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
        <Panel className="min-h-[320px]">
          <PanelHeader title="Reasoning graph" description="LangGraph state machine" />
          <PanelBody padded={false} scroll>
            <LangGraphState />
          </PanelBody>
        </Panel>

        <Panel className="min-h-[320px]">
          <PanelHeader title="MITRE ATT&CK correlation" actions={<span className="font-mono text-xs text-ink-subtle">{observed} observed</span>} />
          <PanelBody scroll>
            {allTtps.length === 0 ? (
              <EmptyState icon={Crosshair} title="No techniques correlated" hint="TTPs appear once a threat reaches the correlation phase." />
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {allTtps.map((ttp, i) => (
                  <TtpCard key={`${ttp.technique}-${i}`} ttp={ttp} />
                ))}
              </ul>
            )}
          </PanelBody>
        </Panel>

        <div className="flex min-h-0 flex-col gap-4">
          <Panel className="min-h-[200px] flex-1">
            <PanelHeader title="Attacker profiles" actions={<span className="font-mono text-xs text-ink-subtle">{profiles.length} tracked</span>} />
            <PanelBody padded={false} scroll>
              <AttackerProfilePanel />
            </PanelBody>
          </Panel>
          <Panel className="h-72 shrink-0">
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
