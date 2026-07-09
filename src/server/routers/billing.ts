import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { getStripe, PLANS, PLAN_LIMITS, type PlanType } from "@/lib/stripe";

export const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return null;
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        trialEndsAt: true,
      },
    });
    return org;
  }),

  getLimits: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return null;
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { plan: true },
    });

    return PLAN_LIMITS[org?.plan ?? "FREE"];
  }),

  createCheckout: adminProcedure
    .input(z.object({
      plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
      interval: z.enum(["monthly", "yearly"]).default("monthly"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new Error("No organization");

      const org = await ctx.prisma.organization.findUnique({
        where: { id: ctx.orgId },
        select: { stripeCustomerId: true },
      });

      const planConfig = PLANS[input.plan as PlanType];
      const priceId = input.interval === "yearly"
        ? planConfig.yearlyPriceId
        : planConfig.monthlyPriceId;

      if (!priceId) {
        throw new Error("Stripe not configured for this plan");
      }

      const stripe = getStripe();

      let customerId = org?.stripeCustomerId;
      if (!customerId) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.userId },
        });
        const customer = await stripe.customers.create({
          email: user?.email ?? ctx.userId,
          metadata: { orgId: ctx.orgId, userId: ctx.userId },
        });
        customerId = customer.id;
        await ctx.prisma.organization.update({
          where: { id: ctx.orgId },
          data: { stripeCustomerId: customerId },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card", "upi"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?canceled=true`,
        subscription_data: {
          trial_period_days: 14,
          metadata: { orgId: ctx.orgId },
        },
        metadata: { orgId: ctx.orgId },
      });

      return { url: checkoutSession.url };
    }),

  createPortal: adminProcedure.mutation(async ({ ctx }) => {
    if (!ctx.orgId) throw new Error("No organization");

    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { stripeCustomerId: true },
    });

    if (!org?.stripeCustomerId) {
      throw new Error("No active subscription");
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing`,
    });

    return { url: portalSession.url };
  }),
});
