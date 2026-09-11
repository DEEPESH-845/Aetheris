"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NetworkTopology } from "@/components/visualization/NetworkTopology";
import { ActiveThreatsList } from "@/components/dashboard/ActiveThreatsList";

const DEMO_ID = "DEMO-4417";
const TARGET = "web-cluster-1";

/**
 * The real dashboard components, driven by a short scripted incident:
 * detect, redirect into the twin, resolve, repeat. No mockups.
 */
export function LivePreview() {
  useEffect(() => {
    const st = useSimulationStore.getState();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    const run = () => {
      const s = useSimulationStore.getState();
      s.addThreat({
        id: DEMO_ID,
        type: "Credential attack",
        sourceIp: "203.0.113.72",
        targetNode: TARGET,
        severity: "HIGH",
        confidence: 91,
        timestamp: Date.now(),
        status: "DETECTED",
      });
      s.updateNodeStatus(TARGET, "compromised");
      timers.push(
        setTimeout(() => useSimulationStore.getState().updateThreatStatus(DEMO_ID, "ANALYZING"), 1800),
        setTimeout(() => {
          const n = useSimulationStore.getState();
          n.updateThreatStatus(DEMO_ID, "MITIGATING", "eBPF redirect to honey twin");
          n.updateNodeStatus(TARGET, "redirected");
        }, 3600),
        setTimeout(() => {
          const n = useSimulationStore.getState();
          n.updateThreatStatus(DEMO_ID, "RESOLVED", "Session captured, 3 IOCs extracted");
          n.updateNodeStatus(TARGET, "healthy");
        }, 9000),
      );
    };

    const start = setTimeout(() => {
      run();
      interval = setInterval(run, 14000);
    }, 1200);
    timers.push(start);

    return () => {
      timers.forEach(clearTimeout);
      if (interval) clearInterval(interval);
      st.updateThreatStatus(DEMO_ID, "RESOLVED");
      st.updateNodeStatus(TARGET, "healthy");
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Panel className="h-[320px] sm:h-[380px]">
        <PanelHeader title="Deception map" actions={<StatusBadge label="Live" tone="success" live />} />
        <PanelBody padded={false}>
          <NetworkTopology interactive={false} />
        </PanelBody>
      </Panel>
      <Panel className="h-40">
        <PanelHeader title="Active threats" />
        <PanelBody padded={false} scroll>
          <ActiveThreatsList />
        </PanelBody>
      </Panel>
    </div>
  );
}
