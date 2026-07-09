import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility and direct imports
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  FREE: { name: "Free", priceId: null, monthlyPriceId: null, yearlyPriceId: null },
  STARTER: {
    name: "Starter",
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  PRO: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  BUSINESS: {
    name: "Business",
    monthlyPriceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function mapPriceToPlan(priceId: string): PlanType {
  if (priceId.includes("starter")) return "STARTER";
  if (priceId.includes("pro")) return "PRO";
  if (priceId.includes("business")) return "BUSINESS";
  return "FREE";
}

export const PLAN_LIMITS = {
  FREE: { simulations: 3, twins: 1, apiCalls: 100, members: 2, retentionDays: 7 },
  STARTER: { simulations: 25, twins: 5, apiCalls: 5000, members: 5, retentionDays: 30 },
  PRO: { simulations: 100, twins: 20, apiCalls: 50000, members: 15, retentionDays: 90 },
  BUSINESS: { simulations: -1, twins: 50, apiCalls: 200000, members: 50, retentionDays: 365 },
  ENTERPRISE: { simulations: -1, twins: -1, apiCalls: -1, members: -1, retentionDays: -1 },
} as const;

export const PLAN_FEATURES = {
  FREE: [],
  STARTER: ["sandbox.advanced_vectors", "analytics.advanced"],
  PRO: [
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "analytics.advanced",
    "api.access",
    "audit.logs",
    "priority_support",
  ],
  BUSINESS: [
    "sandbox.unlimited_twins",
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "defensive.playbook_builder",
    "topology.real_3d",
    "analytics.advanced",
    "api.access",
    "team.management",
    "audit.logs",
    "priority_support",
    "white_label",
  ],
  ENTERPRISE: [
    "sandbox.unlimited_twins",
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "defensive.playbook_builder",
    "topology.real_3d",
    "analytics.advanced",
    "api.access",
    "team.management",
    "audit.logs",
    "sso",
    "white_label",
    "priority_support",
    "on_prem_deployment",
  ],
} as const;

export type FeatureKey = (typeof PLAN_FEATURES)[PlanType][number];

export function hasFeature(plan: PlanType, feature: string): boolean {
  return (PLAN_FEATURES[plan] as readonly string[])?.includes(feature) ?? false;
}
