import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

let nextEvent: Stripe.Event;
vi.mock("@/lib/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stripe")>();
  return {
    ...actual,
    isStripeConfigured: () => true,
    getStripe: () => ({
      webhooks: { constructEvent: () => nextEvent },
      subscriptions: { retrieve: async () => nextEvent.data.object },
    }),
  };
});

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { POST } from "@/app/api/stripe/webhooks/route";

const RUN = `w${Date.now().toString(36)}`;
const customer = `cus_${RUN}`;
let orgId: string;

function subscription(over: Partial<Stripe.Subscription> & { id: string }): Stripe.Subscription {
  return {
    object: "subscription",
    customer,
    status: "active",
    trial_end: null,
    metadata: { orgId },
    items: { data: [{ price: { id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID } }] },
    ...over,
  } as unknown as Stripe.Subscription;
}

async function deliver(id: string, type: string, object: unknown) {
  nextEvent = { id, type, data: { object } } as unknown as Stripe.Event;
  const req = new NextRequest("http://localhost/api/stripe/webhooks", { method: "POST", body: "{}", headers: { "stripe-signature": "sig" } });
  return POST(req);
}

const org = () => prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

beforeAll(async () => {
  const created = await prisma.organization.create({ data: { name: RUN, slug: RUN, stripeCustomerId: customer } });
  orgId = created.id;
});
afterAll(async () => {
  await prisma.stripeEvent.deleteMany({ where: { id: { startsWith: `evt_${RUN}` } } });
  await prisma.organization.delete({ where: { id: orgId } });
  await prisma.$disconnect();
});

describe("stripe webhook", () => {
  it("activates the plan from a configured price and records the trial", async () => {
    const res = await deliver(`evt_${RUN}_1`, "customer.subscription.created", subscription({ id: "sub_new", status: "trialing", trial_end: 1_900_000_000 }));
    expect(res.status).toBe(200);
    const o = await org();
    expect(o.plan).toBe("PRO");
    expect(o.stripeSubscriptionId).toBe("sub_new");
    expect(o.trialEndsAt?.getTime()).toBe(1_900_000_000 * 1000);
  });

  it("ignores a redelivered event", async () => {
    const res = await deliver(`evt_${RUN}_1`, "customer.subscription.deleted", subscription({ id: "sub_new", status: "canceled" }));
    expect(await res.json()).toMatchObject({ duplicate: true });
    expect((await org()).plan).toBe("PRO");
  });

  it("does not rewrite another tenant's org when metadata points at the wrong customer", async () => {
    await deliver(`evt_${RUN}_2`, "customer.subscription.deleted", subscription({ id: "sub_other", status: "canceled", customer: "cus_someone_else" }));
    expect((await org()).plan).toBe("PRO");
  });

  it("leaves the plan unchanged for an unknown price id", async () => {
    await deliver(`evt_${RUN}_3`, "customer.subscription.updated", subscription({ id: "sub_new", items: { data: [{ price: { id: "price_unknown" } }] } } as never));
    expect((await org()).plan).toBe("PRO");
  });

  it("downgrades when the subscription ends", async () => {
    await deliver(`evt_${RUN}_4`, "customer.subscription.deleted", subscription({ id: "sub_new", status: "canceled" }));
    const o = await org();
    expect(o.plan).toBe("FREE");
    expect(o.stripeSubscriptionId).toBeNull();
    expect(o.trialEndsAt).toBeNull();
  });
});
