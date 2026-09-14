import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface Tenant {
  orgId: string;
  role: Role;
}

/**
 * Mirrors the Clerk user into Postgres and guarantees exactly one membership.
 * Runs once per user in practice: the fast path is a single indexed read.
 * The advisory lock makes concurrent first requests serialize instead of creating two orgs.
 */
export async function ensureTenant(userId: string): Promise<Tenant> {
  const existing = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { orgId: true, role: true },
  });
  if (existing) return existing;

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? `${userId}@users.noreply.aetheris.local`;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

    const raced = await tx.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { orgId: true, role: true },
    });
    if (raced) return raced;

    await tx.user.upsert({
      where: { id: userId },
      create: { id: userId, email, name, lastLoginAt: new Date() },
      update: { email, name, lastLoginAt: new Date() },
    });

    const org = await tx.organization.create({
      data: {
        name: name ?? email.split("@")[0],
        slug: `org-${userId.replace(/^user_/, "").slice(0, 8).toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`,
        members: { create: { userId, role: "OWNER" } },
      },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: { orgId: org.id, userId, action: "org.created", resource: org.id },
    });
    return { orgId: org.id, role: "OWNER" as const };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}
