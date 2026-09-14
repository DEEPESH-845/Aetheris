import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { orgSettingsSchema, parseOrgSettings } from "@/lib/org-settings";

export const orgRouter = router({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      include: {
        members: { include: { user: true, team: true } },
        _count: { select: { simulations: true, auditLogs: true } },
      },
    });
  }),

  update: adminProcedure
    .input(z.object({ name: z.string().trim().min(1).max(80) }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.update({
        where: { id: ctx.orgId },
        data: { name: input.name },
      });
      await ctx.prisma.auditLog.create({
        data: { orgId: ctx.orgId, userId: ctx.userId, action: "org.updated", resource: ctx.orgId, ip: ctx.ip, details: { name: input.name } },
      });
      return org;
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: ctx.orgId }, select: { settings: true } });
    return parseOrgSettings(org.settings);
  }),

  updateSettings: adminProcedure
    .input(orgSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.organization.update({ where: { id: ctx.orgId }, data: { settings: input } });
      await ctx.prisma.auditLog.create({
        data: { orgId: ctx.orgId, userId: ctx.userId, action: "org.settings_updated", resource: ctx.orgId, ip: ctx.ip, details: input },
      });
      return input;
    }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.membership.findMany({
      where: { orgId: ctx.orgId },
      include: { user: true, team: true },
    });
  }),

  inviteMember: adminProcedure
    .input(z.object({
      email: z.string().email().max(254),
      role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
      teamId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const email = input.email.toLowerCase();

      const invitation = await ctx.prisma.invitation.upsert({
        where: { orgId_email: { orgId: ctx.orgId, email } },
        create: { orgId: ctx.orgId, email, role: input.role, token, expiresAt },
        update: { role: input.role, token, expiresAt, acceptedAt: null },
      });
      await ctx.prisma.auditLog.create({
        data: { orgId: ctx.orgId, userId: ctx.userId, action: "member.invited", resource: email, ip: ctx.ip, details: { role: input.role } },
      });
      return invitation;
    }),

  removeMember: adminProcedure
    .input(z.object({ membershipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.prisma.membership.findFirst({
        where: { id: input.membershipId, orgId: ctx.orgId },
        include: { user: { select: { email: true } } },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Member not found in this organization." });
      if (target.role === "OWNER") throw new TRPCError({ code: "FORBIDDEN", message: "Owners cannot be removed." });
      if (target.role === "ADMIN" && ctx.role !== "OWNER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only an owner can remove an admin." });
      }

      await ctx.prisma.membership.delete({ where: { id: target.id } });
      await ctx.prisma.auditLog.create({
        data: { orgId: ctx.orgId, userId: ctx.userId, action: "member.removed", resource: target.user.email, ip: ctx.ip },
      });
      return { id: target.id };
    }),
});
