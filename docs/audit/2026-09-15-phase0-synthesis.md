# Phase 0 Synthesis: Repository Reconnaissance and Product Reality

Date: 2026-09-15
Status: Findings only. No production code was modified in Phase 0.

## 1. Executive Product Assessment

Aetheris is pitched as an autonomous cyber deception platform: detect an intrusion, redirect the attacker through eBPF into an AI-generated sandboxed digital twin, extract TTPs and IOCs.
What exists is a high-fidelity interactive demo of that pitch, plus a real SaaS shell.

What is real:

- Clerk authentication with a Next.js 16 proxy gate on the dashboard.
- A Postgres schema for organizations, memberships, audit logs, invitations, API keys, and simulations.
- tRPC routers for org, billing, audit, and simulation.
- Stripe checkout, portal, and webhook routes with a five-tier plan matrix.
- A disciplined design system (PRODUCT.md and DESIGN.md) with 13 dashboard routes and a marketing site with a Three.js scene.

What is simulated:

- Every threat, telemetry packet, AI thought, twin, Terraform log, attacker session, and defensive operation comes from a client-side random generator in `src/simulation/engine.ts`.
- The Python backend emits random threats and canned log lines. Its LangGraph graph is four sleep nodes returning random strings. No model is called anywhere.
- No sensor, no ingest path, no eBPF, no Proxmox, no Kafka, no ClickHouse, no vector database.

Maturity: interactive prototype with a billing shell.
It is not an MVP because a user cannot deploy anything and therefore cannot receive a single real alert.

Major strengths: the operator UI is better than most real deception consoles; the tenant, audit, and billing shell is reusable; the Sandbox page is a good interaction loop.

Major weaknesses: everything the money is charged for is decorative; the billing pipeline is broken three independent ways; the tRPC layer has cross-tenant IDORs; there are zero tests, no CI, no migrations, and no error tracking.

## 2. Real-World Adoption Gap

| Current capability | Missing capability | Business consequence | Required intervention |
| --- | --- | --- | --- |
| Beautiful simulated dashboard | Any real sensor or ingest path | Time-to-value is infinite; no aha moment | Ship one deployable decoy that reports to the app |
| Stripe checkout wired to five plans | A working pipeline (webhook 404, FK violation, price mapping) | Zero paying customers can ever be recorded as paid | Fix the three breaks before any checkout is enabled |
| Org, member, audit tRPC routers | Tenant scoping on several procedures; no Clerk user sync | Cross-org data access; all admin pages show "No organization" | User upsert, orgId scoping, owner guards |
| Marketing claims eBPF, Proxmox, petabyte telemetry | Any of those | Trust collapse on first inspection; deceptive-claims exposure | Rewrite claims to match what ships; label demo data |
| Plan features gate nothing | Anything to gate | Buying Pro changes a badge | Delete the feature matrix until units of value exist |

## 3. Security Findings (ranked)

CRITICAL

1. `src/proxy.ts` puts `/api/(.*)` behind `auth.protect()`. Stripe webhooks and `/api/health` get a 404. No subscription is ever recorded.
2. No code path creates a `User` row, but `Membership.userId` has a foreign key to `User.id`. Org auto-creation in the checkout route fails for every real user, so `ctx.orgId` is always null and the entire tenant layer is unreachable.

HIGH

3. IDOR in `simulation.get` and `simulation.updateStatus`: no orgId scoping.
4. `org.removeMember` deletes any membership id, cross-org, including OWNER, including self.
5. `audit.create` lets any member forge audit entries with arbitrary ip and unbounded details.
6. `mapPriceToPlan` substring-matches opaque Stripe price ids; every paid checkout maps to FREE.

MEDIUM

7. Stripe webhook: no idempotency, no subscription-id comparison on delete, trial discarded, missing paused/paid/async events.
8. Two divergent checkout paths (REST and tRPC) with different authorization.
9. Backend WebSocket registers sockets for broadcast before authentication; one global stream for all tenants.
10. JWT verification skips issuer and azp checks; sockets never re-validate expiry.
11. Rate limiter keyed by proxy-collapsed IP, never evicted.
12. Next.js 16.2.6 inside a critical advisory range; sharp and prisma transitive highs.
13. Python requirements unpinned; langgraph pulled in for four sleep calls.

LOW

14. Clerk token over ws:// if misconfigured; no Origin check.
15. No CSP; obsolete X-XSS-Protection header.
16. Raw Prisma errors reach the client through tRPC.
17. `z.any()` inputs stored to Json columns with no size cap.
18. Cascade-delete on AuditLog destroys the audit trail; invitations have no accept flow; member emails exposed to all roles.

Verified safe: no secrets in git history, webhook signature verification is correct, success and cancel URLs are not injectable, adminProcedure correctly rejects role null.

## 3b. UX Findings (live walkthrough, signed in, 17 routes, 1440 and 390 widths)

Screenshots and JSON dumps live in the session scratchpad under `shots/`.

Critical:

1. No activation path. The engine never spawns a threat on its own, so a new user lands on an empty Command Center with no call to action. Seven of nine routes stay empty until the user finds Sandbox Lab.
2. The core loop contradicts itself. The threat auto-resolves about 10 seconds after firing, before the twin exists. Captured IOCs stayed at zero through the whole combat window. There is no export, copy, or act control anywhere.
3. Raw Prisma stack traces with absolute filesystem paths render in the members page, the audit log, and the invite form.
4. Keyboard focus is invisible on every Button. Tailwind v4 `outline-none` sets the outline style variable that `focus-visible:outline-2` reuses (`src/components/ui/button.tsx:6`). WCAG 2.4.7 failure.
5. Configuration does not persist even across client navigation.
6. Mobile: Command Center panels overlap, and the topology map (`min-w-[520px]`) is clipped in the hero and on the topology page.
7. "Force defense" is a one-click, no-confirm destructive action in the persistent top bar.
8. Pricing checkout without Stripe keys shows a bare "Failed to create checkout session"; the billing page swallows the same failure silently.
9. Clerk is unbranded ("Sign in to My Application", "Development mode").

