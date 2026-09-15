"use client";

import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/use-media-query";
import { ScrollSmoother, ScrollTrigger, useGSAP } from "@/lib/gsap";

const HEADER_OFFSET = "top 64px";

/**
 * Creates the smoother. Rendered as the first leaf inside the content so its
 * effect commits before any sibling's ScrollTriggers: triggers that exist
 * before ScrollSmoother.create() end up with NaN progress.
 */
function SmootherInit({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!enabled) return;
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        effects: false,
        ignoreMobileResize: true,
      });

      // Same-page anchors go through the smoother so they land under the header.
      const jump = (hash: string, animate: boolean) => {
        const el = hash && document.querySelector(hash);
        if (el) smoother.scrollTo(el, animate, HEADER_OFFSET);
      };
      const onClick = (e: MouseEvent) => {
        const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
        if (!anchor || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        if (anchor.getAttribute("href")!.startsWith("/#") && location.pathname !== "/") return;
        e.preventDefault();
        history.pushState(null, "", anchor.hash);
        jump(anchor.hash, true);
      };
      document.addEventListener("click", onClick);
      if (location.hash) requestAnimationFrame(() => jump(location.hash, false));

      return () => document.removeEventListener("click", onClick);
    },
    { dependencies: [enabled], revertOnUpdate: true },
  );

  // Route change: same smoother, new content. Back to the top and remeasure.
  useGSAP(
    () => {
      ScrollSmoother.get()?.scrollTop(0);
      ScrollTrigger.refresh();
    },
    { dependencies: [pathname] },
  );

  return null;
}

/**
 * Inertial scrolling for the marketing site. Fixed elements (header, scene)
 * must live outside this wrapper. Off under reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div id="smooth-wrapper" className="z-[1]">
      <div id="smooth-content">
        <SmootherInit enabled={reduce === false} />
        {children}
      </div>
    </div>
  );
}
