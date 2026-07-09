import { Plan } from "@prisma/client";

type FeatureKey =
  | "sandbox.unlimited_twins"
  | "sandbox.advanced_vectors"
  | "ai.custom_models"
  | "ai.threat_intel_feeds"
  | "defensive.autonomous_mode"
  | "defensive.playbook_builder"
  | "topology.real_3d"
  | "analytics.advanced"
  | "api.access"
  | "team.management"
  | "audit.logs"
  | "white_label"
  | "sso"
  | "priority_support"
  | "on_prem_deployment";

const PLAN_FEATURES: Record<Plan, FeatureKey[]> = {
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
};

export type { FeatureKey };

export function hasFeature(plan: Plan, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export function getPlanFeatures(plan: Plan): FeatureKey[] {
  return PLAN_FEATURES[plan] ?? [];
}
