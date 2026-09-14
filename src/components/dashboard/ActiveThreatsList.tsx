"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "@phosphor-icons/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { SeverityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { threatStatusTone as statusTone } from "./IncidentDrawer";

export function ActiveThreatsList() {
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const selectThreat = useSimulationStore((s) => s.selectThreat);
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
          >
            <button
              type="button"
              onClick={() => selectThreat(threat.id)}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-[background-color] hover:bg-surface-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
            <div className="flex w-full items-start justify-between gap-3">
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
              <p className="w-full rounded-control bg-accent-soft px-2.5 py-1.5 font-mono text-xs text-accent">
                {threat.mitigationAction}
              </p>
            )}
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
