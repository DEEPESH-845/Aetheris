"use client";

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
} from "@phosphor-icons/react";

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
