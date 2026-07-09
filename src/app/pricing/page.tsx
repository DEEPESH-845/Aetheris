"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Building2, Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { CyberButton } from "@/components/core/CyberButton";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Shield,
    description: "Perfect for evaluation and individual researchers",
    features: [
      "Command Center (read-only)",
      "3 simulations/month",
      "1 sandbox twin",
      "Basic threat monitoring",
      "Community support",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    planId: "FREE" as const,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    icon: Zap,
    description: "For small SOC teams getting started with deception",
    features: [
      "Everything in Free",
      "25 simulations/month",
      "5 sandbox twins",
      "3 attack vectors",
      "Basic analytics",
      "Email support (48h)",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
    planId: "STARTER" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    icon: Crown,
    description: "For mid-size security teams with full AI capabilities",
    features: [
      "Everything in Starter",
      "100 simulations/month",
      "20 sandbox twins",
      "All 6 attack vectors",
      "AI Core access",
      "Autonomous defense mode",
      "REST API access",
      "30-day audit logs",
      "Priority support (24h)",
    ],
    cta: "Start Free Trial",
    variant: "primary" as const,
    planId: "PRO" as const,
    popular: true,
  },
  {
    name: "Business",
    price: "$299",
    period: "/month",
    icon: Building2,
    description: "For enterprise SOCs requiring full autonomy",
    features: [
      "Everything in Pro",
      "Unlimited simulations",
      "50 sandbox twins",
      "Custom attack vectors",
      "Full autonomous defense",
      "Playbook builder",
      "3D topology",
      "Team management (50 seats)",
      "365-day audit logs",
      "Webhook integrations",
      "White labeling",
      "Phone support (4h)",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
    planId: "BUSINESS" as const,
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planName: string, planId: string) {
    if (planId === "FREE") {
      window.location.href = "/dashboard";
      return;
    }

    if (!isSignedIn) {
      // Clerk sign-in modal will handle this via the wrapping component
      return;
    }

    setLoadingPlan(planName);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval: "monthly" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  function renderPlanButton(plan: typeof plans[number]) {
    const isLoading = loadingPlan === plan.name;

    if (plan.planId === "FREE") {
      return (
        <Link href="/dashboard">
          <CyberButton variant={plan.variant} className="w-full">
            {plan.cta}
          </CyberButton>
        </Link>
      );
    }

    if (!isSignedIn) {
      return (
        <SignInButton mode="modal" forceRedirectUrl={`/pricing`}>
          <CyberButton variant={plan.variant} className="w-full">
            {plan.cta}
          </CyberButton>
        </SignInButton>
      );
    }

    return (
      <CyberButton
        variant={plan.variant}
        className="w-full"
        onClick={() => handleCheckout(plan.name, plan.planId)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          plan.cta
        )}
      </CyberButton>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060c] text-text-primary">
      <SiteHeader />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Start free. Scale as your security operations grow. All paid plans include a 14-day free trial.
            </p>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-neon-red/10 border border-neon-red/30 rounded-sm text-center max-w-2xl mx-auto"
            >
              <p className="text-neon-red text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-neon-red/60 text-xs mt-1 hover:text-neon-red"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-panel p-6 flex flex-col relative ${
                  plan.popular ? "border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.1)]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-cyan text-black text-[10px] font-mono uppercase tracking-wider rounded-sm">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <plan.icon className="w-5 h-5 text-neon-cyan" />
                  <h3 className="font-outfit font-bold text-white">{plan.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-text-muted text-sm">{plan.period}</span>
                </div>
                
                <p className="text-text-secondary text-sm mb-6">{plan.description}</p>
                
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {renderPlanButton(plan)}
              </motion.div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center glass-panel p-8 max-w-2xl mx-auto"
          >
            <h3 className="font-outfit text-xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-text-secondary text-sm mb-4">
              Custom deployment, SSO, on-premise, dedicated support, and SLA guarantees.
            </p>
            <Link href="mailto:sales@aetheris.ai">
              <CyberButton variant="outline">
                Contact Sales
              </CyberButton>
            </Link>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
