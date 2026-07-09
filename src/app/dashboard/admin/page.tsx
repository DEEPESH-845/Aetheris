"use client";

import { motion } from "framer-motion";
import { Users, CreditCard, Shield, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useOrg } from "@/hooks/useOrg";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { StatusBadge } from "@/components/core/StatusBadge";
import { CyberPanel } from "@/components/core/CyberPanel";

const adminCards = [
  { href: "/dashboard/admin/members", label: "Team Members", icon: Users, description: "Manage your team and roles" },
  { href: "/dashboard/admin/billing", label: "Billing", icon: CreditCard, description: "Subscription, invoices, payment" },
  { href: "/dashboard/admin/audit-log", label: "Audit Log", icon: Shield, description: "Activity history and compliance" },
  { href: "/dashboard/analytics", label: "Analytics", icon: Activity, description: "Threat trends and usage metrics" },
];

export default function AdminPage() {
  const { org, isLoading: orgLoading } = useOrg();
  const { subscription, plan, isTrialActive } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your organization settings and team</p>
      </div>

      {/* Organization Overview */}
      <CyberPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-outfit text-lg font-bold text-white">{org?.name ?? "Loading..."}</h2>
            <p className="text-text-secondary text-sm mt-1">
              {org?.name ? "Organization" : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            {isTrialActive && (
              <StatusBadge status="active" label="Trial Active" />
            )}
          </div>
        </div>
      </CyberPanel>

      {/* Admin Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminCards.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={card.href}>
              <CyberPanel className="p-6 group hover:border-neon-cyan/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-white group-hover:text-neon-cyan transition-colors">
                        {card.label}
                      </h3>
                      <p className="text-text-secondary text-sm">{card.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-neon-cyan transition-colors" />
                </div>
              </CyberPanel>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
