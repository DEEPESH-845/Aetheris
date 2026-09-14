import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export type AcceptResult =
  | { ok: true; orgId: string; orgName: string; alreadyMember: boolean }
  | { ok: false; reason: "invalid" | "expired" | "email_mismatch" };

/** Redeems an invite token for the signed-in Clerk user. Idempotent: re-visiting an accepted link is fine. */
export async function acceptInvitation(token: string, userId: string): Promise<AcceptResult> {
  const invitation = await prisma.invitation.findUnique({ where: { token }, include: { org: { select: { name: true } } } });
  if (!invitation) return { ok: false, reason: "invalid" };

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const emails = clerkUser.emailAddresses.map((e) => e.emailAddress.toLowerCase());
  if (!emails.includes(invitation.email)) return { ok: false, reason: "email_mismatch" };

  const existing = await prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId: invitation.orgId } } });
  if (existing) return { ok: true, orgId: invitation.orgId, orgName: invitation.org.name, alreadyMember: true };
  if (invitation.acceptedAt || invitation.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const email = clerkUser.primaryEmailAddress?.emailAddress.toLowerCase() ?? invitation.email;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  await prisma.$transaction([
    prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email, name, lastLoginAt: new Date() },
      update: { email, name, lastLoginAt: new Date() },
    }),
    prisma.membership.create({ data: { userId, orgId: invitation.orgId, role: invitation.role } }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } }),
    prisma.auditLog.create({
      data: { orgId: invitation.orgId, userId, action: "member.joined", resource: invitation.email, details: { role: invitation.role } },
    }),
  ]);
  // ponytail: a user who already owns their own org keeps landing there (ensureTenant picks the oldest
  // membership). Add an org switcher when multi-org users show up.
  return { ok: true, orgId: invitation.orgId, orgName: invitation.org.name, alreadyMember: false };
}
