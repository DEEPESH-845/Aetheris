"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowSquareOut, ArrowUpRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useSubscription } from "@/hooks/useSubscription";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { StatBlock } from "@/components/shared/StatBlock";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

const UPGRADES: Record<string, { plan: string; label: string; primary?: boolean }[]> = {
  FREE: [
    { plan: "STARTER", label: "Starter, $29/mo" },
    { plan: "PRO", label: "Pro, $99/mo", primary: true },
    { plan: "BUSINESS", label: "Business, $299/mo" },
  ],
  STARTER: [
    { plan: "PRO", label: "Upgrade to Pro, $99/mo", primary: true },
    { plan: "BUSINESS", label: "Upgrade to Business, $299/mo" },
  ],
  PRO: [{ plan: "BUSINESS", label: "Upgrade to Business, $299/mo", primary: true }],
};

function Notice({ tone, title, body, onDismiss }: { tone: "success" | "danger"; title: string; body?: string; onDismiss?: () => void }) {
  const IconComponent = tone === "success" ? CheckCircle : XCircle;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-panel border px-4 py-3",
        tone === "success" ? "border-success/30 bg-success-soft" : "border-danger/30 bg-danger-soft",
      )}
    >
      <IconComponent size={18} className={cn("mt-0.5 shrink-0", tone === "success" ? "text-success" : "text-danger")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", tone === "success" ? "text-success" : "text-danger")}>{title}</p>
        {body && <p className="text-sm text-ink-muted">{body}</p>}
      </div>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      )}
    </div>
  );
}

function BillingContent() {
  const { subscription, plan, isTrialActive, limits, isLoading, isError } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("success") === "true";
  const checkoutCanceled = searchParams.get("canceled") === "true";

  async function handleCheckout(planType: string) {
    setCheckoutLoading(planType);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType, interval: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout. Try again.");
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Try again.");
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open the billing portal. Try again.");
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the billing portal. Try again.");
      setPortalLoading(false);
    }
  }

  const upgrades = process.env.NEXT_PUBLIC_BILLING_ENABLED === "true" ? (UPGRADES[plan] ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Billing" description="Your plan, usage limits, and payment details." />

      {checkoutSuccess && <Notice tone="success" title="Payment complete" body="Your subscription is active on the new plan." />}
      {checkoutCanceled && <Notice tone="danger" title="Checkout canceled" body="Nothing was charged. You can start again whenever you like." />}
      {error && <Notice tone="danger" title={error} onDismiss={() => setError(null)} />}
      {isError && <Notice tone="danger" title="Could not load your plan" body="Billing details are temporarily unavailable. Refresh to try again." />}

      <Panel>
        <PanelHeader
          title="Current plan"
          actions={
            plan === "FREE" ? (
              <Button size="sm" render={<Link href="/pricing" />}>
                <ArrowUpRight aria-hidden="true" />
                Upgrade
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handlePortal} disabled={portalLoading}>
                <ArrowSquareOut aria-hidden="true" />
                {portalLoading ? "Opening…" : "Manage subscription"}
              </Button>
            )
          }
        />
        <PanelBody className="flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <>
              <PlanBadge plan={plan} />
              {isTrialActive && subscription?.trialEndsAt && (
                <span className="text-sm text-ink-muted">Trial ends {dateFmt.format(new Date(subscription.trialEndsAt))}</span>
              )}
            </>
          )}
        </PanelBody>
      </Panel>

      {limits && (
        <Panel>
          <PanelHeader title="Usage limits" />
          <div className="grid grid-cols-2 divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
            {[
              { label: "Simulations", value: limits.simulations, unit: "per month" },
              { label: "Sandbox twins", value: limits.twins, unit: "per month" },
              { label: "API calls", value: limits.apiCalls, unit: "per month" },
              { label: "Team members", value: limits.members },
            ].map((item) => (
              <StatBlock
                key={item.label}
                label={item.label}
                value={item.value === -1 ? "Unlimited" : item.value}
                unit={item.value === -1 ? undefined : item.unit}
              />
            ))}
          </div>
        </Panel>
      )}

      {upgrades.length > 0 && (
        <Panel>
          <PanelHeader
            title={plan === "FREE" ? "Upgrade" : "Upgrade your plan"}
            description={plan === "FREE" ? "Unlock the AI core, autonomous defense, and team seats." : "More capacity and features as the team grows."}
          />
          <PanelBody className="flex flex-wrap gap-2">
            {upgrades.map((u) => (
              <Button
                key={u.plan}
                variant={u.primary ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleCheckout(u.plan)}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === u.plan ? "Redirecting…" : u.label}
              </Button>
            ))}
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <PageHeader title="Billing" description="Your plan, usage limits, and payment details." />
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
