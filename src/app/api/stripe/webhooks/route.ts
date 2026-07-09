import { NextRequest, NextResponse } from "next/server";
import { getStripe, mapPriceToPlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        if (orgId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: priceId,
              plan: mapPriceToPlan(priceId ?? ""),
              trialEndsAt: null,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const orgId = subscription.metadata.orgId;
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              stripePriceId: priceId,
              plan: mapPriceToPlan(priceId),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata.orgId;
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: { plan: "FREE", stripeSubscriptionId: null, stripePriceId: null },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const orgId = subscription.metadata.orgId;
          if (orgId) {
            await prisma.notification.create({
              data: {
                orgId,
                type: "billing",
                title: "Payment Failed",
                message: "Your latest payment failed. Please update your payment method.",
                actionUrl: "/dashboard/admin/billing",
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata.orgId;
        if (orgId) {
          const trialEnd = new Date(subscription.trial_end! * 1000);
          await prisma.notification.create({
            data: {
              orgId,
              type: "billing",
              title: "Trial Ending Soon",
              message: `Your trial ends on ${trialEnd.toLocaleDateString()}. Add a payment method to continue.`,
              actionUrl: "/dashboard/admin/billing",
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
