"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { sceneState } from "./scene/scene-state";
import { LivePreview } from "./LivePreview";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) {
        sceneState.intro = 1;
        return;
      }
      const root = section.current!;
      const preview = root.querySelector<HTMLElement>("[data-hero-preview]")!;

      // Reveal: headline lines rise out of their masks, then body, actions, preview.
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      const split = SplitText.create("[data-hero-title]", {
        type: "lines",
        mask: "lines",
        linesClass: "hero-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.09, ease: EASE }),
      });
      tl.from("[data-hero-copy] > *", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.35)
        .fromTo(
          preview,
          { autoAlpha: 0, rotationY: -14, rotationX: 6, y: 40, transformPerspective: 1400 },
          { autoAlpha: 1, rotationY: -4, rotationX: 2, y: 0, duration: 1.4 },
          0.25,
        );

      // Pointer: the preview leans a couple of degrees toward the cursor.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (hover: hover)", () => {
        const rx = gsap.quickTo(preview, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(preview, "rotationY", { duration: 0.8, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          ry(-4 + nx * 3);
          rx(2 - ny * 2.5);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      // Scroll: hand the camera to the story section, let the copy drift back.
      gsap.to(sceneState, {
        intro: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top 64px", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-copy], [data-hero-preview-outer]", {
        y: -60,
        autoAlpha: 0,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: { trigger: root, start: "top 64px", end: "bottom 25%", scrub: true },
      });

      return () => {
        split.revert();
        mm.revert();
      };
    },
    { scope: section, dependencies: [reduce], revertOnUpdate: true },
  );

  return (
    <section
      ref={section}
      data-hero
      className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-16 pb-20 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-10 lg:pt-8"
    >
      <div data-hero-copy className="flex flex-col items-start gap-6 lg:col-span-7">
        <h1
          data-hero-title
          className="text-display text-[clamp(2.4rem,4.8vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-ink"
        >
          Attackers break in.
          <br />
          They never reach production.
        </h1>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink-muted">
          Aetheris detects the intrusion, reroutes the session into an AI-built twin, and captures the tooling while it happens.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/dashboard" />}>
            Open dashboard
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/architecture" />}>
            Read the architecture
          </Button>
        </div>
      </div>

      <div data-hero-preview-outer className="lg:col-span-5 [perspective:1400px]">
        <div data-hero-preview className="will-change-transform [transform-style:preserve-3d]">
          <LivePreview />
        </div>
      </div>
    </section>
  );
}
