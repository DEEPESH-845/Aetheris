import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { ensureTenant } from "@/server/tenant";
import { env } from "@/env";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ code: "BILLING_UNAVAILABLE", error: "Self-serve billing is not available yet. Contact sales@aetheris.ai for access." }, { status: 503 });
  }

  try {
    const { orgId, role } = await ensureTenant(userId);
    if (role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Only an owner or admin can manage billing." }, { status: 403 });
    }
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { stripeCustomerId: true } });
    if (!org?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Could not open the billing portal. Try again." }, { status: 500 });
  }
}
