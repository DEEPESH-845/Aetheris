# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the neon cyberpunk frontend with a restrained graphite + amber system across the marketing site and the SOC dashboard, fix the structural bugs found in the audit, and leave every route verified in a browser.

**Architecture:** One token layer in `globals.css` (OKLCH, dark only) feeds shadcn/ui primitives in `src/components/ui/`. Domain components (`dashboard/`, `visualization/`, `marketing/`) consume only those primitives and tokens. Routes are grouped into `(marketing)` and `dashboard` with their own layouts; the simulation store and engine are untouched.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui (base-nova, `@base-ui/react`), `framer-motion`, `recharts`, `zustand`, Clerk, tRPC, `@phosphor-icons/react`, `simple-icons`, `next/font/google` (Geist, Geist Mono, Bricolage Grotesque).

**Spec:** `PRODUCT.md` (register, principles, anti-references) and `DESIGN.md` (tokens, type, shape, motion, components). Read both before any task.

## Global Constraints

- Dark theme only; `<html class="dark">` with `color-scheme: dark`; `<meta name="theme-color" content="#101216">`.
- Colors only via tokens from `DESIGN.md`; no raw hex/oklch in components except chart stroke props that read CSS variables.
- Exactly one accent (`--accent`, amber). `--danger` and `--success` are semantic only.
- Fonts: Geist (`font-sans`), Geist Mono (`font-mono`, always with `tabular-nums`), Bricolage Grotesque (`font-display`, marketing h1/h2 only).
- Radius: 6px controls, 10px panels, 4px badges. No `rounded-full` except the single live-state dot.
- Icons: `@phosphor-icons/react` only. Delete every `lucide-react` import. Icon-only buttons carry `aria-label`.
- No em dash or en dash in any visible string. Use `-`, `,`, or a period.
- Preserve all route slugs, nav labels, tRPC calls, Stripe flows, and store/engine logic.
- No `transition-all`, no `h-screen` (use `h-dvh` / `min-h-dvh`), no `window.addEventListener('scroll')`, no `outline-none` without a `focus-visible` ring.
- Every animation honors `prefers-reduced-motion` (Framer: `useReducedMotion`; CSS: `@media (prefers-reduced-motion: reduce)`).
- Each task ends with `npm run lint` and `npx tsc --noEmit` passing, and a commit.
- Commit messages: conventional prefix, no agent co-author line except the attribution block required by the session.

## Verification Environment

- `npm install` (done once).
- `.env.local` supplied by the user with Clerk, database, and Stripe keys.
- `npm run dev` on port 3000; browser checks with the `webapp-testing` skill (Playwright) at 1440px and 400px widths for every route.
- Final gate: `npm run build` succeeds; `web-design-guidelines` review over `src/**/*.tsx` reports no findings.

## File Structure

```
src/app/
  layout.tsx                      root: fonts, Clerk theme, providers, skip link, metadata
  globals.css                     tokens + base + utilities (rewritten)
  not-found.tsx                   branded 404
  error.tsx                       route error boundary
  (marketing)/layout.tsx          SiteHeader + SiteFooter shell
  (marketing)/page.tsx            landing
  (marketing)/architecture/page.tsx
  (marketing)/sandbox/page.tsx
  (marketing)/pricing/page.tsx
  dashboard/layout.tsx            server layout -> <AppShell>
  dashboard/loading.tsx           skeleton grid
  dashboard/{page,monitoring,ai-core,topology,orchestration,defensive-ops,sandbox,analytics,settings}/page.tsx
  dashboard/admin/{page,members,billing,audit-log}/page.tsx
src/components/ui/                shadcn primitives (button, input, label, select, switch, slider, badge, separator,
                                  skeleton, table, tabs, dialog, dropdown-menu, sheet, tooltip, command, scroll-area)
src/components/shared/
  Panel.tsx                       Panel, PanelHeader, PanelBody
  PageHeader.tsx                  title + description + actions
  StatBlock.tsx                   label / mono value / delta / sparkline slot
  StatusBadge.tsx                 SeverityBadge, StatusBadge (state vocab from DESIGN.md)
  EmptyState.tsx
  FeedList.tsx                    mono log list with sticky-bottom autoscroll
  UpgradePrompt.tsx               restyled
  PlanBadge.tsx                   restyled
  BrandMark.tsx                   wordmark + mark (single SVG, ink color)
src/components/app-shell/
  AppShell.tsx                    sidebar + topbar + content; collapse state in localStorage
  SidebarNav.tsx                  nav groups, active state, collapsed rail
  TopBar.tsx                      breadcrumb, threat score, Force Defense, UserButton
  CommandPalette.tsx              cmdk over routes + actions
src/components/dashboard/         restyled feeds and panels (existing names kept)
src/components/visualization/     NetworkTopology, ThreatScoreChart, NetworkTrafficChart (restyled, token colors)
src/components/marketing/
  SiteHeader.tsx, SiteFooter.tsx, Hero.tsx, LivePreview.tsx, StackLogos.tsx, HowItWorks.tsx,
  Capabilities.tsx, SandboxCta.tsx
src/lib/utils.ts                  single cn() (src/utils/cn.ts deleted)
src/lib/format.ts                 Intl helpers: formatTime, formatNumber, formatRelative
```

