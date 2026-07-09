"use client";

import { useOrg } from "./useOrg";
import { hasFeature, type FeatureKey } from "@/lib/feature-flags";

export function useFeatureFlag(feature: FeatureKey): boolean {
  const { org } = useOrg();
  if (!org) return false;
  return hasFeature(org.plan, feature);
}
