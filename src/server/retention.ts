import "server-only";
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/stripe";

// Audit rows that must outlive the retention window: tenancy and billing evidence.
const KEEP_AUDIT = { OR: [{ action: "org.created" }, { action: { startsWith: "billing." } }] };

const plans = (Object.keys(PLAN_LIMITS) as Plan[]).filter((p) => PLAN_LIMITS[p].retentionDays > 0);
const cutoff = (plan: Plan, now: Date) => new Date(now.getTime() - PLAN_LIMITS[plan].retentionDays * 86_400_000);

/** Deletes AuditLog, Notification and Activity rows past each org's plan retention. */
export async function enforceRetention(now = new Date()) {
  const totals = { auditLogs: 0, notifications: 0, activities: 0 };
  for (const plan of plans) {
    const lt = cutoff(plan, now);
    const [a, n, act] = await Promise.all([
      prisma.auditLog.deleteMany({ where: { org: { plan }, createdAt: { lt }, NOT: KEEP_AUDIT } }),
      prisma.notification.deleteMany({ where: { org: { plan }, createdAt: { lt } } }),
      // Activity hangs off the user; keep it as long as the user's longest-retention org allows.
      prisma.activity.deleteMany({
        where: {
          createdAt: { lt },
          user: { memberships: { some: { org: { plan } }, every: { org: { plan: { in: plans.filter((p) => PLAN_LIMITS[p].retentionDays <= PLAN_LIMITS[plan].retentionDays) } } } } },
        },
      }),
    ]);
    totals.auditLogs += a.count;
    totals.notifications += n.count;
    totals.activities += act.count;
  }
  return totals;
}