Deleted: `src/components/core/*`, `src/components/marketing/{Preloader,TerminalBoot,LogoWall,BentoFeatures}.tsx`, `src/components/ui/split-flap-display.tsx`, `src/utils/cn.ts`, `src/components/shared/DashboardLayout.tsx`.

---

## Phase 0: Foundation

### Task 1: Dependencies and lint baseline

**Files:**
- Modify: `package.json`
- Delete: `src/utils/cn.ts`
- Modify: every file importing `@/utils/cn` (6 files) to import `@/lib/utils`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `@/lib/utils`.

- [ ] **Step 1: Add dependencies**

```bash
npm install @phosphor-icons/react simple-icons
npm uninstall lucide-react
```

`lucide-react` removal will break imports until later tasks; that is expected. Do not commit until Task 3 compiles.

- [ ] **Step 2: Collapse the duplicate `cn` helper**

```bash
sed -i '' "s#@/utils/cn#@/lib/utils#g" $(grep -rl "@/utils/cn" src)
rm src/utils/cn.ts
```

- [ ] **Step 3: Verify**

Run: `grep -rn "utils/cn" src` → no output.

### Task 2: Tokens and base styles

**Files:**
- Rewrite: `src/app/globals.css`

**Interfaces:**
- Produces Tailwind utilities: `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-surface-3`, `border-border`, `border-border-strong`, `text-ink`, `text-ink-muted`, `text-ink-subtle`, `bg-accent`, `text-accent`, `bg-accent-soft`, `text-accent-ink`, `text-danger`, `bg-danger-soft`, `text-success`, `bg-success-soft`, `ring-ring`, `font-sans`, `font-mono`, `font-display`, `rounded-control` (6px), `rounded-panel` (10px), `rounded-badge` (4px), `ease-out-expo`, z-index vars.

- [ ] **Step 1: Write the file**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme {
  --color-bg: oklch(0.16 0.006 250);
  --color-surface: oklch(0.20 0.006 250);
  --color-surface-2: oklch(0.24 0.006 250);
  --color-surface-3: oklch(0.28 0.006 250);
  --color-border: oklch(1 0 0 / 0.08);
  --color-border-strong: oklch(1 0 0 / 0.14);
  --color-ink: oklch(0.93 0.004 250);
  --color-ink-muted: oklch(0.70 0.008 250);
  --color-ink-subtle: oklch(0.60 0.008 250);
  --color-accent: oklch(0.80 0.15 75);
  --color-accent-hover: oklch(0.84 0.15 75);
  --color-accent-ink: oklch(0.20 0.03 75);
  --color-accent-soft: oklch(0.80 0.15 75 / 0.12);
  --color-danger: oklch(0.66 0.20 25);
  --color-danger-soft: oklch(0.66 0.20 25 / 0.12);
  --color-success: oklch(0.76 0.15 150);
  --color-success-soft: oklch(0.76 0.15 150 / 0.12);
  --color-ring: oklch(0.80 0.15 75 / 0.6);

  /* shadcn aliases so generated primitives pick up the same palette */
  --color-background: var(--color-bg);
  --color-foreground: var(--color-ink);
  --color-card: var(--color-surface);
  --color-card-foreground: var(--color-ink);
  --color-popover: var(--color-surface-2);
  --color-popover-foreground: var(--color-ink);
  --color-primary: var(--color-accent);
  --color-primary-foreground: var(--color-accent-ink);
  --color-secondary: var(--color-surface-2);
  --color-secondary-foreground: var(--color-ink);
  --color-muted: var(--color-surface-2);
  --color-muted-foreground: var(--color-ink-muted);
  --color-accent-foreground: var(--color-accent-ink);
  --color-destructive: var(--color-danger);
  --color-input: var(--color-border-strong);

  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
  --font-display: var(--font-bricolage), var(--font-geist), ui-sans-serif, sans-serif;

  --radius-control: 6px;
  --radius-panel: 10px;
  --radius-badge: 4px;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  --shadow-float: 0 8px 24px oklch(0 0 0 / 0.5);
}

:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
  --z-tooltip: 60;
  color-scheme: dark;
}

@layer base {
  * { @apply border-border; }
  html { @apply font-sans antialiased; text-size-adjust: 100%; }
  body { @apply bg-bg text-ink; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  ::selection { background: var(--color-accent-soft); color: var(--color-ink); }
  :focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }
  h1, h2, h3 { text-wrap: balance; }
  p { text-wrap: pretty; }
  .font-mono, .tabular { font-variant-numeric: tabular-nums; }
  input, select, textarea { background-color: var(--color-surface-2); color: var(--color-ink); }
  select option { background-color: var(--color-surface-2); color: var(--color-ink); }
}

