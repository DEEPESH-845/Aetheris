import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const orgRouter = router({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return null;
    return ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      include: {
        members: { include: { user: true, team: true } },
        _count: { select: { simulations: true, auditLogs: true } },
      },
    });
  }),

  update: adminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.update({
        where: { id: ctx.orgId! },
        data: { name: input.name },
      });
    }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return [];
    return ctx.prisma.membership.findMany({
      where: { orgId: ctx.orgId },
      include: { user: true, team: true },
    });
  }),

  inviteMember: adminProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
      teamId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return ctx.prisma.invitation.create({
        data: {
          orgId: ctx.orgId!,
          email: input.email,
          role: input.role,
          token,
          expiresAt,
        },
      });
    }),

  removeMember: adminProcedure
    .input(z.object({ membershipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.membership.delete({
        where: { id: input.membershipId },
      });
    }),
});
