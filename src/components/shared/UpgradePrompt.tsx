"use client";

import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CyberButton } from "../core/CyberButton";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  description: string;
}

export function UpgradePrompt({ feature, requiredPlan, description }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-cyber-darker/80 backdrop-blur-sm"
    >
      <div className="glass-panel p-8 max-w-md text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
          <Lock className="w-6 h-6 text-neon-cyan" />
        </div>
        <h3 className="font-outfit text-xl font-bold text-white">{feature}</h3>
        <p className="text-text-secondary text-sm">{description}</p>
        <p className="text-xs font-mono text-neon-cyan">
          Required: {requiredPlan} plan or higher
        </p>
        <Link href="/pricing">
          <CyberButton variant="primary" className="w-full">
            Upgrade to {requiredPlan}
            <ArrowRight className="w-4 h-4 ml-2" />
          </CyberButton>
        </Link>
      </div>
    </motion.div>
  );
}