@layer utilities {
  .skip-link {
    @apply sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink;
  }
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-surface-3); border-radius: 5px; border: 2px solid var(--color-bg); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Clerk popover surfaces follow the token layer */
.cl-userButtonPopoverCard, .cl-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-float) !important;
  border-radius: var(--radius-panel) !important;
}
```

- [ ] **Step 2: Verify**

Run: `grep -c "neon\|cyber" src/app/globals.css` → `0`.

### Task 3: Root layout, fonts, metadata, 404, error

**Files:**
- Rewrite: `src/app/layout.tsx`
- Create: `src/app/not-found.tsx`, `src/app/error.tsx`
- Create: `src/lib/format.ts`

**Interfaces:**
- Produces: CSS vars `--font-geist`, `--font-geist-mono`, `--font-bricolage` on `<html>`.
- Produces: `formatTime(ts: number): string` (HH:mm:ss, `Intl.DateTimeFormat` with `hour12: false`), `formatNumber(n: number, opts?): string`, `formatRelative(ts: number): string` ("12s ago", via `Intl.RelativeTimeFormat`).

- [ ] **Step 1: Write `src/lib/format.ts`**

```ts
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const num = new Intl.NumberFormat("en-US");
const rel = new Intl.RelativeTimeFormat("en", { numeric: "always", style: "narrow" });

export function formatTime(ts: number) { return time.format(new Date(ts)); }
export function formatNumber(n: number, opts?: Intl.NumberFormatOptions) {
  return opts ? new Intl.NumberFormat("en-US", opts).format(n) : num.format(n);
}
export function formatRelative(ts: number, now = Date.now()) {
  const s = Math.round((ts - now) / 1000);
  if (Math.abs(s) < 60) return rel.format(s, "second");
  if (Math.abs(s) < 3600) return rel.format(Math.round(s / 60), "minute");
  return rel.format(Math.round(s / 3600), "hour");
}
```

- [ ] **Step 2: Write `src/app/layout.tsx`**

Fonts via `next/font/google`: `Geist({ variable: "--font-geist", subsets: ["latin"] })`, `Geist_Mono({ variable: "--font-geist-mono" })`, `Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz", "wdth"] })`.
Metadata: title template `%s | Aetheris`, description "Autonomous cyber deception. Aetheris redirects attackers into AI-generated sandboxed twins while production stays untouched.", `openGraph` with siteName, `themeColor: "#101216"`.
`<html lang="en" className={cn("dark", geist.variable, mono.variable, bricolage.variable)}>`, `<body className="min-h-dvh bg-bg text-ink">`, first child `<a href="#main" className="skip-link">Skip to content</a>`.
Clerk appearance: `baseTheme: dark`, variables `{ colorPrimary: "#e9b44c", colorBackground: "#14171c", colorInputBackground: "#1a1e24", colorText: "#ececec", colorTextSecondary: "#9aa0a8", borderRadius: "6px", fontFamily: "var(--font-geist)" }`, elements `{ formButtonPrimary: "bg-accent text-accent-ink hover:bg-accent-hover font-medium normal-case tracking-normal", card: "shadow-float", footerActionLink: "text-accent" }`. Remove every mono/uppercase override.

- [ ] **Step 3: Write `not-found.tsx` and `error.tsx`**

