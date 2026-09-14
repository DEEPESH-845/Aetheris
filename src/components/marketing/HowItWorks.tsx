"use client";

import { useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/use-media-query";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { sceneState } from "./scene/scene-state";

const STEPS = [
  {
    title: "Detect",
    body: "Network, IDS, and host telemetry is correlated against MITRE ATT&CK. In the current release this pipeline is simulated end to end so you can evaluate the workflow.",
    meta: "web-cluster-1  ·  T1110 brute force  ·  confidence 91%",
  },
  {
    title: "Redirect",
    body: "The attacker's session is steered away from production into a decoy that looks like the targeted host. The kernel-level redirect is the planned mechanism; today the dashboard shows it as a simulation.",
    meta: "sock_redirect  ·  10.0.4.12 → honey-web-01  ·  0 packets lost",
  },
  {
    title: "Deceive",
    body: "A twin of the targeted host is stood up and seeded with believable data and planted credentials, so the attacker keeps working while production stays untouched.",
    meta: "honey-web-01  ·  4 vCPU  ·  planted: ~/.aws/credentials",
  },
  {
    title: "Extract",
    body: "Every command, payload, and exfil attempt is recorded. IOCs and TTPs land in the profile before the attacker notices.",
    meta: "3 IOCs  ·  T1552.001  ·  185.220.101.3",
  },
];

const subscribeNoop = () => () => {};

export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Static list on the server and under reduced motion; pinned story after hydration.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const pinned = hydrated && reduce === false;

  useGSAP(
    () => {
      if (!pinned) return;
      const root = section.current!;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
      const n = steps.length;

      gsap.set(steps.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            sceneState.story = self.progress;
          },
          onLeave: () => {
            sceneState.story = 1;
          },
          onLeaveBack: () => {
            sceneState.story = 0;
          },
        },
      });

      // Each stage owns a quarter of the scroll; copy swaps at the boundary.
      for (let i = 1; i < n; i++) {
        const at = i / n;
        tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.04, ease: "power2.in" }, at - 0.02)
          .to(steps[i], { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, at);
      }
      bars.forEach((bar, i) => {
        tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 / n, ease: "none" }, i / n);
      });
      // Keep the timeline exactly 1 unit long so positions map to progress.
      tl.to({}, { duration: 0 }, 1);
    },
    { scope: section, dependencies: [pinned], revertOnUpdate: true },
  );

  return (
    <section
      ref={section}
      aria-labelledby="how-title"
      className={cn("relative", pinned && "min-h-dvh")}
    >
      <div
        className={cn(
          "mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-12",
          pinned ? "min-h-dvh content-end pb-16 lg:content-center lg:py-0" : "py-[clamp(4rem,8vw,7rem)]",
        )}
      >
        <div className={cn("lg:col-span-5", pinned && "relative")}>
          {pinned && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 bg-gradient-to-t from-bg via-bg/85 to-bg/0 lg:hidden"
            />
          )}
          <h2
            id="how-title"
            className="text-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink"
          >
            How a breach becomes intelligence
          </h2>
          <p className="mt-4 max-w-[46ch] text-base text-ink-muted">
            Four stages, each automated. An operator can watch every one of them from the command center.
          </p>

          {pinned ? (
            <>
              <ol className="relative mt-10 grid">
                {STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    data-step
                    className="col-start-1 row-start-1 grid grid-cols-[3rem_1fr] gap-4"
                  >
                    <span className="font-mono text-sm text-ink-subtle">0{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-medium text-ink">{step.title}</h3>
                      <p className="mt-2 max-w-[52ch] text-base text-ink-muted">{step.body}</p>
                      <p className="mt-4 font-mono text-xs text-ink-subtle">{step.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 grid grid-cols-4 gap-2 pl-16" aria-hidden="true">
                {STEPS.map((step) => (
                  <div key={step.title} className="h-px bg-border-strong">
                    <div data-bar className="h-full origin-left bg-accent" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ol className="mt-10">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t py-8 last:border-b">
                  <span className="font-mono text-sm text-ink-subtle">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium text-ink">{step.title}</h3>
                    <p className="mt-2 max-w-[60ch] text-base text-ink-muted">{step.body}</p>
                    <p className="mt-4 font-mono text-xs text-ink-subtle">{step.meta}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="hidden lg:col-span-7 lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
