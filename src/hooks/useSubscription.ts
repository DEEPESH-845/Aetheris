"use client";

import { api } from "@/utils/trpc";

export function useSubscription() {
  const { data: subscription, isLoading: subLoading, isError: subError } = api.billing.getSubscription.useQuery();
  const { data: limits, isLoading: limitsLoading, isError: limitsError } = api.billing.getLimits.useQuery();

  return {
    subscription,
    limits,
    isLoading: subLoading || limitsLoading,
    isError: subError || limitsError,
    plan: subscription?.plan ?? "FREE",
    isTrialActive: subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) > new Date() : false,
    isPaid: subscription?.plan !== "FREE" && subscription?.stripeSubscriptionId != null,
  };
}
