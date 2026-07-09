import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";

export const auditRouter = router({
  list: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      action: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return { logs: [], total: 0 };

      const where = { orgId: ctx.orgId, ...(input.action ? { action: input.action } : {}) };

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.auditLog.count({ where }),
      ]);

      return { logs, total };
    }),

  create: protectedProcedure
    .input(z.object({
      action: z.string(),
      resource: z.string(),
      details: z.any().optional(),
      ip: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new Error("No organization");
      return ctx.prisma.auditLog.create({
        data: {
          orgId: ctx.orgId,
          userId: ctx.userId,
          action: input.action,
          resource: input.resource,
          details: input.details,
          ip: input.ip,
        },
      });
    }),
});
