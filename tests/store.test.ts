import { describe, expect, it, beforeEach } from "vitest";
import { useSimulationStore, type Threat } from "@/store/useSimulationStore";

const threat = (id: string): Threat => ({
  id, type: "Ransomware", sourceIp: "1.2.3.4", targetNode: "db-main", severity: "HIGH", confidence: 90, timestamp: Date.now(), status: "DETECTED",
});

describe("simulation store", () => {
  beforeEach(() => useSimulationStore.setState({ activeThreats: [], incidentLog: [], aiThoughts: [], telemetryEvents: [] }));

  it("caps rolling buffers so a long session cannot grow memory", () => {
    const st = useSimulationStore.getState();
    for (let i = 0; i < 1000; i++) {
      st.addTelemetryEvent({ ts: i, source: "ZEEK", raw: `e${i}`, severity: "low" });
      st.addAIThought({ type: "info", text: `t${i}` });
      st.addThreat(threat(`T-${i}`));
    }
    const s = useSimulationStore.getState();
    expect(s.telemetryEvents.length).toBe(200);
    expect(s.aiThoughts.length).toBe(50);
    expect(s.incidentLog.length).toBe(500);
  });

  it("resolving a threat removes it from active but keeps the incident record", () => {
    const st = useSimulationStore.getState();
    st.addThreat(threat("T-1"));
    st.updateThreatStatus("T-1", "RESOLVED");
    st.updateThreatStatus("T-missing", "RESOLVED");
    const s = useSimulationStore.getState();
    expect(s.activeThreats.find((t) => t.id === "T-1")).toBeUndefined();
    expect(s.incidentLog.find((t) => t.id === "T-1")?.status).toBe("RESOLVED");
  });
});
