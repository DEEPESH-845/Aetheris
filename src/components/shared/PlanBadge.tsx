"use client";

import { cn } from "@/utils/cn";

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-white/10 text-text-secondary border-white/20",
  STARTER: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  PRO: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  BUSINESS: "bg-neon-magenta/10 text-neon-magenta border-neon-magenta/30",
  ENTERPRISE: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
};

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider border",
        PLAN_COLORS[plan] ?? PLAN_COLORS.FREE,
        className
      )}
    >
      {plan}
    </span>
  );
}
