"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type Icon,
  SquaresFour,
  Crosshair,
  Brain,
  Graph,
  Cube,
  ShieldCheck,
  Flask,
  ChartBar,
  GearSix,
  Buildings,
  Users,
  CreditCard,
  ClipboardText,
  SidebarSimple,
} from "@phosphor-icons/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { BrandMark } from "@/components/shared/BrandMark";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Command Center", icon: SquaresFour },
      { href: "/dashboard/monitoring", label: "Threat Monitor", icon: Crosshair },
      { href: "/dashboard/ai-core", label: "AI Core", icon: Brain },
      { href: "/dashboard/topology", label: "Network Topology", icon: Graph },
      { href: "/dashboard/orchestration", label: "Orchestration", icon: Cube },
      { href: "/dashboard/defensive-ops", label: "Defensive Ops", icon: ShieldCheck },
      { href: "/dashboard/sandbox", label: "Sandbox Lab", icon: Flask },
      { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
      { href: "/dashboard/settings", label: "Configuration", icon: GearSix },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/admin", label: "Admin Overview", icon: Buildings },
      { href: "/dashboard/admin/members", label: "Team Members", icon: Users },
      { href: "/dashboard/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/admin/audit-log", label: "Audit Log", icon: ClipboardText },
    ],
  },
];

export function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/dashboard/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function threatTone(score: number): "success" | "accent" | "danger" {
  if (score > 75) return "danger";
  if (score > 40) return "accent";
  return "success";
}

interface SidebarNavProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ collapsed = false, onToggle, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const globalThreatScore = useSimulationStore((s) => s.globalThreatScore);
  const tone = threatTone(globalThreatScore);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-surface transition-[width] duration-250 ease-out-expo",
        collapsed ? "w-14" : "w-60",
        className,
      )}
    >
      <div className={cn("flex h-[52px] shrink-0 items-center border-b", collapsed ? "justify-center" : "justify-between pr-2 pl-4")}>
        {!collapsed && (
          <Link href="/dashboard" className="rounded-control focus-visible:outline-2" aria-label="Aetheris home">
            <BrandMark />
          </Link>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-8 items-center justify-center rounded-control text-ink-subtle transition-[background-color,color] hover:bg-surface-2 hover:text-ink"
          >
            <SidebarSimple size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1 px-2 text-xs font-medium text-ink-subtle">{group.label}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const link = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-8 items-center gap-2.5 rounded-control px-2 text-sm transition-[background-color,color] duration-150",
                      "before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent before:opacity-0 before:transition-opacity",
                      active
                        ? "bg-surface-2 text-ink before:opacity-100"
                        : "text-ink-muted hover:bg-surface-2/60 hover:text-ink",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon size={16} aria-hidden="true" className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger render={link} />
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t p-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Threat score</span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : "text-success",
                )}
              >
                {globalThreatScore}
                <span className="text-ink-subtle">/100</span>
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
              <div
                className={cn(
                  "h-full transition-[width] duration-500",
                  tone === "danger" ? "bg-danger" : tone === "accent" ? "bg-accent" : "bg-success",
                )}
                style={{ width: `${globalThreatScore}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
