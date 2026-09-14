# Aetheris: Context for the Next Session

Written 2026-09-15 at the end of Phase 1.
Read this file first, then `docs/audit/2026-09-15-phase0-synthesis.md` for the full findings.
Do not re-audit the repository; the findings below are current.

## 1. Where things stand

Branch: `phase1-production-blockers`, two commits on top of `main`, not pushed, not merged.

- `96f27af` fix(security): tenant scoping, working billing pipeline, hardened backend
- `6fda0fe` feat(ux): first-run incident, sequenced deception loop, honest demo labelling

Verification status: `npm run lint`, `npm run typecheck`, `npm test` (14 tests, real local Postgres), and `npm run build` all pass.
An end-to-end Playwright run with a real Clerk sign-in confirmed the first-run seed, the deception loop timeline, the confirm dialog, focus rings, admin pages with a real org, and no mobile overlap.

### What the product is today

An interactive prototype with a real SaaS shell.
Every threat, twin, telemetry packet, and "AI thought" comes from `src/simulation/engine.ts` (client) or `backend/main.py` (a random-event WebSocket simulator).
Real subsystems: Clerk auth, Postgres tenancy (orgs, roles, audit log, invitations schema), Stripe billing (checkout disabled by flag), the design system.

### Decisions already made

- Tenancy bootstraps lazily in `src/server/tenant.ts` (`ensureTenant`) on the first authenticated tRPC or Stripe request, under a Postgres advisory lock. No Clerk webhook yet.
- Self-serve checkout is off until `NEXT_PUBLIC_BILLING_ENABLED=true`. Paid plans show "Contact sales". Webhooks still process existing subscriptions.
- Marketing, README, and the architecture page describe eBPF, Proxmox, Kafka, and ClickHouse as the target design, not shipped infrastructure. Keep it that way until something real ships.
- The dashboard carries a "Demo data" badge. Do not remove it until real ingest exists.
- Tests use the real local Postgres (`brew services start postgresql@16`); `tests/setup.ts` loads `.env.local` by hand because Next skips it under `NODE_ENV=test`.
- Prisma migrations are baselined at `prisma/migrations/20260915000000_init`. Any schema change needs `npx prisma migrate dev --name <name>`; CI fails on drift.
- Commit messages: no co-author line (AGENTS.md), keep the `Claude-Session` link.

### Key files added or reshaped in Phase 1

| Path | Role |
| --- | --- |
| `src/server/tenant.ts` | User mirror plus one-org bootstrap |
| `src/server/trpc/index.ts` | errorFormatter, `protectedProcedure` now guarantees `orgId` and `role` |
| `src/env.ts` | zod-validated env, imported by `src/lib/db.ts` |
| `src/app/api/stripe/webhooks/route.ts` | idempotent via `StripeEvent` table, customer-scoped writes |
| `src/components/app-shell/ForceDefenseDialog.tsx` | confirm dialog shared by top bar and palette |
| `tests/` | store caps, price map, proxy matcher, tenancy and scoping, webhook ordering |
| `.github/workflows/ci.yml` | lint, typecheck, migrate diff, tests, build, audit, backend smoke |

## 2. The open product decision

The Phase 0 strategist concluded the pitched enterprise deception product is unsellable as a solo build: the category sells at 25k to 200k USD per year through sales reps, and no 29 USD per month buyer exists for it.

Recommended pivot: **Aetheris Sensor**, a hosted LLM-interactive honeypot service.
One container deploys an SSH and HTTP decoy that reports to the existing dashboard; every touch produces an alert and an LLM-written session summary with IOCs and a MITRE mapping; sold per sensor per month with an MSP tier.
Rationale and competitor table are in synthesis section 5 and the strategist's landscape table.

Deepesh has not decided.
Phases 3 and 4 below assume the pivot.
Phase 2 is valuable either way.
If the decision is "keep the enterprise pitch as a portfolio piece", stop after Phase 2 and skip billing entirely.

## 3. Phase 2: core product excellence (no pivot dependency)

Status 2026-09-15: items 1 to 8 landed on branch `phase2-core-product` (eight commits on top of Phase 1).
Item 9 is a decision, see below.
Two things need Deepesh's hands:

