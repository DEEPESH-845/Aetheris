"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Filter } from "lucide-react";
import { api } from "@/utils/trpc";
import { CyberPanel } from "@/components/core/CyberPanel";
import { CyberButton } from "@/components/core/CyberButton";
import { StatusBadge } from "@/components/core/StatusBadge";

const ACTION_COLORS: Record<string, string> = {
  "threat.detected": "text-neon-red",
  "threat.mitigated": "text-neon-green",
  "sandbox.provisioned": "text-neon-cyan",
  "member.invited": "text-neon-purple",
  "plan.changed": "text-yellow-400",
  "settings.updated": "text-text-secondary",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = api.audit.list.useQuery({ limit: 50, offset: page * 50, action: undefined });

  const logs = (data as any)?.logs ?? [];
  const total = (data as any)?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-text-secondary text-sm mt-1">
            {total} event{total !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      {isLoading ? (
        <CyberPanel className="p-12 text-center">
          <p className="text-text-muted font-mono text-sm">Loading audit logs...</p>
        </CyberPanel>
      ) : logs.length === 0 ? (
        <CyberPanel className="p-12 text-center">
          <Shield className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No audit events yet</p>
          <p className="text-text-muted text-xs mt-1">Events will appear as your team uses the platform</p>
        </CyberPanel>
      ) : (
        <div className="space-y-1">
          {logs.map((log: any, i: number) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <CyberPanel className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold ${ACTION_COLORS[log.action] ?? "text-text-secondary"}`}>
                      {log.action}
                    </span>
                    <span className="text-text-secondary text-xs font-mono">{log.resource}</span>
                    {log.ip && (
                      <span className="text-text-muted text-[10px] font-mono">{log.ip}</span>
                    )}
                  </div>
                  <span className="text-text-muted text-[10px] font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </CyberPanel>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex justify-center gap-2">
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </CyberButton>
          <span className="text-text-muted text-sm font-mono self-center">
            Page {page + 1} of {Math.ceil(total / 50)}
          </span>
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * 50 >= total}
          >
            Next
          </CyberButton>
        </div>
      )}
    </div>
  );
}
