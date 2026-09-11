"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { Panel } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "danger";

function Metric({ label, value, unit, tone = "default" }: { label: string; value: React.ReactNode; unit?: string; tone?: Tone }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-2.5">
      <span className="truncate text-xs text-ink-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : "text-ink",
        )}
      >
        {value}
        {unit && <span className="ml-1 text-ink-subtle">{unit}</span>}
      </span>
    </div>
  );
}

export function PipelineStatusBar() {
  const pipelineHealth = useSimulationStore((s) => s.pipelineHealth);
  const isRunning = useSimulationStore((s) => s.isSimulationRunning);

  const kafkaTone: Tone = pipelineHealth.kafkaLag > 500 ? "danger" : pipelineHealth.kafkaLag > 100 ? "accent" : "default";
  const zeekTone: Tone = pipelineHealth.zeekHeartbeat > 100 ? "accent" : "default";
  const engaging = pipelineHealth.deceptionEngineStatus === "ENGAGING";

  return (
    <Panel className="flex-row flex-wrap items-stretch divide-x md:flex-nowrap" aria-label="Pipeline status">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <StatusBadge label={isRunning ? "Pipeline live" : "Pipeline paused"} tone={isRunning ? "success" : "neutral"} live={isRunning} />
      </div>
      <Metric label="Kafka lag" value={pipelineHealth.kafkaLag} unit="msg" tone={kafkaTone} />
      <Metric label="Zeek heartbeat" value={pipelineHealth.zeekHeartbeat} unit="ms" tone={zeekTone} />
      <Metric label="Suricata" value={pipelineHealth.suricataEventsPerSec} unit="evt/s" />
      <Metric label="eBPF probes" value={pipelineHealth.ebpfProbes} />
      <div className="flex items-center gap-2 px-4 py-2.5 md:ml-auto">
        <span className="text-xs text-ink-muted">Deception engine</span>
        <StatusBadge
          label={pipelineHealth.deceptionEngineStatus}
          tone={engaging ? "accent" : pipelineHealth.deceptionEngineStatus === "ARMED" ? "success" : "neutral"}
          live={engaging}
        />
      </div>
    </Panel>
  );
}
