import { router, adminProcedure } from "../trpc";
import { z } from "zod";

export const auditRouter = router({
  list: adminProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      action: z.string().max(64).optional(),
    }))
    .query(async ({ ctx, input }) => {
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
});
