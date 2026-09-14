import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulationStore } from "@/store/useSimulationStore";
import { isGeneratorRunning, startGenerator, stopGenerator, tick } from "@/simulation/generator";

const initial = useSimulationStore.getInitialState();

function runFor(seconds: number) {
  // 800 ms ticks with the wall clock advanced in step, since the tick reads Date.now() for ages.
  const steps = Math.ceil((seconds * 1000) / 800);
  for (let i = 1; i <= steps; i++) {
    vi.advanceTimersByTime(800);
    tick(useSimulationStore.getState(), i);
  }
}

const threat = () => ({
  id: "TRT-1", type: "APT Intrusion", sourceIp: "185.220.101.3", targetNode: "web-cluster-1",
  severity: "CRITICAL" as const, confidence: 94, timestamp: Date.now(), status: "DETECTED" as const,
});

beforeEach(() => {
  vi.useFakeTimers();
  useSimulationStore.setState({ ...initial, autonomous: true });
});
afterEach(() => { stopGenerator(); vi.useRealTimers(); });

describe("simulation generator", () => {
  it("carries a threat through analysis, a twin, a countermeasure and resolution", () => {
    useSimulationStore.getState().addThreat(threat());
    runFor(10);
    let s = useSimulationStore.getState();
    expect(s.activeThreats[0].status).toBe("MITIGATING");
    expect(Object.values(s.sandboxTwins).some((t) => t.threatId === "TRT-1")).toBe(true);
    expect(s.attackerProfiles["185.220.101.3"]).toBeDefined();
    expect(s.aiThoughts.some((t) => t.threatId === "TRT-1")).toBe(true);

    runFor(120);
    s = useSimulationStore.getState();
    const op = Object.values(s.defensiveOperations).find((o) => o.threatId === "TRT-1");
    expect(op?.status).toBe("SUCCESS");
    expect(s.activeThreats).toHaveLength(0);
    expect(s.incidentLog[0].status).toBe("RESOLVED");
  });

  it("holds countermeasures at PENDING until approved when autonomous mitigation is off", () => {
    useSimulationStore.setState({ autonomous: false });
    useSimulationStore.getState().addThreat(threat());
    runFor(120);
    let s = useSimulationStore.getState();
    const op = Object.values(s.defensiveOperations).find((o) => o.threatId === "TRT-1");
    expect(op?.status).toBe("PENDING");
    expect(op?.approvedAt).toBeUndefined();
    expect(s.activeThreats).toHaveLength(1);

    s.approveOperation(op!.id);
    runFor(15);
    s = useSimulationStore.getState();
    expect(s.defensiveOperations[op!.id].status).toBe("SUCCESS");
    expect(s.activeThreats).toHaveLength(0);
  });

  it("start/stop is idempotent and the interval actually ticks", () => {
    startGenerator();
    startGenerator();
    expect(isGeneratorRunning()).toBe(true);
    vi.advanceTimersByTime(800 * 3);
    expect(useSimulationStore.getState().telemetryEvents.length).toBeGreaterThan(0);
    stopGenerator();
    stopGenerator();
    expect(isGeneratorRunning()).toBe(false);
  });
});
