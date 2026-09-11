import Link from "next/link";
import { LockSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  description: string;
}

export function UpgradePrompt({ feature, requiredPlan, description }: UpgradePromptProps) {
  const plan = requiredPlan.charAt(0) + requiredPlan.slice(1).toLowerCase();
  return (
    <div className="absolute inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-bg/80 p-6 backdrop-blur-[2px]">
      <Panel className="w-full max-w-sm items-center gap-3 p-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-control bg-accent-soft text-accent">
          <LockSimple size={20} weight="duotone" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-medium text-ink">{feature}</h3>
          <p className="text-sm text-ink-muted">{description}</p>
          <p className="text-xs text-ink-subtle">Requires the {plan} plan or higher.</p>
        </div>
        <Button render={<Link href="/pricing" />} className="mt-2">
          Upgrade to {plan}
        </Button>
      </Panel>
    </div>
  );
}
