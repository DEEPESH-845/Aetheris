# Design

Visual system for Aetheris.
Every value here is the source of truth for `src/app/globals.css`; change it here first, then in the tokens.

## Theme

Single dark theme, locked at the root (`<html class="dark">`, `color-scheme: dark`).
Scene: an analyst at 2am in a dim SOC, three monitors, one of them Aetheris, reading for state changes for hours.
Light mode is not offered; a light surface in that room is glare.

Color strategy: **Restrained**.
Tinted graphite neutrals carry 95% of the surface.
One accent (amber) appears only on primary actions, current selection, and "system is acting" states.
Red, green, and amber-as-warning are semantic and never decorative.

## Color

All tokens in OKLCH.
Neutrals carry a 0.006 chroma toward hue 250 (cool, not blue).

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `oklch(0.16 0.006 250)` | Page background |
| `--surface` | `oklch(0.20 0.006 250)` | Panels, cards, sidebar |
| `--surface-2` | `oklch(0.24 0.006 250)` | Hover rows, raised controls, inputs |
| `--surface-3` | `oklch(0.28 0.006 250)` | Active/pressed, selected rows |
| `--border` | `oklch(1 0 0 / 0.08)` | Hairlines, panel edges |
| `--border-strong` | `oklch(1 0 0 / 0.14)` | Focused inputs, control outlines |
| `--ink` | `oklch(0.93 0.004 250)` | Primary text (13.9:1 on bg) |
| `--ink-muted` | `oklch(0.70 0.008 250)` | Secondary text (6.5:1 on bg, 5.2:1 on surface-2) |
| `--ink-subtle` | `oklch(0.60 0.008 250)` | Tertiary text, placeholders (4.6:1 on bg) |
| `--accent` | `oklch(0.80 0.15 75)` | Primary action, selection, "acting" state |
| `--accent-hover` | `oklch(0.84 0.15 75)` | Primary action hover |
| `--accent-ink` | `oklch(0.20 0.03 75)` | Text on accent |
| `--accent-soft` | `oklch(0.80 0.15 75 / 0.12)` | Accent tint backgrounds |
| `--danger` | `oklch(0.66 0.20 25)` | Critical/high threat, destructive actions |
| `--danger-soft` | `oklch(0.66 0.20 25 / 0.12)` | Danger tint backgrounds |
| `--success` | `oklch(0.76 0.15 150)` | Healthy, resolved, online |
| `--success-soft` | `oklch(0.76 0.15 150 / 0.12)` | Success tint backgrounds |
| `--ring` | `oklch(0.80 0.15 75 / 0.6)` | Focus-visible ring |

Semantic vocabulary for threat/state UI:

- Severity: CRITICAL = danger filled, HIGH = danger text, MEDIUM = accent text, LOW = ink-muted. Always paired with the label.
- Node status: healthy = success, warning = accent, compromised = danger, isolated = ink-muted with dashed border, redirected = accent (the lure is working).
- Lifecycle/progress (twins, operations): running = accent, success = success, failed = danger, pending = ink-subtle.

Chart palette (ordered): `--accent`, `--ink-muted`, `--danger`, `--success`, `--ink-subtle`.
Area fills use the line color at 0.12 alpha.

Shadows are not used for elevation on dark surfaces; a `--border` hairline plus a surface step does the job.
The only shadow is on floating layers (popover, dialog): `0 8px 24px oklch(0 0 0 / 0.5)`.

## Typography

| Role | Family | Notes |
| --- | --- | --- |
| UI and body | Geist (`--font-sans`) | Everything in the dashboard, marketing body, buttons, labels |
| Data | Geist Mono (`--font-mono`) | IPs, IDs, timestamps, metrics, code, logs. `tabular-nums` always |
| Marketing display | Bricolage Grotesque (`--font-display`) | Landing/architecture/sandbox/pricing h1 and h2 only. Never in the dashboard |

Product scale (fixed rem, ratio ~1.2):

- `text-xs` 12px / 16px: table meta, timestamps
- `text-sm` 13px / 20px: default UI text, table cells, labels
- `text-base` 15px / 24px: body prose, form inputs
- `text-lg` 18px / 26px: panel titles
- `text-xl` 22px / 28px: page titles
- `text-2xl` 28px / 34px: stat values (mono)

Marketing scale:

- h1: `clamp(2.5rem, 5.5vw, 4.5rem)`, weight 600, letter-spacing -0.02em, line-height 1.02, `text-wrap: balance`
- h2: `clamp(1.75rem, 3.2vw, 2.5rem)`, weight 600, letter-spacing -0.015em, line-height 1.1
- body: 17px / 1.6, max 62ch, color `--ink-muted` for supporting copy

Weights: 400 body, 500 labels and buttons, 600 headings. Nothing heavier.
No uppercase tracked labels except table column headers (12px, weight 500, `--ink-subtle`, letter-spacing 0.02em).

## Shape

- Controls (buttons, inputs, selects, badges): 6px
- Panels, cards, popovers, dialogs: 10px
- Avatars and icon tiles: 6px (rounded square, never circle)
- No pills anywhere.

## Spacing and Layout

4px base grid.

- Dashboard shell: sidebar 240px (collapsible to 56px icon rail), top bar 52px, content padding 24px, panel gap 16px.
- Panel padding: 16px; dense tables and feeds: 12px rows.
- Marketing: container `max-w-[1200px]`, section padding `clamp(4rem, 8vw, 7rem)`, side gutter 24px.
- Body prose max 65ch.

