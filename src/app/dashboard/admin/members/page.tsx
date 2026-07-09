"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Trash2, Shield } from "lucide-react";
import { useOrg } from "@/hooks/useOrg";
import { api } from "@/utils/trpc";
import { CyberButton } from "@/components/core/CyberButton";
import { CyberPanel } from "@/components/core/CyberPanel";
import { StatusBadge } from "@/components/core/StatusBadge";

const ROLE_COLORS: Record<string, string> = {
  OWNER: "text-yellow-400",
  ADMIN: "text-neon-magenta",
  MEMBER: "text-neon-cyan",
  VIEWER: "text-text-secondary",
};

export default function MembersPage() {
  const { org } = useOrg();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");

  const listMembers = api.org.listMembers.useQuery();
  const inviteMember = api.org.inviteMember.useMutation({
    onSuccess: () => {
      listMembers.refetch();
      setShowInvite(false);
      setEmail("");
    },
  });

  const members = listMembers.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Team Members</h1>
          <p className="text-text-secondary text-sm mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in {org?.name}
          </p>
        </div>
        <CyberButton onClick={() => setShowInvite(true)} variant="primary" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </CyberButton>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <CyberPanel className="p-6">
            <h3 className="font-outfit font-bold text-white mb-4">Invite Team Member</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-mono text-text-muted mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-mono focus:border-neon-cyan/50 focus:outline-none"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-muted mb-1 block">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-mono focus:border-neon-cyan/50 focus:outline-none"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <CyberButton
                onClick={() => inviteMember.mutate({ email, role })}
                variant="primary"
                size="sm"
                disabled={!email}
              >
                Send Invite
              </CyberButton>
              <CyberButton onClick={() => setShowInvite(false)} variant="ghost" size="sm">
                Cancel
              </CyberButton>
            </div>
          </CyberPanel>
        </motion.div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.map((membership, i) => (
          <motion.div
            key={membership.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CyberPanel className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <span className="text-sm font-mono text-neon-cyan">
                      {membership.user.name?.charAt(0) ?? membership.user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{membership.user.name ?? "Unnamed"}</p>
                    <p className="text-text-secondary text-xs font-mono">{membership.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${ROLE_COLORS[membership.role] ?? "text-text-secondary"}`}>
                    {membership.role}
                  </span>
                  {membership.role !== "OWNER" && (
                    <button className="p-1 text-text-muted hover:text-neon-red transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </CyberPanel>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
