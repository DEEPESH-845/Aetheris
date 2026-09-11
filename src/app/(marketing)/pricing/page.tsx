"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanId = "FREE" | "STARTER" | "PRO" | "BUSINESS";

const plans: { id: PlanId; name: string; price: string; period: string; description: string; features: string[]; cta: string; recommended?: boolean }[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For evaluation and individual researchers.",
    features: ["Command center (read-only)", "3 simulations per month", "1 sandbox twin", "Basic threat monitoring", "Community support"],
    cta: "Get started",
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "For small SOC teams starting with deception.",
    features: ["Everything in Free", "25 simulations per month", "5 sandbox twins", "3 attack vectors", "Basic analytics", "Email support, 48h"],
    cta: "Start free trial",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$99",
    period: "per month",
    description: "For mid-size teams that want the full AI core.",
    features: ["Everything in Starter", "100 simulations per month", "20 sandbox twins", "All 6 attack vectors", "AI core access", "Autonomous defense mode", "REST API access", "30-day audit log", "Priority support, 24h"],
    cta: "Start free trial",
    recommended: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "$299",
    period: "per month",
    description: "For enterprise SOCs running fully autonomous.",
    features: ["Everything in Pro", "Unlimited simulations", "50 sandbox twins", "Custom attack vectors", "Playbook builder", "Team management, 50 seats", "365-day audit log", "Webhook integrations", "White labeling", "Phone support, 4h"],
    cta: "Start free trial",
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: PlanId) {
    if (planId === "FREE") {
      window.location.assign("/dashboard");
      return;
    }
    if (!isSignedIn) return;
    setLoadingPlan(planId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout. Try again.");
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Try again.");
      setLoadingPlan(null);
    }
  }

  function PlanButton({ plan }: { plan: (typeof plans)[number] }) {
    const variant = plan.recommended ? "primary" : "secondary";
    if (plan.id === "FREE") {
      return (
        <Button variant={variant} className="w-full" render={<Link href="/dashboard" />}>
          {plan.cta}
        </Button>
      );
    }
    if (!isSignedIn) {
      return (
        <SignInButton mode="modal" forceRedirectUrl="/pricing">
          <Button variant={variant} className="w-full">
            {plan.cta}
          </Button>
        </SignInButton>
      );
    }
    const loading = loadingPlan === plan.id;
    return (
      <Button variant={variant} className="w-full" onClick={() => handleCheckout(plan.id)} disabled={loadingPlan !== null}>
        {loading ? "Redirecting…" : plan.cta}
      </Button>
    );
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-[clamp(4rem,8vw,7rem)]">
      <div className="max-w-[60ch]">
        <h1 className="text-display text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
          Pricing
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-muted">
          Start free. Every paid plan includes a 14-day trial.
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-8 rounded-panel border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
          <Button variant="ghost" size="sm" className="ml-3" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={cn("flex flex-col rounded-panel border bg-surface p-6", plan.recommended && "border-accent")}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-ink">{plan.name}</h2>
              {plan.recommended && <Badge variant="accent">Recommended</Badge>}
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl text-ink">{plan.price}</span>
              <span className="text-sm text-ink-subtle">{plan.period}</span>
            </div>
            <p className="mt-3 min-h-10 text-sm text-ink-muted">{plan.description}</p>
            <ul className="mt-6 flex flex-col gap-2 border-t pt-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <PlanButton plan={plan} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-medium text-ink">Enterprise</h2>
          <p className="mt-1 max-w-[55ch] text-sm text-ink-muted">
            Custom deployment, SSO, on-premise, dedicated support, and SLA guarantees.
          </p>
        </div>
        <Button variant="secondary" render={<a href="mailto:sales@aetheris.ai" />}>
          Contact sales
        </Button>
      </div>
    </section>
  );
}