Z-index scale: `--z-dropdown: 10; --z-sticky: 20; --z-overlay: 30; --z-modal: 40; --z-toast: 50; --z-tooltip: 60`.

## Components

Built on shadcn/ui (base-nova style, `@base-ui/react`) with tokens overridden; never shipped in default state.

- `Button`: variants `primary` (accent fill, accent-ink text), `secondary` (surface-2 fill, border), `ghost`, `danger` (danger fill only for confirmed destructive actions, otherwise danger outline). Sizes `sm` 28px, `md` 32px, `lg` 40px (marketing only). Icon-only buttons require `aria-label`.
- `Panel`: `surface` fill, `border` hairline, 10px radius. Optional `PanelHeader` (title 13px/500 + right slot) and `PanelBody`. No corner brackets, no glow, no scanline.
- `StatBlock`: label (13px muted) above value (mono 28px) with optional delta and inline sparkline. Not a card; sits in a `Panel` grid divided by hairlines.
- `SeverityBadge` / `StatusBadge`: 6px radius, tint background, 12px/500 label. Dot only when it encodes live state (one per component max).
- `EmptyState`: icon tile, one-line title, one-line hint, optional primary action.
- `Skeleton`: shape-matched blocks, 4px radius, `surface-2` shimmer disabled under reduced motion.
- Forms: label above input, helper below, error below in `--danger`, `autocomplete` and `name` on every input.
- Tables: sticky header, 12px uppercase column headers, mono numerics right-aligned, hover row `surface-2`, selected row `surface-3`.
- Feeds/logs: mono 12px, timestamp column fixed width, newest at the bottom with auto-scroll that pauses when the user scrolls up.
- Command palette (`⌘K`): navigation across all dashboard routes plus actions (run vector, force handoff).

Icons: Phosphor (`@phosphor-icons/react`), weight `regular` at 16px in UI, `duotone` at 20px in empty states. One family; no hand-drawn SVG icons.

## Motion

Product: 150ms hover, 200ms state change, 250ms panel/drawer. Easing `cubic-bezier(0.16, 1, 0.3, 1)`. Animate `transform`, `opacity`, `background-color`, `border-color` only; never `transition: all`. No page-load choreography in the dashboard; content renders immediately, live rows fade in over 200ms.

Marketing (landing page): motion is the product story, driven by GSAP and one three.js scene.
The scene ("the lure") is a fixed WebGL layer behind the page.
Every element in it stands for one thing in the product, and each appears only in the stage where that thing acts:

- Production lattice (graphite cells, solid faces): the customer's cluster. First thing on screen when the scene fades in; recedes into fog while the twin is live.
- Perimeter hull and scan plane (hairline box, translucent amber plane): the sensors. The plane sweeps slowly in idle, fast during Detect, and the hull flashes danger on impact.
- Packet (amber point with trail): the attacker. Circles the hull in reconnaissance, lands on one cell, is bent into the twin, works inside it, fades as it is captured.
- Redirect path (dashed amber route): the kernel socket rewrite. Drawn ahead of the packet during Redirect, dims once the session is inside.
- Twin lattice (amber edges, hollow faces): the deception host. A facade, so no solid faces. Assembles cell by cell in Redirect, dissolves in Extract, and is rebuilt as the sandbox lab behind the closing call to action.
- Extraction points and profile node (amber points, wireframe octahedron): indicators lifting out of the twin into the attacker profile.
- Labels (mono 11px, hairline rule): name the object they are anchored to: production, twin, attacker profile.

It is the only decorative 3D on the site; other marketing pages stay flat.

- Hero: the product alone, no scene. Headline lines rise out of line masks (1.1s, 90ms stagger, `expo.out`), body and actions follow, the live preview settles from a 14 degree tilt to 4 degrees and leans at most 3 degrees toward the pointer. The scene layer is hidden and paused while the hero is in view and fades in over the hero's second half, fully on when the story pins.
- How it works: pinned for 400vh; scroll scrubs the scene through detect, redirect, deceive, extract and crossfades the step copy at each quarter. Progress hairlines under the steps fill in amber.
- Capabilities and CTA: one fade-up on enter, `once`. Cards tilt at most 4 degrees toward the pointer on hover.
- Scroll is inertial (ScrollSmoother, 1.1s) on the marketing site only.
- Scene rules: colors are the tokens only (`--surface-2` faces, `--border-strong` edges, amber for the twin and packet, danger for the compromised cell). No bloom, glow, scanlines, or glass. Depth from fog and edge contrast. The canvas stops rendering while an opaque section covers it.
- Logo marquee is the only infinite loop besides the scene's idle packet (paused under reduced motion).

Marketing (other pages): one hero reveal (headline, body, actions; 600ms, 60ms stagger) and at most three `whileInView` fade-ups, `once: true`.

`prefers-reduced-motion: reduce` collapses every animation to instant or crossfade.
On the landing page it also disables the smoother and the pin, renders the steps as a static list, and leaves the scene on one still frame.

## Imagery

The product is the imagery.
Marketing hero embeds the real `NetworkTopology` and live threat feed driven by the same simulation engine as the dashboard.
Stack logos come from `simple-icons` SVG paths, rendered in `--ink-muted`.
No stock photography, no generated illustrations, no div-built mockups.
