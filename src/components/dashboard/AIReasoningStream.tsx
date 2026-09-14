"use client";

import { Check } from "@phosphor-icons/react";
import { useSimulationStore, type AIReasoningPhase, type AIThought } from "@/store/useSimulationStore";
import { FeedList } from "@/components/shared/FeedList";
import { cn } from "@/lib/utils";

const PHASES: { id: AIReasoningPhase; label: string; description: string }[] = [
  { id: "INGEST", label: "Ingest", description: "Consuming Kafka telemetry streams" },
  { id: "ENRICH", label: "Enrich", description: "Qdrant vector lookup and GeoIP enrichment" },
  { id: "CORRELATE", label: "Correlate", description: "MITRE ATT&CK kill chain mapping" },
  { id: "DECIDE", label: "Decide", description: "Scoring countermeasure options" },
  { id: "EXECUTE", label: "Execute", description: "Deploying deception infrastructure" },
];

const logTone: Record<AIThought["type"], string> = {
  info: "text-ink-muted",
  warning: "text-accent",
  action: "text-ink",
  success: "text-success",
};

export function AIReasoningStream() {
  const aiThoughts = useSimulationStore((s) => s.aiThoughts);
  const { currentPhase, isThinking, confidence, vectorDbHits, modelLatency } = useSimulationStore((s) => s.aiReasoningState);
  const currentIdx = PHASES.findIndex((p) => p.id === currentPhase);
  const active = PHASES[currentIdx];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ol className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-4 py-2 text-xs" aria-label="Reasoning phases">
        {PHASES.map((phase, i) => {
          const isActive = i === currentIdx;
          const isPast = currentIdx > i;
          return (
            <li key={phase.id} className="flex items-center gap-1">
              <span
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-badge px-1.5 py-0.5",
                  isActive && "bg-accent-soft text-accent",
                  isPast && "text-success",
                  !isActive && !isPast && "text-ink-subtle",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isPast && <Check size={12} aria-hidden="true" />}
                {isActive && isThinking && (
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent animate-pulse" />
                )}
                {phase.label}
              </span>
              {i < PHASES.length - 1 && <span aria-hidden="true" className="h-px w-3 bg-border-strong" />}
            </li>
          );
        })}
      </ol>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-2 text-xs">
        <span className="text-ink-muted">{active ? active.description : "Waiting for a threat signal"}</span>
        <dl className="flex gap-4 font-mono tabular-nums text-ink-subtle">
          <div className="flex gap-1"><dt>Confidence</dt><dd className="text-ink">{confidence}%</dd></div>
          <div className="flex gap-1"><dt>RAG hits</dt><dd className="text-ink">{vectorDbHits}</dd></div>
          <div className="flex gap-1"><dt>Latency</dt><dd className="text-ink">{modelLatency}&nbsp;ms</dd></div>
        </dl>
      </div>

      <FeedList
        items={aiThoughts}
        getKey={(t) => t.id}
        className="px-4 py-2"
        render={(t) => (
          <div className={cn("flex gap-3", logTone[t.type])}>
            <span className="shrink-0 text-ink-subtle">{t.timestamp}</span>
            <span className="min-w-0 break-words">{t.text}</span>
          </div>
        )}
        emptyState={<p className="p-4 text-xs text-ink-subtle">The reasoning log fills in as the model works a threat.</p>}
      />
    </div>
  );
}
