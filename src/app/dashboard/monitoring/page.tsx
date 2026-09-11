"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react";
import { useSimulationStore, type Threat, type ThreatLevel } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { SeverityBadge, StatusBadge, type StateTone } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime } from "@/lib/format";

const SEVERITIES: ("ALL" | ThreatLevel)[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

const statusTone: Record<Threat["status"], StateTone> = {
  DETECTED: "danger",
  ANALYZING: "accent",
  MITIGATING: "accent",
  RESOLVED: "success",
};

function ThreatMonitor() {
  const incidentLog = useSimulationStore((s) => s.incidentLog);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const severity = (params.get("severity") ?? "ALL").toUpperCase();
  const query = params.get("q") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "ALL") next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const q = query.trim().toLowerCase();
  const rows = incidentLog.filter((log) => {
    const matchesSeverity = severity === "ALL" || log.severity === severity;
    const matchesQuery =
      q === "" ||
      log.type.toLowerCase().includes(q) ||
      log.sourceIp.includes(q) ||
      log.targetNode.toLowerCase().includes(q);
    return matchesSeverity && matchesQuery;
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader title="Threat monitor" description="Every incident the pipeline has raised, with the response it received." />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={severity} onValueChange={(v) => setParam("severity", String(v))}>
          <TabsList>
            {SEVERITIES.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize">
                {s.toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-sm">
          <MagnifyingGlass size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-subtle" />
          <Input
            type="search"
            name="q"
            aria-label="Search incidents"
            placeholder="Search by IP, node, or type…"
            autoComplete="off"
            spellCheck={false}
            defaultValue={query}
            onChange={(e) => setParam("q", e.target.value)}
            className="pl-8"
          />
        </div>
        <span className="ml-auto font-mono text-xs text-ink-subtle">
          {rows.length} of {incidentLog.length}
        </span>
      </div>

      <Panel className="min-h-0 flex-1">
        <PanelBody padded={false} scroll>
          {rows.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={incidentLog.length === 0 ? "No incidents recorded" : "No incidents match"}
              hint={incidentLog.length === 0 ? "Incidents appear here as soon as the pipeline raises one." : "Try a different severity or clear the search."}
            />
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-surface">
                <TableRow>
                  <TableHead className="w-28">Time</TableHead>
                  <TableHead className="w-28">Severity</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-ink-muted">{formatTime(log.timestamp)}</TableCell>
                    <TableCell><SeverityBadge severity={log.severity} /></TableCell>
                    <TableCell>
                      <div className="text-sm text-ink">{log.type}</div>
                      <div className="font-mono text-xs text-ink-subtle">{log.sourceIp}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-muted">{log.targetNode}</TableCell>
                    <TableCell>
                      <StatusBadge label={log.status} tone={statusTone[log.status]} live={log.status !== "RESOLVED"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}

export default function ThreatMonitorPage() {
  return (
    <Suspense>
      <ThreatMonitor />
    </Suspense>
  );
}
