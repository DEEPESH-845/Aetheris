import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { enforceRetention } from "@/server/retention";

const RUN = `r${Date.now().toString(36)}`;
const ids = { free: `org_${RUN}_free`, pro: `org_${RUN}_pro`, ent: `org_${RUN}_ent` };
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

async function cleanup() {
  await prisma.auditLog.deleteMany({ where: { orgId: { in: Object.values(ids) } } });
  await prisma.organization.deleteMany({ where: { id: { in: Object.values(ids) } } });
}
beforeAll(cleanup);
afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

describe("retention job", () => {
  it("deletes past each plan's window, keeps billing and creation audit rows, never touches unlimited plans", async () => {
    await prisma.organization.createMany({
      data: [
        { id: ids.free, name: "f", slug: ids.free, plan: "FREE" },
        { id: ids.pro, name: "p", slug: ids.pro, plan: "PRO" },
        { id: ids.ent, name: "e", slug: ids.ent, plan: "ENTERPRISE" },
      ],
    });
    await prisma.auditLog.createMany({
      data: [
        { orgId: ids.free, action: "org.updated", resource: "old", createdAt: daysAgo(8) },
        { orgId: ids.free, action: "org.updated", resource: "fresh", createdAt: daysAgo(6) },
        { orgId: ids.free, action: "org.created", resource: "keep", createdAt: daysAgo(400) },
        { orgId: ids.free, action: "billing.subscription_created", resource: "keep", createdAt: daysAgo(400) },
        { orgId: ids.pro, action: "org.updated", resource: "pro-old", createdAt: daysAgo(91) },
        { orgId: ids.pro, action: "org.updated", resource: "pro-fresh", createdAt: daysAgo(30) },
        { orgId: ids.ent, action: "org.updated", resource: "ent", createdAt: daysAgo(3000) },
      ],
    });
    await prisma.notification.createMany({
      data: [
        { orgId: ids.free, type: "x", title: "old", message: "", createdAt: daysAgo(8) },
        { orgId: ids.free, type: "x", title: "fresh", message: "", createdAt: daysAgo(1) },
      ],
    });

    const deleted = await enforceRetention();
    expect(deleted.auditLogs).toBeGreaterThanOrEqual(2);
    expect(deleted.notifications).toBeGreaterThanOrEqual(1);

    const left = (orgId: string) => prisma.auditLog.findMany({ where: { orgId }, select: { resource: true } }).then((r) => r.map((x) => x.resource).sort());
    expect(await left(ids.free)).toEqual(["fresh", "keep", "keep"]);
    expect(await left(ids.pro)).toEqual(["pro-fresh"]);
    expect(await left(ids.ent)).toEqual(["ent"]);
    expect((await prisma.notification.findMany({ where: { orgId: ids.free } })).map((n) => n.title)).toEqual(["fresh"]);

    // Audit rows now block org deletion instead of vanishing with it.
    await expect(prisma.organization.delete({ where: { id: ids.ent } })).rejects.toThrow();
  });
});