- Install the Resend marketplace integration (`vercel integration add resend`) so invites are emailed; until then the members page shows a copyable invite link.
- Rename the Clerk application from "My Application" and upload a logo in the Clerk dashboard; the sign-in card reads the name from there.
- Production env is missing `DATABASE_URL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` and the Stripe keys (`vercel env ls production` shows only the Clerk keys and the backend URL). `src/env.ts` refuses to boot without `DATABASE_URL`.

Ordered by value.
Each item is small enough to land in one session.

1. **Settings persistence.** `src/app/dashboard/settings/page.tsx` is local state with a fake "Saved". Add `org.updateSettings` (adminProcedure, zod schema for posture, aggressiveness, autonomous flag, sensors) writing `Organization.settings`, and `org.getSettings`. Then make Defensive Ops honor `autonomous=false` by queueing ops as PENDING with an Approve button. This becomes the human-in-the-loop story.
2. **Incident detail drawer.** Rows in Command Center "Active threats" and Threat Monitor are not clickable. Add a drawer (existing `Sheet`) showing reasoning log, MITRE hits, attacker profile, twin session, and "Copy IOCs" / "Export JSON". This lets AI Core, Topology, and Analytics collapse into it later.
3. **Invitation accept flow.** `org.inviteMember` creates a token nobody can redeem and no email is sent. Add `/invite/[token]` that, when signed in, upserts the User and creates the Membership, sets `acceptedAt`. Send the email through a Vercel Marketplace email integration (load the `vercel:marketplace` skill first; do not hardcode a provider SDK). Until email exists, show the invite link in the members table for manual sharing.
4. **CSP.** Nonce-based via `src/proxy.ts`: `script-src 'self' 'nonce-…' https://*.clerk.accounts.dev; connect-src 'self' wss://<backend> https://*.clerk.accounts.dev; frame-src https://checkout.stripe.com`. Test against the landing 3D scene and Clerk modal. Drop nothing else from `next.config.ts`.
5. **Retention job.** `PLAN_LIMITS.retentionDays` is never enforced. Add a Vercel cron route that deletes `AuditLog`, `Notification`, `Activity` older than the org's retention, keeping billing-relevant audit rows. Change `AuditLog.org` to `onDelete: Restrict` in the same migration.
6. **Engine extraction.** `src/simulation/engine.ts` runs a 300-line orchestrator inside a `setInterval` in a React hook. Extract the tick into a plain module with `start()`/`stop()` so it can be unit tested with fake timers; restart the local generator with backoff when the WebSocket closes (today the UI freezes on the last state).
7. **Bundle trims.** Remove `framer-motion` (real use is one `AnimatePresence` in `ActiveThreatsList`; three files only use `useReducedMotion`, replace with `matchMedia`). Move `threatTone` and `NAV_GROUPS` out of `SidebarNav.tsx` into `src/lib/`. Every dashboard route ships 700 to 1200 KB of client JS.
8. **Clerk branding.** The hosted sign-in says "My Application" and "Development mode". Configure the Clerk instance name and logo, and add `/sign-in` and `/sign-up` routes so the flow stays on the domain.
9. **Backend on Vercel or shelve it.** `NEXT_PUBLIC_BACKEND_WS_URL` is empty locally but set (hidden) in Vercel Preview and Production, so something is pointed at. Confirm the Python service is actually running there; if not, delete `backend/` and the CI job until Phase 3. Do not keep it half-alive. The client now resumes the local generator when the socket drops, so a dead URL degrades instead of freezing.

## 4. Phase 3: real ingest (assumes the pivot)

Goal: a user runs one command, touches their own decoy, and sees a real alert in the dashboard within ten minutes of signup.
This is the north-star metric: sensors with at least one real session.