Both centered, `min-h-dvh`, BrandMark (Task 5) on top, title in `text-xl font-medium`, one-line body in `text-ink-muted`, primary `Button` "Back to overview" (`/dashboard`) and ghost "Home" (`/`). `error.tsx` is `"use client"`, receives `{ error, reset }`, shows `error.message` in a mono `bg-surface` block and a "Try again" primary button calling `reset()`.

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit` (expect only lucide errors in untouched files), `git add -A && git commit -m "feat(ui): token layer, fonts, root layout, 404 and error routes"`.

### Task 4: shadcn primitives

**Files:**
- Create via CLI: `src/components/ui/{button,input,label,select,switch,slider,badge,separator,skeleton,table,tabs,dialog,dropdown-menu,sheet,tooltip,command,scroll-area}.tsx`
- Modify: `components.json` (`iconLibrary` → keep `lucide` in the file but replace generated lucide imports with Phosphor equivalents after generation)

**Interfaces:**
- Produces: `Button` with `variant: "primary" | "secondary" | "ghost" | "danger" | "link"`, `size: "sm" | "md" | "lg" | "icon"`; all other primitives with shadcn's standard exports.

- [ ] **Step 1: Generate**

```bash
npx shadcn@latest add button input label select switch slider badge separator skeleton table tabs dialog dropdown-menu sheet tooltip command scroll-area --yes --overwrite
```

- [ ] **Step 2: Retheme `button.tsx`**

Replace the generated variants block with:

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out-expo focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-ink hover:bg-accent-hover",
        secondary: "bg-surface-2 text-ink border border-border-strong hover:bg-surface-3",
        ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
        danger: "border border-danger/40 text-danger hover:bg-danger-soft",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3",
        lg: "h-10 px-4 text-[15px]",
        icon: "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

- [ ] **Step 3: Retheme the rest**

For every generated file: replace `rounded-md`/`rounded-lg`/`rounded-xl` with `rounded-control` (controls) or `rounded-panel` (dialog, sheet, popover, dropdown content); replace `shadow-*` on floating layers with `shadow-float`; replace `transition-all` with explicit property lists; replace `lucide-react` icons with Phosphor (`Check`, `CaretDown`, `CaretUp`, `X`, `MagnifyingGlass`, `Circle`). Badge variants: `default` (surface-2, ink), `accent` (accent-soft, accent), `danger` (danger-soft, danger), `success` (success-soft, success), `outline`; radius `rounded-badge`, `text-xs font-medium px-1.5 py-0.5`.

- [ ] **Step 4: Verify and commit**

Run: `grep -rl lucide src/components/ui` → none. `npx tsc --noEmit` on the `ui/` folder clean. Commit `feat(ui): shadcn primitives themed to graphite/amber tokens`.

### Task 5: Shared building blocks

**Files:**
- Create: `src/components/shared/{Panel,PageHeader,StatBlock,StatusBadge,EmptyState,FeedList,BrandMark}.tsx`
- Rewrite: `src/components/shared/{PlanBadge,UpgradePrompt}.tsx`
- Delete: `src/components/core/`

**Interfaces (all `"use client"` unless noted):**

```ts
// Panel.tsx (server-safe)
export function Panel(props: React.ComponentProps<"section">): JSX.Element;      // bg-surface border rounded-panel flex flex-col min-h-0
export function PanelHeader({ title, description?, actions?, className? }): JSX.Element; // h-11 px-4 border-b flex items-center; title text-sm font-medium
export function PanelBody(props: React.ComponentProps<"div"> & { padded?: boolean; scroll?: boolean }): JSX.Element;

// PageHeader.tsx
export function PageHeader({ title, description?, actions? }): JSX.Element;      // h1 text-xl font-medium; description text-sm text-ink-muted; actions right

// StatBlock.tsx
export function StatBlock({ label, value, unit?, tone?: "default"|"accent"|"danger"|"success", hint?, children? }): JSX.Element;
// label text-sm text-ink-muted; value font-mono text-2xl tabular-nums; children = sparkline slot (h-12)

// StatusBadge.tsx
export type Severity = "CRITICAL"|"HIGH"|"MEDIUM"|"LOW";
export function SeverityBadge({ severity }: { severity: Severity }): JSX.Element;
export type StateTone = "neutral"|"accent"|"danger"|"success";
export function StatusBadge({ label, tone, live?: boolean }): JSX.Element;      // live = single pulsing dot, aria-hidden

// EmptyState.tsx
export function EmptyState({ icon: Icon, title, hint?, action? }): JSX.Element;

// FeedList.tsx
export function FeedList<T>({ items, getKey, render, className?, emptyState? }): JSX.Element;
// mono text-xs; autoscrolls to bottom only when the user is within 80px of the bottom; uses ResizeObserver, never window scroll

// BrandMark.tsx (server-safe)
export function BrandMark({ size?: number, wordmark?: boolean }): JSX.Element;   // inline SVG mark (single path) in currentColor + "Aetheris" in font-medium
```

- [ ] **Step 1: Implement the seven files per the interfaces and DESIGN.md.**

`SeverityBadge` mapping: CRITICAL → `bg-danger text-bg`, HIGH → `bg-danger-soft text-danger`, MEDIUM → `bg-accent-soft text-accent`, LOW → `bg-surface-2 text-ink-muted`.
`PlanBadge`: `Badge` variant by plan (FREE default, STARTER/PRO/BUSINESS accent, ENTERPRISE outline), label in normal case.
`UpgradePrompt`: absolute overlay `bg-bg/80 backdrop-blur-[2px]` with a `Panel` (max-w-sm) inside; `LockSimple` icon tile, title, description, "Requires {plan}" muted line, primary `Button` "Upgrade to {plan}" as `Link` to `/pricing`.

- [ ] **Step 2: Delete `src/components/core` and commit**

`git rm -r src/components/core`, `git commit -m "feat(ui): shared Panel, PageHeader, StatBlock, badges, EmptyState, FeedList, BrandMark"`.

---

## Phase 1: Dashboard shell

### Task 6: AppShell, SidebarNav, TopBar, CommandPalette, loading skeleton

**Files:**
- Create: `src/components/app-shell/{AppShell,SidebarNav,TopBar,CommandPalette}.tsx`
- Rewrite: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/loading.tsx`
- Delete: `src/components/shared/DashboardLayout.tsx`

