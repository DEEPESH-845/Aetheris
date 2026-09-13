"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

export function SandboxCta() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-cta] > *", {
          y: 24,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.08,
          ease: EASE,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} data-scene-idle className="relative border-t">
      <div
        data-cta
        className="mx-auto flex min-h-dvh max-w-[1200px] flex-col items-start justify-end gap-6 px-6 pb-20 pt-[clamp(4rem,8vw,6rem)] md:min-h-[80vh] md:justify-center md:py-[clamp(4rem,8vw,6rem)]"
      >
        <h2 className="text-display max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
          Run a live-fire drill against the engine
        </h2>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink-muted">
          Six attack vectors, one click each. Watch the redirect, the twin, and the extracted IOCs in real time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/dashboard/sandbox" />}>
            Open the sandbox lab
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/sandbox" />}>
            See attack vectors
          </Button>
        </div>
      </div>
    </section>
  );
}