Trust: no demo-mode indicator anywhere. The Command Center says "Pipeline Live" with fabricated Zeek, Suricata, and eBPF numbers. A SOC analyst would conclude within a minute that nothing is connected.

Passes: reduced motion, color-plus-label state encoding, command palette, icon-button labels on desktop, no horizontal document scroll.

Information architecture: Topology, Analytics, and AI Core should collapse into Command Center plus an incident detail drawer. Orchestration is the best-structured page. Sandbox Lab is the activation surface and should be first.

## 4. Architecture Evolution

Current: Next.js control plane with tRPC and Prisma, a client-side simulation generator mutating a Zustand store from inside a React hook, and an optional Python WebSocket simulator.

Target (incremental, no rewrite):

1. Identity mirror: upsert `User` from Clerk in tRPC context or via Clerk webhook. Org bootstrap moves there, inside a transaction.
2. Event store: append-only `Event` table keyed by orgId and sensorId, with an authenticated `/api/ingest` route using the existing `ApiKey` model.
3. Live stream: tRPC SSE subscription fed from the event table replaces the client generator for real tenants. The generator survives as a server-side demo seeder behind a visible "Demo mode" label.
4. Decoy runtime: the Python service stops simulating and becomes the honeypot runtime, publishing sessions into the event store.
5. Analysis: one structured LLM call per closed session, schema-validated, with an eval set and cost caps.

Cleanups that pay for themselves now: delete the unused `QueryProvider`, the dead tRPC billing procedures, the `stripe` Proxy export, and `framer-motion` (used meaningfully in one file, costs 122 KB on every route). Move `threatTone` and `NAV_GROUPS` out of `SidebarNav`.

## 5. Product Direction

Recommended: "Aetheris Sensor", a hosted LLM-interactive honeypot service.
One container deploys an SSH and HTTP decoy that reports to the existing dashboard.
Every touch produces an alert and an LLM-written session summary with IOCs and MITRE mapping.
Sold per sensor per month, self-serve, with an MSP tier.

Why: it is the only direction where a solo developer ships a real first feature in weeks (wrap Beelzebub or Cowrie), the existing org, audit, and billing shell becomes load-bearing immediately, and there is a documented price gap (nothing self-serve under roughly 3,000 EUR per year).

Do not build: eBPF socket rewriting, Proxmox twins, Kafka, ClickHouse, vector RAG, autonomous Ansible remediation, 3D topology, white label, on-prem.

Per-route verdict for the recommended direction:

| Route | Verdict |
| --- | --- |
| /dashboard | Keep; becomes fleet health plus latest alerts |
| /dashboard/monitoring | Keep; becomes the sessions list |
| /dashboard/ai-core | Replace with per-session report view |
| /dashboard/topology | Cut or reduce to static sensor map |
| /dashboard/orchestration | Replace with Sensors (deploy command, status) |
| /dashboard/defensive-ops | Cut; implies autonomous remediation that does not exist |
| /dashboard/sandbox | Repurpose as "Test your sensor" |
| /dashboard/analytics | Keep only counts derived from real sessions |
| /dashboard/settings | Keep; must persist (alert channels, API keys) |
| /dashboard/admin/* | Keep; real and mission-critical |

## 6. Product Evolution Roadmap

Phase 1, production blockers (this pass):

- Security items 1 through 8 and 16.
- Env validation, structured tRPC error logging, DB-checked health endpoint.
- Prisma migrations directory, CI workflow, Vitest with the first regression tests.
- Next.js upgrade for the critical advisory.
- Demo-mode label in the dashboard and rewritten marketing claims.
- Disable paid checkout until a real sensor exists (keep the code).
- UX P0: friendly error mapping for admin pages, Button focus ring, mobile overlap and map clipping, confirm on Force defense, aria-labels on collapsed top-bar buttons.
- First-run: seed one scripted incident on first dashboard mount so the loop is visible in the first minute, and sequence resolve after the twin reaches combat.

Phase 2, core product excellence:

- Event table and authenticated ingest route.
- First real decoy container and alerting (email, Slack webhook).
- Session view replacing AI Core; settings persistence.

Phase 3, enterprise readiness: invitation accept flow, retention job, soft delete, audit written server-side, SIEM export.

Phase 4, differentiation: LLM session summaries with eval set, honeytokens, MSP multi-tenant routing.

Phase 5, scale: connection pooler, cursor pagination, per-org pub/sub for the stream.

## 7. Definition of Done for Phase 1

- Security: no CRITICAL or HIGH finding above remains open.
- Billing: an unauthenticated Stripe webhook POST with a bad signature returns 400, not 404; a configured price id maps to its plan.
- Tenancy: a new Clerk user gets a User row and one org on first tRPC call, under concurrency.
- Testing: regression tests for IDOR, price mapping, webhook idempotency, and store caps pass in CI.
- Operations: `/api/health` reports DB status unauthenticated; env is validated at boot.
- Honesty: dashboard shows a demo indicator; marketing and README describe only what ships.

## 8. Would I Buy This Today

No. Nothing can be deployed, so nothing can alert, so nothing is protected.
Smallest path to yes: one real sensor container, one real alert channel, one real LLM session summary, demo data behind a label, and claims that match.