**Interfaces:**
- `AppShell({ children })` mounts `useSimulationEngine()` once, owns `collapsed` state (persisted to `localStorage["aetheris.sidebar"]`, read in `useEffect` with try/catch) and `paletteOpen`.
- `NAV_GROUPS: { label: string; items: { href: string; label: string; icon: Icon }[] }[]` exported from `SidebarNav.tsx` and reused by `CommandPalette` and `TopBar` breadcrumb.
- Route labels are unchanged: Command Center, Threat Monitor, AI Core, Network Topology, Orchestration, Defensive Ops, Sandbox Lab, Analytics, Configuration; Admin group: Admin Overview, Team Members, Billing, Audit Log.

- [ ] **Step 1: SidebarNav**

`<nav aria-label="Primary">`, width 240px, collapsed 56px (`transition-[width] duration-250`). Items: `Link` with `aria-current="page"` when `pathname === href` (exact for `/dashboard`, prefix for the rest); active style `bg-surface-2 text-ink` + 2px accent bar on the left edge inside the item (`before:` pseudo, not a border); hover `bg-surface-2/60`. Collapsed mode wraps each item in `Tooltip` with the label. Bottom: threat score `StatBlock`-lite (label "Threat score", mono value, thin bar `h-1 bg-surface-3` with fill colored by tone) plus collapse toggle button `aria-label="Collapse sidebar"`.

- [ ] **Step 2: TopBar**

Height 52px, `border-b`, contains: sidebar toggle (mobile only, opens `Sheet` with `SidebarNav`), breadcrumb `Aetheris / {group} / {page}` (text-sm), right side: `Button variant="secondary" size="sm"` "Open command palette" showing `⌘K` kbd, `Button variant="danger" size="sm"` "Force defense" (calls the existing handler: resolve all threats + `setGlobalThreatScore(12)`), Clerk `UserButton` with `avatarBox: "size-7 rounded-control"`.

- [ ] **Step 3: CommandPalette**

`CommandDialog` from `ui/command`, opened by `⌘K`/`Ctrl+K` (keydown listener on `document` in `useEffect` with cleanup). Groups: "Navigate" (all `NAV_GROUPS` items → `router.push`), "Actions" ("Force defense", "Halt simulation"/"Resume simulation" via `toggleSimulation`). Empty text "No results."

- [ ] **Step 4: AppShell and layout**

```tsx
<div className="flex h-dvh overflow-hidden">
  <SidebarNav collapsed={collapsed} onToggle={...} className="hidden md:flex" />
  <div className="flex min-w-0 flex-1 flex-col">
    <TopBar onOpenPalette={...} onOpenMobileNav={...} />
    <main id="main" className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
  </div>
  <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
</div>
```

`loading.tsx`: `PageHeader` skeleton (h-6 w-48, h-4 w-80) + grid of four `Skeleton` blocks (h-28) + two `Skeleton` blocks (h-80).

- [ ] **Step 5: Verify and commit**

Browser: `/dashboard` shows active nav item, collapse persists across reload, `⌘K` opens palette, keyboard Tab reaches every control, 400px width shows the sheet nav. Commit `feat(dashboard): app shell with sidebar, top bar, command palette`.

---

## Phase 2: Dashboard pages and widgets

Each task rewrites one route and the widgets it owns. Common rules: page root is `<div className="flex h-full min-h-0 flex-col gap-4">`; `PageHeader` first; panels use `Panel`/`PanelHeader`/`PanelBody`; no motion beyond `AnimatePresence` fades (200ms) on live rows; all timestamps through `formatTime`; all numerics `font-mono tabular-nums`.

### Task 7: Visualization components

**Files:** Rewrite `src/components/visualization/{NetworkTopology,ThreatScoreChart,NetworkTrafficChart}.tsx`

- `NetworkTopology`: keep positions and edge logic. Nodes: `size-11 rounded-control border bg-surface-2` with icon (`Phosphor`: `HardDrives`, `Database`, `Cloud`, `ShieldCheck`, `Laptop`), status colors per DESIGN.md node vocabulary; honey nodes get `border-dashed` and an `accent` tint; label below in `text-xs`, CPU in `text-[11px] font-mono text-ink-subtle`. Edges: one SVG only, `stroke: var(--color-border-strong)`; threat edges `var(--color-danger)` dashed with the `dash` keyframe; deception edges `var(--color-accent)` dashed. Remove the grid background, glows, scanlines, and the `<style>` tag (move `@keyframes dash` into `globals.css` under a `@media (prefers-reduced-motion: no-preference)` block). Search match: `ring-2 ring-ring`.
- Charts: read colors from CSS variables via `getComputedStyle(document.documentElement).getPropertyValue("--color-accent")` once in a `useMemo` on mount; tooltip `contentStyle` uses surface-2/border tokens; area fill opacity 0.12; no dotted overlay; axis ticks `fill: var(--color-ink-subtle)`, `fontSize: 11`.

