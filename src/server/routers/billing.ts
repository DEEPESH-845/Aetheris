import { router, protectedProcedure } from "../trpc";
import { PLAN_LIMITS } from "@/lib/stripe";

export const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        trialEndsAt: true,
      },
    });
  }),

  getLimits: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { plan: true },
    });
    return PLAN_LIMITS[org?.plan ?? "FREE"];
  }),
});
