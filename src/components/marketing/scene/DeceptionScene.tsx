"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery, useReducedMotion } from "@/lib/use-media-query";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sceneState } from "./scene-state";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

const DESKTOP = "(min-width: 768px) and (hover: hover)";

/**
 * Fixed WebGL layer behind the landing page. Hidden and paused while
 * `[data-hero]` is in view, fades in as the hero leaves. Sections that want
 * the scene visible stay transparent; `[data-scene-cover]` marks the opaque
 * block that pauses rendering while it fills the viewport, `[data-scene-idle]`
 * the closing section that rebuilds the twin as the sandbox lab.
 */
export function DeceptionScene() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP) === true;
  const [covered, setCovered] = useState(false);
  const [inHero, setInHero] = useState(true);

  useEffect(() => {
    if (!desktop || reduce) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
        sceneState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [desktop, reduce]);

  useGSAP(
    () => {
      if (!onLanding) return;
      // The hero is the product alone; the scene only exists past it.
      const hero = document.querySelector("[data-hero]");
      if (hero) {
        gsap.set(root.current, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: hero,
          start: "top bottom",
          end: "bottom 50%",
          onToggle: (self) => {
            setInHero(self.isActive);
            if (reduce) gsap.set(root.current, { autoAlpha: self.isActive ? 0 : 1 });
          },
        });
        if (!reduce) {
          // Fades in over the hero's second half; fully on when the story pins.
          gsap.fromTo(
            root.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: hero, start: "bottom 50%", end: "bottom top", scrub: true } },
          );
        }
      }
      if (reduce) {
        // One still frame: both lattices, the attacker mid-redirect.
        sceneState.intro = 1;
        sceneState.story = 0.47;
        return;
      }
      const cover = document.querySelector("[data-scene-cover]");
      if (cover) {
        ScrollTrigger.create({
          trigger: cover,
          start: "top top",
          end: "bottom bottom",
          onEnter: () => setCovered(true),
          onEnterBack: () => setCovered(true),
          onLeave: () => setCovered(false),
          onLeaveBack: () => setCovered(false),
        });
      }
      const idle = document.querySelector("[data-scene-idle]");
      if (idle) {
        gsap.fromTo(
          sceneState,
          { cta: 0 },
          {
            cta: 1,
            ease: "none",
            scrollTrigger: { trigger: idle, start: "top bottom", end: "top 40%", scrub: true },
          },
        );
      }
    },
    { dependencies: [reduce, onLanding], revertOnUpdate: true },
  );

  if (!onLanding) return null;
  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <SceneCanvas
        density={desktop ? 1 : 0.67}
        parallax={desktop && !reduce}
        dpr={desktop ? [1, 2] : [1, 1.5]}
        frameloop={reduce ? "demand" : covered || inHero ? "never" : "always"}
      />
    </div>
  );
}