Commit `refactor(viz): topology and charts on token palette`.

### Task 8: Command Center (`/dashboard`) and its widgets

**Files:** Rewrite `src/app/dashboard/page.tsx`, `src/components/dashboard/{PipelineStatusBar,ActiveThreatsList,AIReasoningStream,TelemetryPacketFeed}.tsx`

- Header: title "Command center", description "Live view of detection, deception, and response."
- `PipelineStatusBar`: one `Panel` row, `divide-x` metric cells (label text-xs muted, value mono), status shown as text tone only; the deception engine cell gets `StatusBadge live` when `ENGAGING`.
- Stats: one `Panel` with `grid-cols-2 lg:grid-cols-4 divide-x` of `StatBlock`s: Threat score (sparkline `ThreatScoreChart`), Active incidents, Network traffic (sparkline `NetworkTrafficChart`), AI confidence (from `aiReasoningState.confidence`, not a hardcoded 94.2).
- Main grid `lg:grid-cols-3`: left 2 cols topology `Panel` (header "Deception map", `StatusBadge live label="Live"`) + telemetry feed `Panel` (h-56); right col threats `Panel` + AI stream `Panel`.
- `ActiveThreatsList`: rows `border-b` (no cards), `SeverityBadge`, type in `text-sm`, source/target in mono `text-xs text-ink-muted`, mitigation line in accent tint; `EmptyState` with `ShieldCheck` "No active threats".
- `AIReasoningStream`: phase stepper as five `text-xs` steps joined by hairlines (active = accent text + `StatusBadge live`, past = success check), meta line "Confidence 92% · RAG 14 · 312 ms" replaced with three labeled mono values separated by spacing (no middle dots); log via `FeedList`.
- `TelemetryPacketFeed`: `FeedList` with source `Badge` (`ZEEK` default, `SURICATA` danger, `eBPF` accent), `formatTime`, severity colors from vocabulary.

Commit `feat(dashboard): command center on the new system`.

### Task 9: Threat Monitor (`/dashboard/monitoring`)

Rewrite with a real `Table` (`ui/table`): columns Time (mono), Severity (`SeverityBadge`), Incident (type + mono source IP below in muted), Target (mono), Status (`StatusBadge`, `live` only for non-RESOLVED). Filter via `Tabs` (All / Critical / High / Medium) and `Input` with `MagnifyingGlass` icon, `type="search"`, `name="q"`, `autoComplete="off"`, `spellCheck={false}`, labeled with `aria-label="Search incidents"`, placeholder "Search by IP, node, or type…". Filter and query synced to URL search params (`?severity=&q=`) with `useSearchParams` + `router.replace`. `EmptyState` "No incidents match".

Commit `feat(dashboard): threat monitor table with URL-synced filters`.

### Task 10: AI Core (`/dashboard/ai-core`) and AttackerProfilePanel

- LangGraph visualizer: vertical stepper list (no glow orb, no spring nudges); each phase row `py-3 border-b`, node dot `size-2 rounded-full` (the single live dot rule applies to the active step only), label text-sm, description text-xs mono muted; stats row above as three `StatBlock`s in a `divide-x` grid.
- MITRE cards: single neutral style (`bg-surface-2 border`), observed = full opacity + accent left text label of the technique id in mono; unobserved = `opacity-50`; confidence as inline mono `72%` (no track bars). Remove the 12-color tactic map.
- `AttackerProfilePanel`: rows in `Panel`, header with actor name (text-sm font-medium) + country as text (no flag emoji; use `countryCode` in a mono `Badge`), attribution confidence mono right-aligned with tone (≥90 danger, ≥75 accent, else muted); tooling as `Badge` list; TTPs as a compact two-column list `technique · name` → use a 2-col grid instead of the dot separator; `formatRelative` for first/last seen.

Commit `feat(dashboard): ai core and attacker profiles`.

### Task 11: Topology, Orchestration, Defensive Ops, Sandbox Lab

