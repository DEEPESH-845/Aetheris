"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { useSimulationStore, type Threat } from "@/store/useSimulationStore";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge, type StateTone } from "@/components/shared/StatusBadge";
import { formatRelative, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const threatStatusTone: Record<Threat["status"], StateTone> = {
  DETECTED: "danger",
  ANALYZING: "accent",
  MITIGATING: "accent",
  RESOLVED: "success",
};

const thoughtTone = { info: "text-ink-muted", warning: "text-danger", action: "text-accent", success: "text-success" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t px-4 py-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{title}</h3>
      {children}
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
    >
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {done ? "Copied" : label}
    </Button>
  );
}

/** Everything the system knows about one incident, in one place. Mounted once in AppShell; rows call `selectThreat(id)`. */
export function IncidentDrawer() {
  const selectedThreatId = useSimulationStore((s) => s.selectedThreatId);
  const selectThreat = useSimulationStore((s) => s.selectThreat);
  const threat = useSimulationStore((s) => s.incidentLog.find((t) => t.id === selectedThreatId));
  const profile = useSimulationStore((s) => (threat ? s.attackerProfiles[threat.sourceIp] : undefined));
  const twin = useSimulationStore((s) => Object.values(s.sandboxTwins).find((t) => t.threatId === selectedThreatId));
  const op = useSimulationStore((s) => Object.values(s.defensiveOperations).find((o) => o.threatId === selectedThreatId));
  // Selectors must return stable references; filter outside the selector.
  const thoughts = useSimulationStore((s) => s.aiThoughts).filter((t) => t.threatId === selectedThreatId);

  const observed = profile?.ttps.filter((t) => t.observed) ?? [];
  const iocs = [threat?.sourceIp, ...(twin?.iocsCaptured ?? [])].filter((x): x is string => Boolean(x));
  const exportJson = () =>
    JSON.stringify({ threat, attacker: profile, twin, operation: op, reasoning: thoughts, exportedAt: new Date().toISOString() }, null, 2);

  return (
    <Sheet open={Boolean(selectedThreatId)} onOpenChange={(open) => !open && selectThreat(null)}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {threat && (
          <>
            <SheetHeader className="pr-12">
              <div className="flex items-center gap-2">
                <SheetTitle>{threat.type}</SheetTitle>
                <SeverityBadge severity={threat.severity} />
              </div>
              <SheetDescription className="font-mono text-xs">
                {threat.id} · {threat.sourceIp} <span className="text-ink-subtle">to</span> {threat.targetNode} · {formatRelative(threat.timestamp)}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge label={threat.status} tone={threatStatusTone[threat.status]} live={threat.status !== "RESOLVED"} />
                <span className="font-mono text-xs text-ink-muted">{threat.confidence}% confidence</span>
                {threat.mitigationAction && <Badge variant="accent" className="font-mono">{threat.mitigationAction}</Badge>}
              </div>
              <div className="mt-3 flex gap-2">
                <CopyButton text={iocs.join("\n")} label="Copy IOCs" />
                <CopyButton text={exportJson()} label="Export JSON" />
              </div>
            </SheetHeader>

            <Section title="Attacker">
              {profile ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><dt className="text-ink-subtle">Actor</dt><dd className="text-ink">{profile.actorName ?? "Unattributed"} ({profile.countryCode})</dd></div>
                  <div><dt className="text-ink-subtle">Kill chain</dt><dd className="text-accent">{profile.killChainStage}</dd></div>
                  <div className="col-span-2"><dt className="text-ink-subtle">ASN</dt><dd className="font-mono text-ink-muted">{profile.asnName}</dd></div>
                  <div className="col-span-2"><dt className="text-ink-subtle">Tooling</dt><dd className="text-ink-muted">{profile.tooling.join(", ")}</dd></div>
                </dl>
              ) : (
                <p className="text-xs text-ink-muted">Not yet profiled. Enrichment runs once the threat enters analysis.</p>
              )}
            </Section>

            <Section title={`MITRE ATT&CK (${observed.length})`}>
              {observed.length === 0 ? (
                <p className="text-xs text-ink-muted">No techniques observed yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {observed.map((t) => (
                    <li key={t.technique} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate"><span className="font-mono text-ink">{t.technique}</span> <span className="text-ink-muted">{t.name}</span></span>
                      <span className="shrink-0 text-ink-subtle">{t.tactic}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title={twin ? `Twin session · ${twin.vmName}` : "Twin session"}>
              {!twin ? (
                <p className="text-xs text-ink-muted">No digital twin spawned for this incident.</p>
              ) : twin.attackerSessions.length === 0 ? (
                <p className="text-xs text-ink-muted">Twin is {twin.lifecycle.toLowerCase()}; no attacker commands yet.</p>
              ) : (
                <ol className="flex flex-col gap-1 font-mono text-xs">
                  {twin.attackerSessions.slice(-12).map((s) => (
                    <li key={s.id} className={cn("truncate", s.isSuspicious ? "text-danger" : "text-ink-muted")}>
                      <span className="text-ink-subtle">{formatTime(s.ts)}</span> $ {s.command}
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            <Section title={`IOCs (${iocs.length})`}>
              <ul className="flex flex-col gap-1 font-mono text-xs text-ink-muted">
                {iocs.map((i) => <li key={i} className="truncate">{i}</li>)}
              </ul>
            </Section>

            <Section title="Reasoning log">
              {thoughts.length === 0 ? (
                <p className="text-xs text-ink-muted">No reasoning recorded for this incident.</p>
              ) : (
                <ol className="flex flex-col gap-1 text-xs">
                  {thoughts.map((t) => (
                    <li key={t.id} className={thoughtTone[t.type]}>
                      <span className="font-mono text-ink-subtle">{t.timestamp}</span> {t.text}
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {op && (
              <Section title="Countermeasure">
                <p className="text-xs text-ink">{op.action} <span className="text-ink-muted">on {op.target}</span></p>
                <ol className="flex flex-col gap-1 font-mono text-xs text-ink-muted">
                  {op.logs.map((l, i) => <li key={i}>{l}</li>)}
                </ol>
              </Section>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
