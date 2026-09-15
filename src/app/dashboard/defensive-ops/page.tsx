"use client";

import { Graph, Prohibit, ShieldCheck, ShieldWarning, XCircle, type Icon } from "@phosphor-icons/react";
import { useSimulationStore, type DefensiveActionType, type DefensiveOperation } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatBlock } from "@/components/shared/StatBlock";
import { StatusBadge, type StateTone } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedList } from "@/components/shared/FeedList";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDuration, formatTime } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const ACTION: Record<DefensiveActionType, { icon: Icon; label: string }> = {
  ISOLATE_NODE: { icon: Graph, label: "Network isolation" },
  BLOCK_ASN: { icon: Prohibit, label: "BGP route nulling" },
  TERMINATE_PROCESS: { icon: XCircle, label: "Process termination" },
  ENFORCE_ZERO_TRUST: { icon: ShieldCheck, label: "Zero trust enforcement" },
};

const STATUS: Record<DefensiveOperation["status"], { tone: StateTone; live: boolean }> = {
  PENDING: { tone: "neutral", live: false },
  EXECUTING: { tone: "accent", live: true },
  VERIFYING: { tone: "accent", live: true },
  SUCCESS: { tone: "success", live: false },
  FAILED: { tone: "danger", live: false },
};

function logTone(text: string) {
  if (text.includes("SUCCESS")) return "text-success";
  if (text.includes("FAIL")) return "text-danger";
  if (text.includes("EXEC") || text.includes("VERIFY")) return "text-accent";
  return "text-ink-muted";
}

export default function DefensiveOpsPage() {
  const defensiveOperations = useSimulationStore((s) => s.defensiveOperations);
  const networkNodes = useSimulationStore((s) => s.networkNodes);
  const autonomous = useSimulationStore((s) => s.autonomous);
  const approveOperation = useSimulationStore((s) => s.approveOperation);
  const operations = Object.values(defensiveOperations).sort((a, b) => b.startedAt - a.startedAt);
  const awaiting = operations.filter((op) => !op.approvedAt);
  const active = operations.filter((op) => op.approvedAt && op.status !== "SUCCESS" && op.status !== "FAILED");
  const completed = operations.filter((op) => op.status === "SUCCESS" || op.status === "FAILED");
  const isolated = Object.values(networkNodes).filter((n) => n.status === "isolated");
  const now = useNow();

  const logs = operations
    .flatMap((op) => op.logs.map((text, i) => ({ id: `${op.id}-${i}`, text, ts: op.startedAt + i * 2000 })))
    .sort((a, b) => a.ts - b.ts);

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full">
      <PageHeader
        title="Defensive operations"
        description={autonomous ? "Countermeasures the system has taken on its own, and what they touched." : "Proposed countermeasures wait here for your approval before anything runs."}
      />

      <Panel className="grid grid-cols-4 divide-x">
        <StatBlock label="Awaiting approval" value={awaiting.length} tone={awaiting.length > 0 ? "accent" : "default"} />
        <StatBlock label="In progress" value={active.length} tone={active.length > 0 ? "accent" : "default"} />
        <StatBlock label="Completed" value={completed.length} tone="success" />
        <StatBlock label="Isolated nodes" value={isolated.length} tone={isolated.length > 0 ? "danger" : "default"} />
      </Panel>

      <div className="grid min-h-0 gap-4 lg:flex-1 lg:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-4 lg:col-span-7">
          <Panel className="min-h-[220px] flex-1">
            <PanelHeader title="Countermeasures" actions={<span className="font-mono text-xs text-ink-subtle">{operations.length}</span>} />
            <PanelBody padded={false} scroll>
              {operations.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="No countermeasures yet" hint="Operations are logged here as the system responds to a threat." />
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-surface">
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operations.map((op) => {
                      const cfg = ACTION[op.action];
                      const st = STATUS[op.status];
                      const elapsed = Math.max(0, (op.completedAt ?? now) - op.startedAt);
                      return (
                        <TableRow key={op.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <cfg.icon size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
                              <div>
                                <div className="text-sm text-ink">{cfg.label}</div>
                                <div className="font-mono text-xs text-ink-subtle">{op.id} for {op.threatId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-ink-muted">{op.target}</TableCell>
                          <TableCell>
                            {op.approvedAt ? (
                              <StatusBadge label={op.status} tone={st.tone} live={st.live} />
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => approveOperation(op.id)}>Approve</Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-ink-muted">
                            {formatTime(op.startedAt)}
                            <span className="ml-2 text-ink-subtle">{formatDuration(elapsed)}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </PanelBody>
          </Panel>

          <Panel className="shrink-0">
            <PanelHeader
              title="Network quarantine"
              actions={isolated.length > 0 ? <StatusBadge label={`${isolated.length} isolated`} tone="danger" /> : undefined}
            />
            <PanelBody padded={false}>
              {isolated.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">No nodes are isolated.</p>
              ) : (
                <ul className="divide-y">
                  {isolated.map((node) => (
                    <li key={node.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <ShieldWarning size={16} className="text-danger" aria-hidden="true" />
                        {node.label}
                      </span>
                      <StatusBadge label="Isolated" tone="danger" />
                    </li>
                  ))}
                </ul>
              )}
            </PanelBody>
          </Panel>
        </div>

        <Panel className="min-h-[300px] lg:col-span-5">
          <PanelHeader title="Operations log" />
          <PanelBody padded={false}>
            <FeedList
              items={logs}
              getKey={(l) => l.id}
              className="px-4 py-3"
              render={(l) => (
                <div className="flex gap-3 py-0.5">
                  <span className="shrink-0 text-ink-subtle">{formatTime(l.ts)}</span>
                  <span className={cn("min-w-0 break-words", logTone(l.text))}>{l.text}</span>
                </div>
              )}
              emptyState={<p className="p-4 text-xs text-ink-subtle">Waiting for the first autonomous operation.</p>}
            />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