- Topology: `PageHeader` with three inline `StatBlock`s (Total, Compromised, Isolated) in the actions slot; `Panel` full height with search `Input` in `PanelHeader` actions; remove Filter button (dead control).
- Orchestration: `LifecycleBadge` → `StatusBadge` with tones (CLONING/PROVISIONING/HARDENING accent live, ONLINE success, COMBAT accent live, TEARDOWN neutral); twin card → `Panel` with spec `divide-x` grid, combat stats as three `StatBlock`s; terraform log via `FeedList`; empty state with primary action "Provision a twin" (existing `handleProvision`).
- Defensive Ops: read the file, keep every handler; operations as a `Table` (Action, Target, Status `StatusBadge`, Started `formatTime`); quarantine node list as rows with `StatusBadge`; log via `FeedList`.
- Sandbox Lab: vector grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` of `Button`-like `<button>` tiles (`bg-surface border rounded-panel p-4 text-left`, hover `bg-surface-2`, fired state `ring-2 ring-ring`), icon + name (text-sm font-medium) + `SeverityBadge`; rename "APT — Cobalt Strike" to "APT: Cobalt Strike"; header actions "Halt simulation"/"Resume simulation" (secondary) and "Force deception handoff" (primary); attacker terminal via `FeedList` (command line `text-ink`, suspicious `text-danger` + `Warning` icon with `aria-label="Suspicious command"`); twins and IOC panels as rows.

Commit per page: `feat(dashboard): topology`, `feat(dashboard): orchestration`, `feat(dashboard): defensive ops`, `feat(dashboard): sandbox lab`.

### Task 12: Analytics, Configuration, Admin pages

- Analytics: read file; stats as `StatBlock` grid, charts in `Panel`s with `PanelHeader`; feature-gated section keeps `UpgradePrompt`.
- Configuration: `Panel` per group; range input → `Slider`; toggle → `Switch` with `Label`; every control gets `id`/`htmlFor`/`name`; "Save configuration" primary button with `aria-live="polite"` "Saved" confirmation text (no exclamation mark).
- Admin overview / Members / Billing / Audit log: `PageHeader`, `Panel`s, `Table` for members and audit rows, `PlanBadge`, forms with `Label` + `Input` (`type="email"`, `autoComplete="email"`, `name="email"`), destructive "Remove member" uses `Dialog` confirmation; loading via `Skeleton` rows; errors inline in `text-danger`. Keep every tRPC call and Stripe fetch exactly as is.

Commit `feat(dashboard): analytics, configuration, admin`.

---

## Phase 3: Marketing

### Task 13: Marketing layout, header, footer

**Files:** Create `src/app/(marketing)/layout.tsx`; move `src/app/{page,architecture,sandbox,pricing}` into `(marketing)/`; rewrite `SiteHeader.tsx`, `SiteFooter.tsx`.

- Header: `sticky top-0 z-[var(--z-sticky)] h-16 border-b bg-bg/80 backdrop-blur`, `BrandMark wordmark`, nav (`Architecture`, `Capabilities` → `/#capabilities`, `Sandbox`, `Pricing`) in `text-sm text-ink-muted hover:text-ink`, active `text-ink` with `aria-current`; right: signed-out → ghost "Sign in" + primary "Open dashboard" (both `SignInButton mode="modal"`); signed-in → primary `Link` "Open dashboard" + `UserButton`. Mobile: `Sheet` menu button `aria-label="Open menu"`.
- Footer: three columns max (Product, Resources, Legal) + brand column; links to real routes only (`/architecture`, `/#capabilities`, `/sandbox`, `/pricing`, README GitHub URL, `mailto:sales@aetheris.ai`, `/privacy` and `/terms` placeholders rendered as plain `text-ink-subtle` spans until pages exist); copyright line only. Remove version stamp and status pill.

Commit `feat(marketing): route group, header, footer`.

### Task 14: Landing page

**Files:** Rewrite `src/app/(marketing)/page.tsx`; create `Hero.tsx`, `LivePreview.tsx`, `StackLogos.tsx`, `HowItWorks.tsx`, `Capabilities.tsx`, `SandboxCta.tsx`; delete `Preloader.tsx`, `TerminalBoot.tsx`, `LogoWall.tsx`, `BentoFeatures.tsx`, `ui/split-flap-display.tsx`.

Sections (5, four layout families, one eyebrow total = none):

1. **Hero** (split 7/5, `min-h-[calc(100dvh-4rem)]`, `pt-20`): h1 `font-display` "Attackers break in. They never reach production." (2 lines), body ≤20 words "Aetheris detects the intrusion, reroutes the session into an AI-built twin, and captures the tooling while it happens.", primary "Open dashboard" + ghost "Read the architecture". Right: `LivePreview` = real `NetworkTopology` + `ActiveThreatsList` inside a `Panel` driven by `useSimulationEngine()` (mounted here only on the landing page; the engine hook is idempotent per mount) with a scripted threat injected after 1.5s via `addThreat` so the map shows a redirect. Framer reveal: container `staggerChildren: 0.06`, children `y: 12 → 0`, 600ms, gated by `useReducedMotion`.
2. **StackLogos**: heading "Runs on the infrastructure you already have", one marquee row (Kubernetes, Cilium, Apache Kafka, ClickHouse, Terraform, Proxmox, Ansible, LangGraph → use `simple-icons` slugs `kubernetes`, `cilium`, `apachekafka`, `clickhouse`, `terraform`, `proxmox`, `ansible`, `langgraph`; if a slug is missing from the package, drop it, never draw one). Rendered as `<svg viewBox="0 0 24 24"><path d={icon.path}/></svg>` in `text-ink-muted`, `aria-label={icon.title}`. CSS `@keyframes marquee` translateX loop, paused under reduced motion and on hover.
3. **HowItWorks**: the one legitimate numbered sequence. Vertical sticky-left layout: left column heading "How a breach becomes intelligence" stays `sticky top-24`; right column four steps (Detect, Redirect, Deceive, Extract) each `border-t py-8 grid md:grid-cols-[3rem_1fr]` with mono step number and 2-line body. `whileInView` fade-up once.
4. **Capabilities** (`id="capabilities"`): asymmetric 2-row grid `md:grid-cols-[3fr_2fr]` then `md:grid-cols-[2fr_3fr]`: four capability blocks (Dynamic deception generation, Cognitive agents, Autonomous neutralization, Sandbox lab). Each block: `bg-surface border rounded-panel p-8`, Phosphor duotone icon 24px, h3 text-lg, body ≤25 words. Two of the four carry a real visual: the deception block embeds a static `NetworkTopology` (no engine) and the sandbox block embeds a `FeedList` with six fixed attacker-session lines. This satisfies the bento diversity rule without images.
5. **SandboxCta**: full-width `bg-surface border-y` band, h2 "Run a live-fire drill against the engine", one sentence, primary "Open the sandbox lab" (`/dashboard/sandbox`) and ghost "See attack vectors" (`/sandbox`).

