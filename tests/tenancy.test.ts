import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      getUser: async (id: string) => ({
        primaryEmailAddress: { emailAddress: `${id}@example.com` },
        firstName: "Test",
        lastName: id.slice(-4),
      }),
    },
  }),
  auth: async () => ({ userId: null }),
}));

import { prisma } from "@/lib/db";
import { ensureTenant } from "@/server/tenant";
import { appRouter } from "@/server/routers/_app";

const RUN = `t${Date.now().toString(36)}`;
const userA = `user_${RUN}_a`;
const userB = `user_${RUN}_b`;

async function cleanup() {
  const orgs = await prisma.membership.findMany({ where: { userId: { in: [userA, userB] } }, select: { orgId: true } });
  await prisma.organization.deleteMany({ where: { id: { in: orgs.map((o) => o.orgId) } } });
  await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
}

beforeAll(cleanup);
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("ensureTenant", () => {
  it("creates exactly one org and membership even under concurrent first requests", async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => ensureTenant(userA)));
    const orgIds = new Set(results.map((r) => r.orgId));
    expect(orgIds.size).toBe(1);
    expect(results.every((r) => r.role === "OWNER")).toBe(true);
    expect(await prisma.membership.count({ where: { userId: userA } })).toBe(1);
    expect((await prisma.user.findUnique({ where: { id: userA } }))?.email).toBe(`${userA}@example.com`);
  });
});

describe("tenant scoping", () => {
  it("cannot read or mutate another org's simulations or members", async () => {
    const a = await ensureTenant(userA);
    const b = await ensureTenant(userB);
    const callerA = appRouter.createCaller({ userId: userA, orgId: a.orgId, role: a.role, ip: null, prisma });
    const callerB = appRouter.createCaller({ userId: userB, orgId: b.orgId, role: b.role, ip: null, prisma });

    const sim = await callerB.simulation.create({ name: "b-sim" });
    await expect(callerA.simulation.get({ id: sim.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(callerA.simulation.updateStatus({ id: sim.id, status: "archived" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await prisma.simulation.findUnique({ where: { id: sim.id } }))?.status).toBe("idle");

    const ownerB = await prisma.membership.findFirstOrThrow({ where: { userId: userB } });
    await expect(callerA.org.removeMember({ membershipId: ownerB.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(callerB.org.removeMember({ membershipId: ownerB.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(await prisma.membership.count({ where: { id: ownerB.id } })).toBe(1);
  });

  it("rejects members without admin role and users without a tenant", async () => {
    const a = await ensureTenant(userA);
    const viewer = appRouter.createCaller({ userId: userB, orgId: a.orgId, role: "VIEWER", ip: null, prisma });
    await expect(viewer.audit.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    const nobody = appRouter.createCaller({ userId: null, orgId: null, role: null, ip: null, prisma });
    await expect(nobody.org.getCurrent()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("writes audit rows from server mutations, not from clients", async () => {
    const a = await ensureTenant(userA);
    const caller = appRouter.createCaller({ userId: userA, orgId: a.orgId, role: "OWNER", ip: "10.0.0.1", prisma });
    await caller.org.inviteMember({ email: "Colleague@Example.com", role: "MEMBER" });
    await caller.org.inviteMember({ email: "colleague@example.com", role: "ADMIN" });
    expect(await prisma.invitation.count({ where: { orgId: a.orgId } })).toBe(1);
    const { logs } = await caller.audit.list({});
    expect(logs.map((l) => l.action)).toContain("member.invited");
    expect(logs.find((l) => l.action === "member.invited")?.ip).toBe("10.0.0.1");
    expect("create" in caller.audit).toBe(false);
  });
});
