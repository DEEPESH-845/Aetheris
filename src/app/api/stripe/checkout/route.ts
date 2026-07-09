import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, type PlanType } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, interval = "monthly" } = await req.json();

    if (!plan || !(plan in PLANS) || plan === "FREE") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    let membership = await prisma.membership.findFirst({
      where: { userId: session.userId },
      include: { org: true },
    });

    // Auto-create organization for new users who don't have one yet
    if (!membership) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      const slug = `org-${session.userId.slice(0, 8)}-${Date.now().toString(36)}`;
      const org = await prisma.organization.create({
        data: {
          name: user?.name ?? user?.email ?? "My Organization",
          slug,
          plan: "FREE",
          members: {
            create: {
              userId: session.userId,
              role: "OWNER",
            },
          },
        },
        include: { members: true },
      });
      membership = {
        id: org.members[0].id,
        userId: session.userId,
        orgId: org.id,
        role: "OWNER",
        teamId: null,
        createdAt: new Date(),
        org,
      } as any;
    }

    if (!membership) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    const org = membership.org;
    const planConfig = PLANS[plan as PlanType];
    const stripe = getStripe();

    // Get or create Stripe customer
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      const customer = await stripe.customers.create({
        email: user?.email ?? session.userId,
        metadata: { orgId: org.id, userId: session.userId },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = interval === "yearly"
      ? planConfig.yearlyPriceId
      : planConfig.monthlyPriceId;

    if (!priceId) {
      return NextResponse.json({ error: "Stripe not configured for this plan" }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card", "upi"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { orgId: org.id },
      },
      metadata: { orgId: org.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
