"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { CyberButton } from "@/components/core/CyberButton";
import { CyberPanel } from "@/components/core/CyberPanel";
import { PlanBadge } from "@/components/shared/PlanBadge";

function BillingContent() {
  const { subscription, plan, isTrialActive, limits } = useSubscription();
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

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white">Billing</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your subscription and payment</p>
      </div>

      {/* Success/Cancel Messages */}
      {checkoutSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-sm flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
          <div>
            <p className="text-neon-green text-sm font-medium">Payment successful!</p>
            <p className="text-text-secondary text-xs">Your subscription is now active. Welcome to your new plan.</p>
          </div>
        </motion.div>
      )}

      {checkoutCanceled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-sm flex items-center gap-3"
        >
          <XCircle className="w-5 h-5 text-neon-red flex-shrink-0" />
          <div>
            <p className="text-neon-red text-sm font-medium">Checkout canceled</p>
            <p className="text-text-secondary text-xs">No worries - you can try again anytime.</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-sm flex items-center gap-3"
        >
          <XCircle className="w-5 h-5 text-neon-red flex-shrink-0" />
          <div>
            <p className="text-neon-red text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-neon-red/60 text-xs mt-1 hover:text-neon-red"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Current Plan */}
      <CyberPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-outfit text-lg font-bold text-white">Current Plan</h2>
              <PlanBadge plan={plan} />
            </div>
            {isTrialActive && subscription?.trialEndsAt && (
              <p className="text-text-secondary text-sm">
                Trial ends {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {plan === "FREE" ? (
              <Link href="/pricing">
                <CyberButton variant="primary" size="sm">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade
                </CyberButton>
              </Link>
            ) : (
              <CyberButton
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Manage Subscription
              </CyberButton>
            )}
          </div>
        </div>
      </CyberPanel>

      {/* Usage Limits */}
      {limits && (
        <CyberPanel className="p-6">
          <h3 className="font-outfit font-bold text-white mb-4">Usage Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Simulations", value: limits.simulations, suffix: "/month" },
              { label: "Sandbox Twins", value: limits.twins, suffix: "/month" },
              { label: "API Calls", value: limits.apiCalls, suffix: "/month" },
              { label: "Team Members", value: limits.members, suffix: "" },
            ].map((item) => (
              <div key={item.label} className="bg-black/40 border border-white/10 rounded-sm p-4">
                <p className="text-text-muted text-xs font-mono uppercase">{item.label}</p>
                <p className="text-white text-xl font-bold mt-1">
                  {item.value === -1 ? "Unlimited" : item.value}
                  {item.value !== -1 && <span className="text-text-muted text-sm">{item.suffix}</span>}
                </p>
              </div>
            ))}
          </div>
        </CyberPanel>
      )}

      {/* Quick Upgrade */}
      {plan === "FREE" && (
        <CyberPanel className="p-6">
          <h3 className="font-outfit font-bold text-white mb-4">Ready to upgrade?</h3>
          <p className="text-text-secondary text-sm mb-4">
            Unlock AI-powered deception, autonomous defense, and team collaboration.
          </p>
          <div className="flex gap-2">
            <CyberButton
              variant="outline"
              size="sm"
              onClick={() => handleCheckout("STARTER")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading === "STARTER" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Starter $29/mo
            </CyberButton>
            <CyberButton
              variant="primary"
              size="sm"
              onClick={() => handleCheckout("PRO")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading === "PRO" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Pro $99/mo
            </CyberButton>
            <CyberButton
              variant="outline"
              size="sm"
              onClick={() => handleCheckout("BUSINESS")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading === "BUSINESS" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Business $299/mo
            </CyberButton>
          </div>
        </CyberPanel>
      )}

      {/* Upgrade Options for Paid Plans */}
      {plan !== "FREE" && plan !== "BUSINESS" && (
        <CyberPanel className="p-6">
          <h3 className="font-outfit font-bold text-white mb-4">Upgrade your plan</h3>
          <p className="text-text-secondary text-sm mb-4">
            Get more features and capacity for your growing team.
          </p>
          <div className="flex gap-2">
            {plan === "STARTER" && (
              <>
                <CyberButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleCheckout("PRO")}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === "PRO" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Upgrade to Pro $99/mo
                </CyberButton>
                <CyberButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleCheckout("BUSINESS")}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === "BUSINESS" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Upgrade to Business $299/mo
                </CyberButton>
              </>
            )}
            {plan === "PRO" && (
              <CyberButton
                variant="primary"
                size="sm"
                onClick={() => handleCheckout("BUSINESS")}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === "BUSINESS" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Upgrade to Business $299/mo
              </CyberButton>
            )}
          </div>
        </CyberPanel>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Billing</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your subscription and payment</p>
        </div>
        <CyberPanel className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
          </div>
        </CyberPanel>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
