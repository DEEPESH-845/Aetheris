import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const simulationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return [];
    return ctx.prisma.simulation.findMany({
      where: { orgId: ctx.orgId },
      include: { twins: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), config: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new Error("No organization");
      return ctx.prisma.simulation.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          config: input.config,
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.simulation.findUnique({
        where: { id: input.id },
        include: { twins: true },
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.simulation.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
