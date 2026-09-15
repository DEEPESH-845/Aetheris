"use client";

import { useState } from "react";
import {
  Bug,
  Crosshair,
  Database,
  Lightning,
  Skull,
  Terminal,
  Warning,
  ArrowsLeftRight,
  Eye,
  type Icon,
} from "@phosphor-icons/react";
import { useSimulationStore, type SandboxTwin, type Threat, type ThreatLevel } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { SeverityBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedList } from "@/components/shared/FeedList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttackVector {
  id: string;
  name: string;
  type: string;
  severity: ThreatLevel;
  sourceIp: string;
  icon: Icon;
  description: string;
}

const attackVectors: AttackVector[] = [
  { id: "apt-cobalt", name: "APT: Cobalt Strike", type: "APT Intrusion", severity: "CRITICAL", sourceIp: "185.220.101.3", icon: Skull, description: "APT28-style beacon establishing C2 over HTTPS." },
  { id: "ransomware", name: "Ransomware outbreak", type: "Ransomware", severity: "CRITICAL", sourceIp: "45.33.32.156", icon: Bug, description: "Encrypts network shares and exfiltrates to a Tor exit node." },
  { id: "sqli-exfil", name: "SQL injection and exfil", type: "Database Breach", severity: "HIGH", sourceIp: "104.21.33.9", icon: Database, description: "Blind SQLi against the API gateway followed by data exfiltration." },
  { id: "ssh-bruteforce", name: "SSH brute force", type: "Credential Attack", severity: "HIGH", sourceIp: "203.0.113.72", icon: Crosshair, description: "Distributed credential stuffing from 12 source IPs." },
  { id: "ddos", name: "Layer 7 DDoS", type: "DDoS", severity: "MEDIUM", sourceIp: "91.108.4.1", icon: Lightning, description: "HTTP flood on /api/auth at 50k requests per second." },
  { id: "insider", name: "Insider lateral pivot", type: "Lateral Movement", severity: "HIGH", sourceIp: "172.16.1.88", icon: ArrowsLeftRight, description: "Compromised internal endpoint pivoting over RDP to production." },
];

function pickTarget(nodes: string[]) {
  return nodes[Math.floor(Math.random() * nodes.length)];
}

function buildThreat(vector: AttackVector, targetNode: string): Threat {
  return {
    id: `SIM-${Math.floor(Math.random() * 90000) + 10000}`,
    type: vector.type,
    sourceIp: vector.sourceIp,
    targetNode,
    severity: vector.severity,
    confidence: 100,
    timestamp: Date.now(),
    status: "DETECTED",
  };
}

function AttackerTerminal({ twin }: { twin: SandboxTwin }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b px-4 py-2 font-mono text-xs">
        <div className="text-ink-muted">OpenSSH_8.9p1 Ubuntu-3ubuntu0.6 (protocol 2.0)</div>
        <div className="text-ink-subtle">
          Session proxied to <span className="text-accent">{twin.vmName}</span> ({twin.ipAddress})
        </div>
      </div>
      <FeedList
        items={twin.attackerSessions}
        getKey={(s) => s.id}
        className="px-4 py-2"
        render={(s) => (
          <div className="py-1">
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-success">www-data@{twin.vmName}:~$</span>
              <span className={cn("min-w-0 break-all", s.isSuspicious ? "text-danger" : "text-ink")}>{s.command}</span>
              {s.isSuspicious && <Warning size={14} className="mt-0.5 shrink-0 text-danger" aria-label="Suspicious command" />}
            </div>
            <div className="pl-4 whitespace-pre-wrap break-all text-ink-muted">{s.response}</div>
          </div>
        )}
        emptyState={
          <p className="flex items-center gap-2 p-4 text-xs text-ink-subtle">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent animate-pulse" />
            Waiting for attacker keystrokes…
          </p>
        }
      />
    </div>
  );
}

