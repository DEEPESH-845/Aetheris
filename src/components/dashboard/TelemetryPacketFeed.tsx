"use client";

import { useSimulationStore, type TelemetryEvent, type TelemetrySource } from "@/store/useSimulationStore";
import { Badge } from "@/components/ui/badge";
import { FeedList } from "@/components/shared/FeedList";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const sourceVariant: Record<TelemetrySource, "default" | "danger" | "accent"> = {
  ZEEK: "default",
  SURICATA: "danger",
  EBPF: "accent",
};
const sourceLabel: Record<TelemetrySource, string> = { ZEEK: "Zeek", SURICATA: "Suricata", EBPF: "eBPF" };

const severityTone: Record<TelemetryEvent["severity"], string> = {
  low: "text-ink-muted",
  medium: "text-ink",
  high: "text-accent",
  critical: "text-danger",
};

export function TelemetryPacketFeed() {
  const events = useSimulationStore((s) => s.telemetryEvents);

  return (
    <FeedList
      items={events}
      getKey={(e) => e.id}
      className="px-4 py-2"
      render={(e) => (
        <div className="flex items-start gap-3 py-0.5">
          <Badge variant={sourceVariant[e.source]} className="w-16 shrink-0 justify-center font-mono">
            {sourceLabel[e.source]}
          </Badge>
          <span className="shrink-0 text-ink-subtle">{formatTime(e.ts)}</span>
          <span className={cn("min-w-0 break-all", severityTone[e.severity])}>
            {e.raw.replace(/^\[(ZEEK|SURICATA|eBPF)\]\s/, "")}
          </span>
        </div>
      )}
      emptyState={<p className="p-4 text-xs text-ink-subtle">Waiting for the first packets.</p>}
    />
  );
}
