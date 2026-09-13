"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);

// Dev only: lets Playwright drive the smoother and read triggers in E2E checks.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  Object.assign(window, { gsap, ScrollTrigger, ScrollSmoother });
}

/** Matches DESIGN.md `--ease-out-expo`. */
export const EASE = "expo.out";

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