1. **Schema.** Add `Sensor { id, orgId, name, kind, apiKeyId, lastSeenAt, status }`, `Session { id, orgId, sensorId, protocol, sourceIp, startedAt, endedAt, summary Json? }`, and `SessionEvent { id, sessionId, ts, kind, input, output }`. Sessions and events are child tables, not Json blobs on the twin.
2. **API keys.** The `ApiKey` model exists with no issuance or verification code. Add `apiKey.create` (returns the raw key once, stores a SHA-256 hash and prefix) and a verifier used by the ingest route.
3. **Ingest route.** `POST /api/ingest` accepting a batch of session events, authenticated by API key, body-capped, writing to the tables above. Public in `src/proxy.ts` like the webhook.
4. **Sensor container.** Wrap Beelzebub (SSH and HTTP with LLM mode; MIT) or Cowrie rather than writing protocol emulation. Ship a `docker run` line with the API key and ingest URL as env. Keep the honeypot's own LLM responses on a small model.
5. **Alerts.** Email and Slack webhook on the first event of a session. Alert channels live in the org settings from Phase 2.
6. **Live stream.** Replace the client generator for real tenants with a tRPC SSE subscription (`httpSubscriptionLink`, tRPC 11) fed from the `Session` and `SessionEvent` tables. Keep the generator only behind the "Demo data" toggle for orgs with no sensors.
7. **UI repurposing** per synthesis section 5: Command Center becomes fleet health plus latest sessions, Monitoring becomes the sessions list, Orchestration becomes Sensors (deploy command, status), Sandbox becomes "Test your sensor", Defensive Ops is cut.

## 5. Phase 4: AI that earns its name (assumes Phase 3)

There is no model anywhere today.
The first real LLM call is session summarization.

1. **One structured call per closed session** through the Vercel AI Gateway (`ai` SDK, `generateObject`, model string like `anthropic/claude-haiku-4-5`) with a zod schema: `summary, intent, skill, ttps[{technique, name, evidenceEventIds[], confidence}], iocs[]`.
2. **Guardrails.** The transcript is attacker-controlled: wrap it in delimiters, state in the system prompt that it is data, validate technique ids against a bundled ATT&CK list, drop any `evidenceEventIds` that do not exist in the session. No tools with side effects. Truncate head and tail at 32k tokens.
3. **Cost controls.** Event-driven on session close, cached by session id plus model id, per-org daily cap tied to `PLAN_LIMITS.apiCalls`, tokens and cost logged to `AuditLog.details`.
4. **Evaluation.** 30 to 50 hand-labelled sessions (synthesize from `ATTACKER_COMMANDS` plus public honeypot corpora) with expected technique ids; a Vitest suite scores precision and recall and blocks prompt regressions.
5. **Render** the result where AI Core is today: summary, IOCs with copy, MITRE tags with evidence links, raw transcript. Show "analysis failed" honestly instead of random confidence numbers.

## 6. Phase 5: scale and enterprise (only after paying customers)

- Postgres connection pooler (Neon or Supabase pooler, or Prisma Accelerate) before roughly 100 concurrent users on Vercel.
- Cursor pagination on `audit.list` and the sessions list.
- Per-org pub/sub for the live stream instead of one global broadcast.
- Soft delete on Organization with a 30-day grace and a purge job; Clerk `user.deleted` webhook.
- SSO, SOC 2 evidence collection, SIEM export (syslog or CEF), MSP multi-tenant routing.
- Error tracking (Sentry or the Vercel OTel drain) and the SLOs in synthesis section E of the technical audit: health 99.5 percent over 30 days, tRPC p95 under 500 ms, webhook 2xx above 99.9 percent.

## 7. Known gaps and risks carried forward

- Three npm audit highs remain, all `deepmerge-ts` under the Prisma CLI (dev-time only). Clear when Prisma 6.x ships a fix; do not jump to the Prisma 8 release candidate.
- The Python backend still broadcasts one global stream to every authenticated client. Acceptable while the data is fake; must be per-org before Phase 3 step 6.
- `NetworkTopology` has a fixed 520px minimum width and scrolls horizontally on phones. Acceptable; a scaling SVG is the fix if phone use matters.
- The marketing `LivePreview` mutates the same Zustand store as the dashboard, so hero state leaks into `/dashboard` on client navigation.
- `Team`, `Policy`, `Activity`, and `FeatureFlag` models have no code paths. Delete them in the Phase 3 migration if still unused.
- `.env.local` holds the claimed Clerk dev instance keys; production keys are marked sensitive in Vercel and cannot be pulled. See the memory note `aetheris-local-auth-and-e2e` for the headless sign-in procedure.

## 8. How to start the next session

```bash
git checkout phase1-production-blockers
brew services start postgresql@16
npm ci
npx prisma migrate deploy
npm run typecheck && npm run lint && npm test
npm run dev
```

Then decide: merge Phase 1 to `main` (recommended, it is all blocker fixes), pick Phase 2 item 1, and get the pivot decision from Deepesh before touching Phase 3.
