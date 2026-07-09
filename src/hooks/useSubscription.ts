"use client";

import { api } from "@/utils/trpc";

export function useSubscription() {
  const { data: subscription, isLoading: subLoading } = api.billing.getSubscription.useQuery();
  const { data: limits, isLoading: limitsLoading } = api.billing.getLimits.useQuery();

  return {
    subscription,
    limits,
    isLoading: subLoading || limitsLoading,
    plan: subscription?.plan ?? "FREE",
    isTrialActive: subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) > new Date() : false,
    isPaid: subscription?.plan !== "FREE" && subscription?.stripeSubscriptionId != null,
  };
}
