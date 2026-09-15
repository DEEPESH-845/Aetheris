import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const SIMULATION_STATUS = ["idle", "running", "completed", "failed", "archived"] as const;

export const simulationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.simulation.findMany({
      where: { orgId: ctx.orgId },
      include: { twins: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1).max(120), config: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.simulation.create({
        data: { orgId: ctx.orgId, name: input.name, config: input.config as Prisma.InputJsonObject | undefined },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sim = await ctx.prisma.simulation.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: { twins: true },
      });
      if (!sim) throw new TRPCError({ code: "NOT_FOUND" });
      return sim;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(SIMULATION_STATUS) }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.prisma.simulation.updateMany({
        where: { id: input.id, orgId: ctx.orgId },
        data: { status: input.status },
      });
      if (count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { id: input.id, status: input.status };
    }),
});