export default function SandboxPage() {
  const addThreat = useSimulationStore((s) => s.addThreat);
  const networkNodes = useSimulationStore((s) => s.networkNodes);
  const updateNodeStatus = useSimulationStore((s) => s.updateNodeStatus);
  const isRunning = useSimulationStore((s) => s.isSimulationRunning);
  const toggleSimulation = useSimulationStore((s) => s.toggleSimulation);
  const sandboxTwins = useSimulationStore((s) => s.sandboxTwins);
  const [justFired, setJustFired] = useState<string | null>(null);

  const productionNodes = Object.keys(networkNodes).filter((n) => !networkNodes[n].isHoneyNode);
  const twins = Object.values(sandboxTwins);
  const combatTwins = twins.filter((t) => t.lifecycle === "COMBAT");
  const activeTwin = combatTwins[combatTwins.length - 1] ?? null;

  const triggerAttack = (vector: AttackVector) => {
    const targetNode = pickTarget(productionNodes);
    addThreat(buildThreat(vector, targetNode));
    updateNodeStatus(targetNode, "compromised");
    setJustFired(vector.id);
    setTimeout(() => setJustFired(null), 1500);
  };

  const forceHandoff = () => {
    const st = useSimulationStore.getState();
    st.activeThreats
      .filter((t) => t.status === "DETECTED" || t.status === "ANALYZING")
      .forEach((t) => {
        st.updateThreatStatus(t.id, "MITIGATING", "eBPF traffic redirect to honey twin");
        st.updateNodeStatus(t.targetNode, "redirected");
      });
  };

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full">
      <PageHeader
        title="Sandbox lab"
        description="Fire an attack vector, then watch the engine redirect it into a twin."
        actions={
          <>
            <Button variant="secondary" onClick={toggleSimulation}>
              {isRunning ? "Halt simulation" : "Resume simulation"}
            </Button>
            <Button onClick={forceHandoff}>
              <Eye aria-hidden="true" />
              Force deception handoff
            </Button>
          </>
        }
      />

      <ul className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Attack vectors">
        {attackVectors.map((vector) => {
          const fired = justFired === vector.id;
          return (
            <li key={vector.id}>
              <button
                type="button"
                onClick={() => triggerAttack(vector)}
                aria-label={`Fire ${vector.name}`}
                title={vector.description}
                className={cn(
                  "flex h-full w-full flex-col items-start gap-3 rounded-panel border bg-surface p-4 text-left transition-[background-color,border-color,transform] duration-150 ease-out-expo hover:bg-surface-2 active:translate-y-px",
                  fired && "border-accent ring-2 ring-ring",
                )}
              >
                <vector.icon size={20} className={vector.severity === "CRITICAL" ? "text-danger" : "text-ink-muted"} aria-hidden="true" />
                <span className="text-sm font-medium leading-tight text-ink">{vector.name}</span>
                <SeverityBadge severity={vector.severity} className="mt-auto" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid min-h-0 gap-4 lg:flex-1 lg:grid-cols-12">
        <Panel className="min-h-[320px] lg:col-span-8">
          <PanelHeader
            title="Attacker session"
            description={activeTwin ? `${activeTwin.id} on ${activeTwin.vmName}` : "No twin in combat"}
            actions={activeTwin ? <StatusBadge label="Combat" tone="accent" live /> : undefined}
          />
          <PanelBody padded={false}>
            {activeTwin ? (
              <AttackerTerminal twin={activeTwin} />
            ) : (
              <EmptyState
                icon={Terminal}
                title="No twin in combat"
                hint="Fire a vector above, then use Force deception handoff to route the attacker into a twin."
              />
            )}
          </PanelBody>
        </Panel>

        <div className="flex min-h-0 flex-col gap-4 lg:col-span-4">
          <Panel className="shrink-0">
            <PanelHeader title="Twins" actions={<span className="font-mono text-xs text-ink-subtle">{twins.length}</span>} />
            <PanelBody padded={false}>
              {twins.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">No twins spawned yet.</p>
              ) : (
                <ul className="divide-y">
                  {twins.map((twin) => (
                    <li key={twin.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="font-mono text-xs text-ink">{twin.id}</span>
                      <StatusBadge label={twin.lifecycle} tone={twin.lifecycle === "COMBAT" ? "accent" : twin.lifecycle === "ONLINE" ? "success" : "neutral"} live={twin.lifecycle === "COMBAT"} />
                    </li>
                  ))}
                </ul>
              )}
            </PanelBody>
          </Panel>

          <Panel className="min-h-[200px] flex-1">
            <PanelHeader
              title="Captured IOCs"
              actions={activeTwin ? <span className="font-mono text-xs text-ink-subtle">{activeTwin.iocsCaptured.length}</span> : undefined}
            />
            <PanelBody padded={false} scroll>
              {!activeTwin || activeTwin.iocsCaptured.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">Indicators appear here as the twin records them.</p>
              ) : (
                <ul className="divide-y font-mono text-xs">
                  {activeTwin.iocsCaptured.map((ioc, i) => (
                    <li key={`${ioc}-${i}`} className="flex items-center gap-2 px-4 py-2 text-danger animate-in fade-in duration-200">
                      <Warning size={14} aria-hidden="true" className="shrink-0" />
                      <span className="break-all">{ioc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
