"use client";

import { useState } from "react";
import { ClipboardText } from "@phosphor-icons/react";
import { api } from "@/utils/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

interface AuditRow {
  id: string;
  action: string;
  resource: string;
  ip: string | null;
  createdAt: string | Date;
}

const actionTone: Record<string, string> = {
  "threat.detected": "text-danger",
  "threat.mitigated": "text-success",
  "sandbox.provisioned": "text-accent",
  "member.invited": "text-ink",
  "plan.changed": "text-accent",
  "settings.updated": "text-ink-muted",
};

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error } = api.audit.list.useQuery({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, action: undefined });
  const logs = (data?.logs ?? []) as AuditRow[];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Audit log" description={`${total} ${total === 1 ? "event" : "events"} recorded for this organization.`} />

      <Panel>
        <PanelBody padded={false}>
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : isError ? (
            <p className="p-4 text-sm text-danger" role="alert">
              Could not load the audit log: {error.message}
            </p>
          ) : logs.length === 0 ? (
            <EmptyState icon={ClipboardText} title="No audit events yet" hint="Events are recorded as your team uses the platform." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={cn("font-mono text-xs", actionTone[log.action] ?? "text-ink")}>{log.action}</TableCell>
                    <TableCell className="font-mono text-xs text-ink-muted">{log.resource}</TableCell>
                    <TableCell className="font-mono text-xs text-ink-subtle">{log.ip ?? ""}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-ink-muted">{dateTime.format(new Date(log.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </PanelBody>
      </Panel>

      {total > PAGE_SIZE && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <span className="font-mono text-xs text-ink-muted">
            Page {page + 1} of {pages}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}>
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
