# Product

## Register

product

## Users

Security engineers and SOC analysts who run Aetheris during live incidents and during simulated attack drills.
They sit in front of it for hours, often in dim rooms, scanning for state changes: a new threat, a twin spinning up, a countermeasure completing.
Secondary users are security leads and buyers evaluating the platform from the marketing site and pricing page.

## Product Purpose

Aetheris is an autonomous cyber deception platform.
It detects intrusions, redirects the attacker into an AI-generated sandboxed digital twin, and extracts their tooling and TTPs while production stays untouched.
The dashboard is the command surface for that loop: monitor threats, watch the AI reason, inspect twins, review defensive operations, and manage the organization and billing.
Success looks like an operator trusting the interface enough to let it act on its own.

## Brand Personality

Calm, precise, unshowy.
Aetheris should feel like instrumentation built by people who have been paged at 3am, not like a movie hacker console.
Confidence comes from legibility, density done right, and state that is always obvious.
The one expressive note is amber: the color of a lure, used only where the system acts or the user must decide.

## Anti-references

- Neon cyan and magenta glows, gradient text, scanlines, corner brackets, glass panels with inner glow: the cyberpunk console aesthetic.
- Forced preloaders, boot sequences, fake terminals built from divs, decorative pulsing dots.
- Uppercase tracked mono labels above every heading and every metric.
- Five accent colors competing on one screen.
- Version stamps, locale strips, and marketing copy like "God Speed", "lethal", "elevate".

## Design Principles

- State over decoration: every color, motion, and badge encodes a real state or action, otherwise it does not exist.
- Earned familiarity: controls look and behave like the best tools operators already use (Linear, Vercel, Datadog), so the tool disappears into the task.
- Density with hierarchy: many numbers on screen are fine, as long as the eye knows where to land first.
- One accent, locked: amber means "the system is acting or you should act". Red, green, and yellow are semantic threat states only.
- Show the product: the marketing site previews the real dashboard components, never a mockup of them.

## Accessibility & Inclusion

WCAG 2.2 AA minimum for all text and controls.
Body and muted text at 4.5:1 or better against every surface.
Every animation has a `prefers-reduced-motion` alternative.
Threat states are never conveyed by color alone: each carries a label or icon.
Full keyboard operability for the dashboard, including the command palette and sidebar.
