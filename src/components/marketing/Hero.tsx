"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "./LivePreview";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-16 pb-20 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-10 lg:pt-8">
      <motion.div
        className="flex flex-col items-start gap-6 lg:col-span-6"
        variants={container}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-ink"
        >
          Attackers break in. They never reach production.
        </motion.h1>
        <motion.p variants={item} className="max-w-[52ch] text-[17px] leading-relaxed text-ink-muted">
          Aetheris detects the intrusion, reroutes the session into an AI-built twin, and captures the tooling while it happens.
        </motion.p>
        <motion.div variants={item} className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/dashboard" />}>
            Open dashboard
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/architecture" />}>
            Read the architecture
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="lg:col-span-6"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <LivePreview />
      </motion.div>
    </section>
  );
}
