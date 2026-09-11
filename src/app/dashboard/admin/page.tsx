"use client";

import Link from "next/link";
import { ArrowRight, ChartBar, ClipboardText, CreditCard, Users, type Icon } from "@phosphor-icons/react";
import { useOrg } from "@/hooks/useOrg";
import { useSubscription } from "@/hooks/useSubscription";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

const adminLinks: { href: string; label: string; icon: Icon; description: string }[] = [
  { href: "/dashboard/admin/members", label: "Team members", icon: Users, description: "Invite people and manage roles" },
  { href: "/dashboard/admin/billing", label: "Billing", icon: CreditCard, description: "Subscription, invoices, payment method" },
  { href: "/dashboard/admin/audit-log", label: "Audit log", icon: ClipboardText, description: "Every administrative action, with who and when" },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar, description: "Threat trends and platform usage" },
];

export default function AdminPage() {
  const { org, isLoading } = useOrg();
  const { plan, isTrialActive } = useSubscription();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Admin" description="Organization settings, people, and billing." />

      <Panel className="flex-row items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <h2 className="truncate text-base font-medium text-ink">{org?.name ?? "No organization"}</h2>
          )}
          <p className="text-sm text-ink-muted">Organization</p>
        </div>
        <div className="flex items-center gap-2">
          <PlanBadge plan={plan} />
          {isTrialActive && <StatusBadge label="Trial active" tone="accent" />}
        </div>
      </Panel>

      <ul className="grid gap-4 md:grid-cols-2">
        {adminLinks.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center justify-between gap-4 rounded-panel border bg-surface px-5 py-4 transition-[background-color,border-color] duration-150 hover:bg-surface-2"
            >
              <span className="flex items-center gap-4">
                <span className="flex size-9 items-center justify-center rounded-control bg-surface-2 text-ink-muted group-hover:text-ink">
                  <item.icon size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{item.label}</span>
                  <span className="block text-sm text-ink-muted">{item.description}</span>
                </span>
              </span>
              <ArrowRight size={16} className="text-ink-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