Copy self-audit: no "God Speed", "lethal", "elevate", "seamless", "next-gen"; no em/en dashes; no version labels.

Commit `feat(marketing): landing page with live product preview`.

### Task 15: Architecture, Sandbox, Pricing pages

- Architecture: hero (left-aligned, `font-display` h1 "Built as an event-driven mesh", 20-word body, primary "Open dashboard"); no floating cube; instead an inline diagram `Panel` listing the four planes (Production, Telemetry, AI core, Deception) as a 4-column grid with mono component names (Ingress, Cilium eBPF; Kafka, ClickHouse; FastAPI, LangGraph, vLLM, Qdrant; Celery, Ansible, Proxmox) joined by `CaretRight` icons on `md+`, stacked on mobile. Capabilities list as a two-column definition list (`dl`), not four cards. Remove parallax `useScroll`.
- Sandbox (marketing): hero + four attack vectors in a two-column list with `SeverityBadge` and `Button variant="link"` "Open in sandbox lab"; remove blur-orb backgrounds, `animate-bounce`, and the three decorative dots.
- Pricing: `PageHeader`-style h1 "Pricing", body "Start free. Every paid plan includes a 14-day trial."; four plans in `grid md:grid-cols-2 xl:grid-cols-4` `Panel`s with identical vertical structure (name, price mono `text-2xl`, period, description fixed `min-h-[2.5rem]`, feature list starting at the same Y, CTA pinned to bottom via `mt-auto`); Pro gets `border-accent` and a `Badge variant="accent"` "Recommended" in the header row (not floating); feature checks `Check` icon `text-success`; error banner inline `role="alert"`; loading spinner replaced by button label "Redirecting…" with `disabled`. Enterprise row below as a `border-t` split: text left, "Contact sales" secondary right. Keep `handleCheckout` unchanged.

Commit `feat(marketing): architecture, sandbox, pricing`.

---

## Phase 4: Verification

### Task 16: Guidelines review and browser pass

- [ ] Run the `web-design-guidelines` review over `src/app/**/*.tsx src/components/**/*.tsx`; fix every finding.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean.
- [ ] Playwright pass (webapp-testing skill): screenshots at 1440 and 400 for `/`, `/architecture`, `/sandbox`, `/pricing`, `/dashboard`, `/dashboard/monitoring`, `/dashboard/ai-core`, `/dashboard/topology`, `/dashboard/orchestration`, `/dashboard/defensive-ops`, `/dashboard/sandbox`, `/dashboard/analytics`, `/dashboard/settings`, `/dashboard/admin`, `/dashboard/admin/members`, `/dashboard/admin/billing`, `/dashboard/admin/audit-log`, `/nonexistent`. Check console for errors on each.
- [ ] Interaction checks: fire an attack vector in Sandbox Lab and confirm the topology, threat list, and AI stream update; `⌘K` navigation; sidebar collapse persistence; pricing checkout button state; reduced-motion emulation shows no movement on the landing hero.
- [ ] Grep gates: `grep -rn "lucide-react\|neon-\|cyber-\|text-text-\|font-outfit\|—\|–" src` → empty. `grep -rn "transition-all\|h-screen\|outline-none" src` → empty.
- [ ] Commit `chore: verification pass fixes`.

## Self-review notes

- Spec coverage: PRODUCT.md anti-references map to Tasks 2, 5, 7, 8, 13, 14; DESIGN.md components map to Tasks 4, 5; accessibility items map to Tasks 3, 6, 9, 12, 16.
- Deliberate deviation from the plan-writing format: page rewrite tasks specify structure and interfaces rather than full source, because the executor is this session with the full audit in context. Foundation tasks (1-6) carry the exact code because every later task depends on their names.
