"use client";

import { useState } from "react";
import { Check, Copy, EnvelopeSimple, UserPlus, Trash, Users } from "@phosphor-icons/react";
import { useOrg } from "@/hooks/useOrg";
import { api } from "@/utils/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
const ROLES: Role[] = ["ADMIN", "MEMBER", "VIEWER"];

const roleVariant: Record<string, "accent" | "default" | "outline"> = {
  OWNER: "accent",
  ADMIN: "accent",
  MEMBER: "default",
  VIEWER: "outline",
};

function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
    >
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {done ? "Copied" : "Copy link"}
    </Button>
  );
}

export default function MembersPage() {
  const { org } = useOrg();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; email: string } | null>(null);

  const listMembers = api.org.listMembers.useQuery();
  const listInvitations = api.org.listInvitations.useQuery();
  const inviteMember = api.org.inviteMember.useMutation({
    onSuccess: () => {
      listInvitations.refetch();
      setShowInvite(false);
      setEmail("");
    },
  });
  const revokeInvitation = api.org.revokeInvitation.useMutation({ onSuccess: () => listInvitations.refetch() });
  const invitations = listInvitations.data ?? [];
  const removeMember = api.org.removeMember.useMutation({
    onSuccess: () => {
      listMembers.refetch();
      setPendingRemoval(null);
    },
  });

  const members = listMembers.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Team members"
        description={org ? `${members.length} ${members.length === 1 ? "member" : "members"} in ${org.name}` : "People with access to this organization"}
        actions={
          <Button onClick={() => setShowInvite((v) => !v)} aria-expanded={showInvite}>
            <UserPlus aria-hidden="true" />
            Invite member
          </Button>
        }
      />

      {showInvite && (
        <Panel>
          <PanelHeader title="Invite a team member" />
          <form
            className="flex flex-col gap-4 p-4 md:flex-row md:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              inviteMember.mutate({ email, role });
            }}
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                aria-invalid={inviteMember.isError || undefined}
              />
              {inviteMember.isError && (
                <p className="text-xs text-danger" role="alert">
                  {inviteMember.error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="invite-role" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? "Sending…" : "Send invite"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <PanelBody padded={false}>
          {listMembers.isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9" />
              ))}
            </div>
          ) : listMembers.isError ? (
            <p className="p-4 text-sm text-danger" role="alert">
              Could not load members: {listMembers.error.message}
            </p>
          ) : members.length === 0 ? (
            <EmptyState icon={Users} title="No members yet" hint="Invite a colleague to give them access." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const initial = (m.user.name ?? m.user.email).charAt(0).toUpperCase();
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-control bg-surface-2 text-sm font-medium text-ink-muted" aria-hidden="true">
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm text-ink">{m.user.name ?? "Unnamed"}</div>
                            <div className="truncate font-mono text-xs text-ink-muted">{m.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleVariant[m.role] ?? "default"} className="capitalize">
                          {m.role.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {m.role !== "OWNER" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${m.user.email}`}
                            onClick={() => setPendingRemoval({ id: m.id, email: m.user.email })}
                          >
                            <Trash />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </PanelBody>
      </Panel>

      {invitations.length > 0 && (
        <Panel>
          <PanelHeader
            title="Pending invitations"
            actions={
              <span className="text-xs text-ink-muted">
                {inviteMember.data?.emailed ? "Invite email sent." : "Share the link directly; email delivery is not configured."}
              </span>
            }
          />
          <PanelBody padded={false}>
            <ul className="divide-y">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <EnvelopeSimple size={16} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs text-ink">{inv.email}</div>
                      <div className="text-xs text-ink-muted">
                        <span className="capitalize">{inv.role.toLowerCase()}</span> · expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyLink url={inv.url} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Revoke invitation for ${inv.email}`}
                      disabled={revokeInvitation.isPending}
                      onClick={() => revokeInvitation.mutate({ id: inv.id })}
                    >
                      <Trash />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      )}

      <Dialog open={pendingRemoval !== null} onOpenChange={(open) => !open && setPendingRemoval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              {pendingRemoval?.email} will lose access to this organization immediately.
            </DialogDescription>
          </DialogHeader>
          {removeMember.isError && (
            <p className="text-sm text-danger" role="alert">
              {removeMember.error.message}
            </p>
          )}
          <DialogFooter showCloseButton={false}>
            <Button variant="ghost" onClick={() => setPendingRemoval(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={removeMember.isPending}
              onClick={() => pendingRemoval && removeMember.mutate({ membershipId: pendingRemoval.id })}
            >
              {removeMember.isPending ? "Removing…" : "Remove member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
