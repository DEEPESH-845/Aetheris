"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "@phosphor-icons/react";
import { useSimulationStore, type Threat } from "@/store/useSimulationStore";
import { SeverityBadge, StatusBadge, type StateTone } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

const statusTone: Record<Threat["status"], StateTone> = {
  DETECTED: "danger",
  ANALYZING: "accent",
  MITIGATING: "accent",
  RESOLVED: "success",
};

export function ActiveThreatsList() {
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const reduce = useReducedMotion();

  if (activeThreats.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No active threats" hint="New detections appear here the moment the pipeline flags them." />;
  }

  return (
    <ul className="flex flex-col divide-y">
      <AnimatePresence initial={false}>
        {activeThreats.map((threat) => (
          <motion.li
            key={threat.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">{threat.type}</span>
                  <SeverityBadge severity={threat.severity} />
                </div>
                <div className="mt-1 font-mono text-xs text-ink-muted">
                  {threat.sourceIp} <span className="text-ink-subtle">to</span> {threat.targetNode}
                </div>
              </div>
              <StatusBadge label={threat.status} tone={statusTone[threat.status]} live={threat.status !== "RESOLVED"} />
            </div>
            {threat.mitigationAction && (
              <p className="rounded-control bg-accent-soft px-2.5 py-1.5 font-mono text-xs text-accent">
                {threat.mitigationAction}
              </p>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
