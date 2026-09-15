"use client";

import { useSyncExternalStore } from "react";

/** `null` on the server and during hydration, then the live match. */
export function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => null,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
