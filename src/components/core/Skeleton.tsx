"use client";

import { cn } from "@/utils/cn";
import { HTMLMotionProps, motion } from "framer-motion";

export function Skeleton({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
      className={cn("bg-white/5 rounded-sm overflow-hidden relative", className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
    </motion.div>
  );
}
