import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { getStripe, isStripeConfigured, mapPriceToPlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { env } from "@/env";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

/** Every subscription event resolves to the same write, so ordering and duplicates cannot drift the plan. */
async function syncSubscription(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata.orgId;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  if (!orgId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = ACTIVE_STATUSES.has(subscription.status) ? mapPriceToPlan(priceId) : "FREE";
  if (plan === null) {
    console.error(`Stripe webhook: unknown price id ${priceId} on subscription ${subscription.id}; plan left unchanged`);
    return;
  }
  const isCurrent = plan !== "FREE";

  // Scoped by customer so a mistyped orgId in metadata can never rewrite another tenant.
  await prisma.organization.updateMany({
    where: { id: orgId, stripeCustomerId: customerId },
    data: {
      plan,
      stripeSubscriptionId: isCurrent ? subscription.id : null,
      stripePriceId: isCurrent ? priceId : null,
      trialEndsAt: isCurrent && subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });
}

async function notify(orgId: string, title: string, message: string) {
  await prisma.notification.create({
    data: { orgId, type: "billing", title, message, actionUrl: "/dashboard/admin/billing" },
  });
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: the event id is the primary key, so a redelivery is a no-op.
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw err;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          await syncSubscription(await stripe.subscriptions.retrieve(id));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object);
        break;

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object;
        if (subscription.metadata.orgId && subscription.trial_end) {
          const ends = new Date(subscription.trial_end * 1000).toISOString().slice(0, 10);
          await notify(subscription.metadata.orgId, "Trial ending soon", `Your trial ends on ${ends}. Add a payment method to continue.`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const sub = invoice.parent?.subscription_details?.subscription;
        const subId = typeof sub === "string" ? sub : sub?.id;
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          if (subscription.metadata.orgId) {
            await notify(subscription.metadata.orgId, "Payment failed", "Your latest payment failed. Please update your payment method.");
          }
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    // Release the idempotency row so Stripe's retry can reprocess.
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
