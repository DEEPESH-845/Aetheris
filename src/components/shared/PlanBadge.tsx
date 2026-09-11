import { Badge } from "@/components/ui/badge";

const PLAN_VARIANT: Record<string, "default" | "accent" | "outline"> = {
  FREE: "default",
  STARTER: "accent",
  PRO: "accent",
  BUSINESS: "accent",
  ENTERPRISE: "outline",
};

export function PlanBadge({ plan, className }: { plan: string; className?: string }) {
  return (
    <Badge variant={PLAN_VARIANT[plan] ?? "default"} className={className}>
      {plan.charAt(0) + plan.slice(1).toLowerCase()}
    </Badge>
  );
}
