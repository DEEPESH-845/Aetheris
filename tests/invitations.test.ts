import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      getUser: async (id: string) => ({
        primaryEmailAddress: { emailAddress: `${id}@example.com` },
        emailAddresses: [{ emailAddress: `${id}@example.com` }],
        firstName: "Test",
        lastName: id.slice(-4),
      }),
    },
  }),
  auth: async () => ({ userId: null }),
}));

import { prisma } from "@/lib/db";
import { ensureTenant } from "@/server/tenant";
import { acceptInvitation } from "@/server/invitations";
import { appRouter } from "@/server/routers/_app";

const RUN = `i${Date.now().toString(36)}`;
const owner = `user_${RUN}_o`;
const invitee = `user_${RUN}_i`;
const stranger = `user_${RUN}_s`;

async function cleanup() {
  const ids = [owner, invitee, stranger];
  const orgs = await prisma.membership.findMany({ where: { userId: { in: ids } }, select: { orgId: true } });
  await prisma.organization.deleteMany({ where: { id: { in: orgs.map((o) => o.orgId) } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
beforeAll(cleanup);
afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

describe("invitation accept flow", () => {
  it("joins the inviting org exactly once, only for the invited email, and expires", async () => {
    const t = await ensureTenant(owner);
    const caller = appRouter.createCaller({ userId: owner, orgId: t.orgId, role: "OWNER", ip: null, prisma });
    const inv = await caller.org.inviteMember({ email: `${invitee}@example.com`, role: "ADMIN" });
    expect(inv.emailed).toBe(false); // no RESEND_API_KEY in tests
    const token = inv.url.split("/invite/")[1];
    expect((await caller.org.listInvitations()).map((i) => i.email)).toContain(`${invitee}@example.com`);

    expect(await acceptInvitation("nope", invitee)).toMatchObject({ ok: false, reason: "invalid" });
    expect(await acceptInvitation(token, stranger)).toMatchObject({ ok: false, reason: "email_mismatch" });

    expect(await acceptInvitation(token, invitee)).toMatchObject({ ok: true, alreadyMember: false, orgId: t.orgId });
    expect(await acceptInvitation(token, invitee)).toMatchObject({ ok: true, alreadyMember: true });
    expect(await prisma.membership.count({ where: { userId: invitee, orgId: t.orgId } })).toBe(1);
    expect((await ensureTenant(invitee))).toEqual({ orgId: t.orgId, role: "ADMIN" });
    expect(await caller.org.listInvitations()).toHaveLength(0);

    await prisma.membership.deleteMany({ where: { userId: invitee } });
    const again = await caller.org.inviteMember({ email: `${invitee}@example.com`, role: "VIEWER" });
    await prisma.invitation.update({ where: { id: again.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await acceptInvitation(again.url.split("/invite/")[1], invitee)).toMatchObject({ ok: false, reason: "expired" });
    await caller.org.revokeInvitation({ id: again.id });
    await expect(caller.org.revokeInvitation({ id: again.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
