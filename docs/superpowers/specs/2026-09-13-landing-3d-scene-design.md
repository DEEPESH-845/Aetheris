# Landing page 3D scene: "The Lure"

Approved 2026-09-13.
Scope: `/` only. Other marketing pages untouched.

## Concept

One persistent WebGL scene, fixed behind the landing page, tells the deception loop as the reader scrolls.
Each element stands for one product concept and appears only where that concept acts (the full list is in DESIGN.md, Motion):
production lattice, perimeter hull with scan plane, attacker packet, redirect path, hollow twin lattice, extraction points with profile node, and anchored labels.
The closing call to action reuses only the twin, as the sandbox lab.

## Sections

- Hero: scene far and faint behind headline and the real `LivePreview` panels. GSAP line-mask headline reveal. Pointer parallax on desktop only.
- How it works: pinned for ~400vh, `ScrollTrigger` scrub drives the story (detect, redirect, deceive, extract). Step copy crossfades on the left.
- Stack logos, then capabilities: opaque sections cover the scene. Cards reveal on enter and tilt at most 4 degrees on hover.
- Sandbox CTA: transparent, scene idles behind it.

## Rules

- Palette stays inside the tokens: graphite cells, `--border-strong` edges, amber only on the lure and the packet, danger only on the compromised cell.
- No bloom, glow, scanlines, or glass. Depth from fog and edge contrast only.
- `prefers-reduced-motion`: one static frame, no pin, no smoother, text renders in place.
- Mobile: DPR capped at 1.5, fewer cells, no parallax.
- Canvas stops rendering while an opaque section covers it.

## Stack

`three` (pinned to r182: r183+ deprecates `THREE.Clock`, which `@react-three/fiber` still instantiates, and the warning cannot be silenced from app code), `@react-three/fiber`, `@react-three/drei` (Trail, Line, Html), `gsap` (ScrollTrigger, ScrollSmoother, SplitText), `@gsap/react`.

## Files

- `src/components/marketing/scene/`: `DeceptionScene.tsx`, `SceneCanvas.tsx`, `Lattice.tsx`, `Perimeter.tsx`, `Packet.tsx`, `RedirectPath.tsx`, `Extraction.tsx`, `SceneLabels.tsx`, `scene-state.ts`, `scene-config.ts`
- `src/components/marketing/SmoothScroll.tsx`
- Modified: `Hero.tsx`, `HowItWorks.tsx`, `Capabilities.tsx`, `SandboxCta.tsx`, `SiteHeader.tsx`, `(marketing)/layout.tsx`, `(marketing)/page.tsx`, `globals.css`, `DESIGN.md`
