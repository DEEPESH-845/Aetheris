import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getStripe, isStripeConfigured, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { ensureTenant } from "@/server/tenant";
import { env } from "@/env";

const bodySchema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { code: "BILLING_UNAVAILABLE", error: "Self-serve billing is not available yet. Contact sales@aetheris.ai for access." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const { plan, interval } = parsed.data;

  try {
    const { orgId, role } = await ensureTenant(userId);
    if (role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Only an owner or admin can change the plan." }, { status: 403 });
    }

    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });
    const stripe = getStripe();

    // An org with a live subscription changes plan in the portal, never through a second checkout.
    if (org.stripeSubscriptionId && org.stripeCustomerId) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing`,
      });
      return NextResponse.json({ url: portal.url });
    }

    const priceId = interval === "yearly" ? PLANS[plan].yearlyPriceId : PLANS[plan].monthlyPriceId;
    if (!priceId) {
      return NextResponse.json({ code: "BILLING_UNAVAILABLE", error: "This plan is not available yet." }, { status: 503 });
    }

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const customer = await stripe.customers.create(
        { email: user?.email, metadata: { orgId, userId } },
        { idempotencyKey: `customer:${orgId}` },
      );
      customerId = customer.id;
      await prisma.organization.update({ where: { id: orgId }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?canceled=true`,
      subscription_data: { trial_period_days: 14, metadata: { orgId } },
      metadata: { orgId },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}
