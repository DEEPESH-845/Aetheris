# AETHERIS SaaS TRANSFORMATION PLAN

**Date**: 2025-07-04
**Author**: Product & Architecture Review
**Status**: Draft — Ready for Review

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Phase 0: Critical Security Fixes](#2-phase-0-critical-security-fixes-week-1)
3. [Phase 1: Database & Multi-Tenancy](#3-phase-1-database--multi-tenancy-weeks-1-3)
4. [Phase 2: API Layer & Authentication](#4-phase-2-api-layer--authentication-weeks-2-4)
5. [Phase 3: Subscription & Billing](#5-phase-3-subscription--billing-weeks-3-6)
6. [Phase 4: Feature Gating & RBAC](#6-phase-4-feature-gating--rbac-weeks-4-7)
7. [Phase 5: Enterprise Features](#7-phase-5-enterprise-features-weeks-6-10)
8. [Feature Matrix](#8-feature-matrix)
9. [Stripe Integration Architecture](#9-stripe-integration-architecture)
10. [X-Factor Differentiators](#10-x-factor-differentiators)
11. [File-by-File Implementation Guide](#11-file-by-file-implementation-guide)
12. [Migration Strategy](#12-migration-strategy)

---

## 1. Current State Assessment

### What Exists
- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4, Zustand, Framer Motion, Recharts, Clerk auth
- **Backend**: Python FastAPI with LangGraph AI reasoning, WebSocket communication
- **Dashboard Pages**: Command Center, Threat Monitor, AI Core, Network Topology, Orchestration, Defensive Ops, Sandbox Lab, Configuration
- **Marketing Pages**: Landing, Architecture, Sandbox marketing
- **Auth**: Clerk (frontend) with bypass on backend when env vars missing

### Critical Gaps
| Gap | Severity | Location |
|-----|----------|----------|
| Auth bypass when env vars missing | P0 | `backend/main.py:49-50` |
| Middleware misnamed (proxy.ts vs middleware.ts) | P0 | `src/proxy.ts` |
| No database, all state ephemeral | P0 | Everywhere |
| No API routes in Next.js | P1 | No `src/app/api/` directory |
| No rate limiting beyond one message type | P1 | `backend/main.py:283-289` |
| Permissive CORS (`allow_methods=["*"]`) | P1 | `backend/main.py:26-29` |
| No security headers | P1 | No CSP, HSTS, X-Frame-Options |
| No CI/CD pipeline | P1 | No `.github/` directory |
| No tests | P2 | Zero test files |
| No audit logging | P2 | Not implemented |
| No multi-tenancy | P2 | Single-user architecture |

---

## 2. Phase 0: Critical Security Fixes (Week 1)

### 2.1 Rename Middleware

**File**: `src/proxy.ts` → `src/middleware.ts`

Next.js 16 only recognizes `middleware.ts` at the project root or `src/`. The current file `src/proxy.ts` is silently ignored, meaning Clerk auth protection is **not running**.

```typescript
// src/middleware.ts (renamed from src/proxy.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/sandbox(.*)",
  "/api/(.*)",        // Protect API routes too
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/architecture",
  "/sandbox(.*)",     // Marketing sandbox page
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
```

### 2.2 Fix Auth Bypass in Backend

**File**: `backend/main.py` — lines 48-50

Current code returns `True` when no JWKS client is configured, allowing unauthenticated WebSocket connections.

```python
# BEFORE (insecure)
async def verify_token(token: str) -> bool:
    if not jwks_client:
        return True  # Bypass if no env var configured

# AFTER (secure)
async def verify_token(token: str) -> bool:
    if not jwks_client:
        logger.critical("REJECTING: No JWKS client configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.")
        return False
    # ... rest unchanged
```

Add startup validation:

```python
@app.on_event("startup")
async def startup_event():
    required_envs = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"]
    missing = [e for e in required_envs if not os.getenv(e)]
    if missing:
        logger.critical(f"Missing required env vars: {missing}. Server will reject all auth.")
    asyncio.create_task(generate_telemetry())
    asyncio.create_task(consume_telemetry())
```

### 2.3 CORS & Security Headers

**File**: `backend/main.py` — lines 24-30

```python
# Restrict CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Already restrictive
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Not *
    allow_headers=["Authorization", "Content-Type"],  # Not *
)
```

**File**: `next.config.ts` — add security headers

```typescript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

// Add to next.config.ts exports
```

### 2.4 Global Rate Limiting

**File**: `backend/main.py` — add rate limit middleware

```python
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True

# Global: 100 req/min per IP
global_limiter = RateLimiter(max_requests=100, window_seconds=60)
# Sandbox: 5 req/min per IP (existing, now centralized)
sandbox_limiter = RateLimiter(max_requests=5, window_seconds=60)
```

---

## 3. Phase 1: Database & Multi-Tenancy (Weeks 1-3)

### 3.1 Prisma Schema

**New file**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Multi-Tenancy ────────────────────────────────────────────────────────

enum Plan {
  FREE
  STARTER
  PRO
  BUSINESS
  ENTERPRISE
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Organization {
  id                    String   @id @default(cuid())
  name                  String
  slug                  String   @unique
  plan                  Plan     @default(FREE)
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  stripePriceId         String?
  trialEndsAt           DateTime?
  settings              Json?    @default("{}")
  logoUrl               String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  members               Membership[]
  teams                 Team[]
  auditLogs             AuditLog[]
  notifications         Notification[]
  apiKeys               ApiKey[]
  simulations           Simulation[]
  invitations           Invitation[]
}

model User {
  id            String   @id @default(cuid()) // Maps to Clerk userId
  email         String   @unique
  name          String?
  avatarUrl     String?
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  memberships   Membership[]
  activities    Activity[]
  apiKeys       ApiKey[]
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  role      Role     @default(MEMBER)
  teamId    String?
  createdAt DateTime @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  team      Team?      @relation(fields: [teamId], references: [id])

  @@unique([userId, orgId])
  @@index([orgId])
}

model Team {
  id        String   @id @default(cuid())
  name      String
  orgId     String
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  members   Membership[]
  policies  Policy[]
}

model Policy {
  id        String   @id @default(cuid())
  name      String
  teamId    String
  resources Json     // e.g. ["dashboard:command-center", "sandbox:provision"]
  actions   Json     // e.g. ["read", "write", "execute"]
  createdAt DateTime @default(now())

  team      Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}

// ─── Audit & Activity ─────────────────────────────────────────────────────

model AuditLog {
  id        String   @id @default(cuid())
  orgId     String
  userId    String?
  action    String   // e.g. "threat.mitigated", "sandbox.provisioned"
  resource  String   // e.g. "threat:TRT-1234", "sandbox:TWIN-5678"
  details   Json?
  ip        String?
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, createdAt])
  @@index([orgId, action])
}

model Activity {
  id        String   @id @default(cuid())
  userId    String
  type      String   // e.g. "login", "threat_detected", "sandbox_spawned"
  message   String
  metadata  Json?
  createdAt DateTime @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model Notification {
  id        String   @id @default(cuid())
  orgId     String
  type      String   // "threat", "billing", "system", "team"
  title     String
  message   String
  read      Boolean  @default(false)
  actionUrl String?
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, read, createdAt])
}

// ─── Simulations & Sandboxes ──────────────────────────────────────────────

model Simulation {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  status    String   @default("idle") // idle, running, paused, completed
  config    Json?
  results   Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  twins     SandboxTwin[]

  @@index([orgId])
}

model SandboxTwin {
  id              String   @id @default(cuid())
  simulationId    String
  name            String
  attackerIp      String?
  lifecycle       String   @default("CLONING")
  vmSpecs         Json?
  attackerSessions Json?
  iocs            Json?
  createdAt       DateTime @default(now())
  destroyedAt     DateTime?

  simulation      Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)

  @@index([simulationId])
}

// ─── API Keys ─────────────────────────────────────────────────────────────

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  name      String
  keyHash   String   @unique
  prefix    String   // First 8 chars for display: "aeth_1234..."
  scopes    Json?    // e.g. ["read:threats", "write:sandbox"]
  lastUsed  DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
}

model Invitation {
  id        String   @id @default(cuid())
  orgId     String
  email     String
  role      Role     @default(MEMBER)
  token     String   @unique
  expiresAt DateTime
  acceptedAt DateTime?
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, email])
}

// ─── Feature Flags ────────────────────────────────────────────────────────

model FeatureFlag {
  id          String   @id @default(cuid())
  key         String   @unique // e.g. "sandbox.unlimited_twins"
  name        String
  description String?
  enabled     Boolean  @default(false)
  plans       Plan[]   // Which plans get this flag
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3.2 Multi-Tenancy Architecture

**Tenant isolation strategy**: Row-level isolation using `orgId` on every table.

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                 │
│  Next.js 16 App Router + Clerk Auth + tRPC          │
└──────────┬──────────────────────┬────────────────────┘
           │ REST/WS              │ tRPC
           ▼                      ▼
┌──────────────────┐    ┌──────────────────────┐
│  FastAPI Backend │    │  Next.js API Routes  │
│  (Railway)       │    │  (Vercel Serverless) │
│  - WebSocket Hub │    │  - tRPC Routers      │
│  - Telemetry Gen │    │  - Stripe Webhooks   │
│  - AI Core       │    │  - CRUD Operations   │
└────────┬─────────┘    └──────────┬───────────┘
         │                         │
         └──────────┬──────────────┘
                    ▼
         ┌──────────────────┐
         │   PostgreSQL     │
         │   (Supabase/     │
         │    Neon)         │
         │   + Prisma ORM   │
         └──────────────────┘
```

**Key principle**: The FastAPI backend remains the real-time WebSocket hub for simulation data. The Next.js API routes (via tRPC) handle all CRUD, auth, billing, and organization management. Both share the same PostgreSQL database via Prisma.

### 3.3 New File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts       # tRPC handler
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts      # Create Checkout Session
│   │   │   ├── portal/route.ts        # Customer Portal session
│   │   │   └── webhooks/route.ts      # Stripe webhook handler
│   │   └── health/route.ts            # Health check endpoint
│   ├── dashboard/
│   │   ├── admin/                     # NEW: Admin dashboard
│   │   │   ├── page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   ├── audit-log/page.tsx
│   │   │   └── api-keys/page.tsx
│   │   └── [existing pages unchanged]
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   └── pricing/page.tsx               # NEW: Pricing page
├── server/
│   ├── trpc/
│   │   ├── index.ts                   # tRPC init
│   │   ├── context.ts                 # Request context (auth, db)
│   │   └── routers/
│   │       ├── _app.ts                # Root router
│   │       ├── org.ts                 # Organization CRUD
│   │       ├── member.ts              # Team management
│   │       ├── simulation.ts          # Simulation CRUD
│   │       ├── audit.ts               # Audit log queries
│   │       ├── notification.ts        # Notifications
│   │       ├── apikey.ts              # API key management
│   │       └── billing.ts             # Subscription management
│   └── db/
│       ├── index.ts                   # Prisma client singleton
│       └── migrations/
├── lib/
│   ├── stripe.ts                      # Stripe client singleton
│   ├── rbac.ts                        # Role-based access helpers
│   ├── feature-flags.ts               # Feature flag evaluation
│   ├── rate-limit.ts                  # Rate limiting utilities
│   └── audit.ts                       # Audit logging helper
├── hooks/
│   ├── useOrg.ts                      # Current organization context
│   ├── useSubscription.ts             # Subscription/plan info
│   └── useFeatureFlag.ts             # Client-side feature flags
├── providers/
│   ├── OrgProvider.tsx                # Organization context provider
│   └── QueryProvider.tsx              # TanStack Query provider
├── store/
│   ├── useOrgStore.ts                 # Org state (replaces ephemeral)
│   └── useSimulationStore.ts          # EXISTING - modified for persistence
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

## 4. Phase 2: API Layer & Authentication (Weeks 2-4)

### 4.1 tRPC Setup

**File**: `src/server/trpc/index.ts`

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
```

**File**: `src/server/trpc/context.ts`

```typescript
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function createContext() {
  const session = await auth();
  const userId = session.userId;

  let orgId: string | null = null;
  let role: string | null = null;

  if (userId) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" }, // Default to first org
      select: { orgId: true, role: true },
    });
    orgId = membership?.orgId ?? null;
    role = membership?.role ?? null;
  }

  return { userId, orgId, role, prisma };
}
```

### 4.2 Core Routers

**File**: `src/server/routers/org.ts`

```typescript
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";

export const orgRouter = router({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.organization.findUnique({
      where: { id: ctx.orgId! },
      include: {
        members: { include: { user: true, team: true } },
        _count: { select: { simulations: true, auditLogs: true } },
      },
    });
  }),

  update: adminProcedure
    .input(z.object({ name: z.string().min(1), settings: z.record(z.any()).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.update({
        where: { id: ctx.orgId! },
        data: input,
      });
    }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.membership.findMany({
      where: { orgId: ctx.orgId! },
      include: { user: true, team: true },
    });
  }),

  inviteMember: adminProcedure
    .input(z.object({ email: z.string().email(), role: z.enum(["ADMIN", "MEMBER", "VIEWER"]), teamId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return ctx.prisma.invitation.create({
        data: {
          orgId: ctx.orgId!,
          email: input.email,
          role: input.role,
          token,
          expiresAt,
        },
      });
      // TODO: Send invitation email via Resend/SendGrid
    }),
});
```

### 4.3 WebSocket Authentication

**File**: `backend/main.py` — modify WebSocket endpoint

The WebSocket connection must extract the userId from the Clerk JWT and bind it to the connection. This enables per-user and per-org telemetry routing.

```python
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=3.0)
        auth_payload = json.loads(auth_msg)
        if auth_payload.get("type") != "AUTH":
            raise Exception("Missing AUTH message")

        token = auth_payload.get("token", "")
        if not await verify_token(token):
            raise Exception("Invalid token")

        # Extract userId from JWT claims
        user_id = extract_user_id_from_token(token)
        org_id = auth_payload.get("orgId")  # Client sends org context

        # Bind connection to tenant
        client_context = {"userId": user_id, "orgId": org_id}
        manager.set_context(websocket, client_context)

    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        manager.disconnect(websocket)
        await websocket.close(code=1008, reason="Unauthorized")
        return
```

---

## 5. Phase 3: Subscription & Billing (Weeks 3-6)

### 5.1 Stripe Product & Price Setup

| Plan | Monthly Price | Yearly Price | Stripe Price ID Pattern |
|------|--------------|-------------|------------------------|
| Free | $0 | $0 | (none — default) |
| Starter | $29/mo | $290/yr | `price_starter_monthly`, `price_starter_yearly` |
| Pro | $99/mo | $990/yr | `price_pro_monthly`, `price_pro_yearly` |
| Business | $299/mo | $2990/yr | `price_business_monthly`, `price_business_yearly` |
| Enterprise | Custom | Custom | Manual invoice |

### 5.2 Stripe Integration Files

**File**: `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PLANS = {
  FREE: { name: "Free", priceId: null },
  STARTER: {
    name: "Starter",
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
  },
  PRO: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
  BUSINESS: {
    name: "Business",
    monthlyPriceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!,
  },
} as const;
```

**File**: `src/app/api/stripe/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, interval = "monthly" } = await req.json();

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId },
    include: { org: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const org = membership.org;

  // Get or create Stripe customer
  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.userId, // Will be resolved via Clerk
      metadata: { orgId: org.id, userId: session.userId },
    });
    customerId = customer.id;
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig || !("monthlyPriceId" in planConfig)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = interval === "yearly"
    ? planConfig.yearlyPriceId
    : planConfig.monthlyPriceId;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { orgId: org.id },
    },
    metadata: { orgId: org.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

**File**: `src/app/api/stripe/webhooks/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            plan: determinePlanFromPrice(session),
            trialEndsAt: null,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const orgId = subscription.metadata.orgId;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            stripePriceId: priceId,
            plan: mapPriceToPlan(priceId),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata.orgId;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Send notification, flag account
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function mapPriceToPlan(priceId: string): string {
  if (priceId.includes("starter")) return "STARTER";
  if (priceId.includes("pro")) return "PRO";
  if (priceId.includes("business")) return "BUSINESS";
  return "FREE";
}
```

**File**: `src/app/api/stripe/portal/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId },
    include: { org: true },
  });

  if (!membership?.org.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: membership.org.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 5.3 Usage Metering

**File**: `src/lib/metering.ts`

Track usage against plan limits for enforcement:

```typescript
import { prisma } from "./db";

const PLAN_LIMITS = {
  FREE: { simulations: 3, twins: 1, apiCalls: 100, members: 2, retentionDays: 7 },
  STARTER: { simulations: 25, twins: 5, apiCalls: 5000, members: 5, retentionDays: 30 },
  PRO: { simulations: 100, twins: 20, apiCalls: 50000, members: 15, retentionDays: 90 },
  BUSINESS: { simulations: -1, twins: 50, apiCalls: 200000, members: 50, retentionDays: 365 },
  ENTERPRISE: { simulations: -1, twins: -1, apiCalls: -1, members: -1, retentionDays: -1 },
} as const;

export async function checkUsageLimit(orgId: string, resource: keyof typeof PLAN_LIMITS.FREE) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error("Organization not found");

  const limits = PLAN_LIMITS[org.plan];
  const limit = limits[resource];

  if (limit === -1) return { allowed: true, current: 0, limit: -1 };

  // Count current usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const current = await prisma.simulation.count({
    where: { orgId, createdAt: { gte: startOfMonth } },
  });

  return { allowed: current < limit, current, limit };
}
```

---

## 6. Phase 4: Feature Gating & RBAC (Weeks 4-7)

### 6.1 RBAC System

**File**: `src/lib/rbac.ts`

```typescript
import { Role } from "@prisma/client";

type Resource = string;
type Action = "read" | "write" | "execute" | "delete" | "admin";

const ROLE_PERMISSIONS: Record<Role, { can: Array<{ resource: string; actions: Action[] }> }> = {
  OWNER: {
    can: [{ resource: "*", actions: ["read", "write", "execute", "delete", "admin"] }],
  },
  ADMIN: {
    can: [
      { resource: "*", actions: ["read", "write", "execute", "delete"] },
      { resource: "org:settings", actions: ["admin"] },
      { resource: "billing:*", actions: ["read", "write"] },
    ],
  },
  MEMBER: {
    can: [
      { resource: "dashboard:*", actions: ["read", "write"] },
      { resource: "sandbox:*", actions: ["read", "write", "execute"] },
      { resource: "threats:*", actions: ["read"] },
    ],
  },
  VIEWER: {
    can: [
      { resource: "dashboard:*", actions: ["read"] },
      { resource: "threats:*", actions: ["read"] },
    ],
  },
};

export function hasPermission(role: Role, resource: string, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  for (const rule of permissions.can) {
    if (rule.resource === "*" || rule.resource === resource || resource.startsWith(rule.resource.replace("*", ""))) {
      if (rule.actions.includes(action) || rule.actions.includes("*" as Action)) {
        return true;
      }
    }
  }
  return false;
}

export function requirePermission(role: Role, resource: string, action: Action) {
  if (!hasPermission(role, resource, action)) {
    throw new Error(`Permission denied: ${role} cannot ${action} on ${resource}`);
  }
}
```

### 6.2 Feature Flags System

**File**: `src/lib/feature-flags.ts`

```typescript
import { prisma } from "./db";
import { Plan } from "@prisma/client";

type FeatureKey =
  | "sandbox.unlimited_twins"
  | "sandbox.advanced_vectors"
  | "ai.custom_models"
  | "ai.threat_intel_feeds"
  | "defensive.autonomous_mode"
  | "defensive.playbook_builder"
  | "topology.real_3d"
  | "analytics.advanced"
  | "api.access"
  | "team.management"
  | "audit.logs"
  | "white_label"
  | "sso"
  | "priority_support"
  | "on_prem_deployment";

const PLAN_FEATURES: Record<Plan, FeatureKey[]> = {
  FREE: [],
  STARTER: [
    "sandbox.advanced_vectors",
    "analytics.advanced",
  ],
  PRO: [
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "analytics.advanced",
    "api.access",
    "audit.logs",
    "priority_support",
  ],
  BUSINESS: [
    "sandbox.unlimited_twins",
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "defensive.playbook_builder",
    "topology.real_3d",
    "analytics.advanced",
    "api.access",
    "team.management",
    "audit.logs",
    "priority_support",
    "white_label",
  ],
  ENTERPRISE: [
    "sandbox.unlimited_twins",
    "sandbox.advanced_vectors",
    "ai.custom_models",
    "ai.threat_intel_feeds",
    "defensive.autonomous_mode",
    "defensive.playbook_builder",
    "topology.real_3d",
    "analytics.advanced",
    "api.access",
    "team.management",
    "audit.logs",
    "sso",
    "white_label",
    "priority_support",
    "on_prem_deployment",
  ],
};

export function hasFeature(plan: Plan, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export async function getOrgFeatures(orgId: string): Promise<FeatureKey[]> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return [];
  return PLAN_FEATURES[org.plan] ?? [];
}
```

### 6.3 Client-Side Feature Hook

**File**: `src/hooks/useFeatureFlag.ts`

```typescript
"use client";

import { useOrg } from "./useOrg";
import { hasFeature, FeatureKey } from "@/lib/feature-flags";

export function useFeatureFlag(feature: FeatureKey): boolean {
  const { org } = useOrg();
  if (!org) return false;
  return hasFeature(org.plan, feature);
}
```

### 6.4 Plan-Gated Dashboard Pages

Wrap dashboard pages with plan checks:

```typescript
// Example: src/app/dashboard/sandbox/page.tsx (modified)
"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { UpgradePrompt } from "@/components/shared/UpgradePrompt";
import SandboxPageContent from "./SandboxPageContent";

export default function SandboxPage() {
  const hasAdvancedSandbox = useFeatureFlag("sandbox.advanced_vectors");

  return (
    <>
      <SandboxPageContent />
      {!hasAdvancedSandbox && (
        <UpgradePrompt
          feature="Advanced Attack Vectors"
          requiredPlan="STARTER"
          description="Unlock ransomware, APT, and insider threat simulations"
        />
      )}
    </>
  );
}
```

---

## 7. Phase 5: Enterprise Features (Weeks 6-10)

### 7.1 Admin Dashboard

**New pages**:
- `src/app/dashboard/admin/page.tsx` — Overview (members, usage, billing status)
- `src/app/dashboard/admin/members/page.tsx` — Invite/remove members, change roles
- `src/app/dashboard/admin/billing/page.tsx` — Current plan, usage meters, upgrade/downgrade, invoices
- `src/app/dashboard/admin/audit-log/page.tsx` — Filterable audit log table
- `src/app/dashboard/admin/api-keys/page.tsx` — Create/revoke API keys
- `src/app/dashboard/admin/notifications/page.tsx` — Notification preferences

### 7.2 Sidebar Navigation Update

**File**: `src/components/shared/DashboardLayout.tsx`

Add admin section to navItems (only visible to ADMIN/OWNER roles):

```typescript
const adminNavItems = [
  { href: '/dashboard/admin', label: 'Admin Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/members', label: 'Team Members', icon: Users },
  { href: '/dashboard/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/admin/audit-log', label: 'Audit Log', icon: FileText },
  { href: '/dashboard/admin/api-keys', label: 'API Keys', icon: Key },
];
```

### 7.3 Audit Logging

**File**: `src/lib/audit.ts`

```typescript
import { prisma } from "./db";

export async function logAuditEvent(params: {
  orgId: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ip?: string;
}) {
  return prisma.auditLog.create({
    data: {
      orgId: params.orgId,
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      details: params.details ?? {},
      ip: params.ip,
    },
  });
}
```

Auto-log on key events: threat detected, sandbox provisioned, member invited, plan changed, API key created, settings updated.

### 7.4 Notification System

**New file**: `src/lib/notifications.ts`

```typescript
import { prisma } from "./db";

export async function createNotification(params: {
  orgId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  return prisma.notification.create({ data: params });
}

// Batch create for all org admins
export async function notifyOrgAdmins(orgId: string, params: {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const admins = await prisma.membership.findMany({
    where: { orgId, role: { in: ["OWNER", "ADMIN"] } },
  });

  return Promise.all(
    admins.map(admin =>
      createNotification({ orgId, ...params })
    )
  );
}
```

### 7.5 Public API

**New files**:
- `src/app/api/v1/threats/route.ts` — List threats
- `src/app/api/v1/simulations/route.ts` — CRUD simulations
- `src/app/api/v1/sandbox/route.ts` — Provision twins
- `src/lib/api-auth.ts` — Validate API key from header

```typescript
// src/lib/api-auth.ts
import { prisma } from "./db";
import crypto from "crypto";

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  orgId?: string;
  userId?: string;
  scopes?: string[];
}> {
  const prefix = key.substring(0, 12);
  const hash = crypto.createHash("sha256").update(key).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    select: { orgId: true, userId: true, scopes: true, expiresAt: true, lastUsed: true },
  });

  if (!apiKey) return { valid: false };
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return { valid: false };

  // Update last used
  await prisma.apiKey.update({
    where: { keyHash: hash },
    data: { lastUsed: new Date() },
  });

  return {
    valid: true,
    orgId: apiKey.orgId,
    userId: apiKey.userId,
    scopes: apiKey.scopes as string[],
  };
}
```

### 7.6 Analytics Dashboard

**New page**: `src/app/dashboard/analytics/page.tsx`

- Threat detection trends (line chart, 7d/30d/90d)
- Sandbox utilization (twins spawned, IOCs captured, credential hits)
- AI reasoning performance (confidence distribution, latency p50/p95/p99)
- Team activity timeline
- Export to CSV/PDF

---

## 8. Feature Matrix

### Dashboard Page Availability

| Page | Free | Starter ($29) | Pro ($99) | Business ($299) | Enterprise |
|------|------|---------------|-----------|-----------------|------------|
| Command Center | Read-only | Full | Full | Full | Full |
| Threat Monitor | Basic (3 threats max) | 25 threats | 100 threats | Unlimited | Unlimited |
| AI Core | Read-only | Read-only | Full | Full | Full + Custom Models |
| Network Topology | Basic | Full | Full | Full + 3D | Full + 3D + Custom |
| Orchestration | View only | 5 twins/mo | 20 twins/mo | 50 twins/mo | Unlimited |
| Defensive Ops | None | Manual only | Auto + Manual | Full autonomous | Full + Playbooks |
| Sandbox Lab | 1 vector | 3 vectors | All 6 vectors | All + Custom | All + Custom + API |
| Configuration | Basic | Full | Full | Full + SSO | Full + SSO + White Label |
| Admin Dashboard | None | None | Basic | Full | Full + Custom |
| Audit Log | None | None | 30 days | 365 days | Unlimited |
| Analytics | None | Basic | Advanced | Advanced + Export | Custom Dashboards |
| API Access | None | None | REST | REST + Webhooks | REST + Webhooks + SDK |

### Rate Limits

| Tier | WebSocket Connections | API Calls/min | Sandbox Provision/min | AI Queries/day |
|------|----------------------|---------------|----------------------|----------------|
| Free | 1 | 100 | 1 | 10 |
| Starter | 3 | 500 | 5 | 100 |
| Pro | 10 | 5,000 | 20 | 1,000 |
| Business | 50 | 20,000 | 50 | 10,000 |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited |

### Data Retention

| Tier | Threat Logs | Audit Logs | Simulations | IOC Data |
|------|------------|------------|-------------|----------|
| Free | 7 days | None | 3 sessions | 24 hours |
| Starter | 30 days | None | 25/month | 7 days |
| Pro | 90 days | 30 days | 100/month | 90 days |
| Business | 365 days | 365 days | Unlimited | 365 days |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited |

### Support Levels

| Tier | Response Time | Channels | Dedicated CSM |
|------|--------------|----------|---------------|
| Free | Best effort | Community forum | No |
| Starter | 48 hours | Email | No |
| Pro | 24 hours | Email + Chat | No |
| Business | 4 hours | Email + Chat + Phone | Yes |
| Enterprise | 1 hour (24/7) | All + Slack channel | Yes + Onboarding |

---

## 9. Stripe Integration Architecture

### Subscription Lifecycle

```
User clicks "Upgrade" → Stripe Checkout → Payment succeeds
  → Webhook: checkout.session.completed
    → Create/update subscription in DB
    → Set org.plan = selected tier
    → Grant access to tier features
    → Send welcome email + audit log entry

Monthly cycle:
  → Stripe invoice.paid webhook → Extend subscription
  → Stripe invoice.payment_failed → Flag account, notify admins
  → After 3 failed attempts → Downgrade to FREE, notify

User clicks "Manage" → Stripe Customer Portal
  → Update payment method
  → View invoices
  → Cancel subscription (period end)
  → Switch plans (prorated)

Cancellation:
  → Webhook: customer.subscription.deleted
    → Set org.plan = FREE
    → Preserve data for retention period
    → Send churn survey email
```

### Failed Payment Recovery

1. First failure: Retry in 3 days (Stripe Smart Retries)
2. Second failure: Email notification + in-app banner
3. Third failure: 7-day grace period, reduced to Starter features
4. Fourth failure: Downgrade to Free, preserve data

### Trial Management

- 14-day free trial on all paid plans
- `org.trialEndsAt` set on checkout completion
- Warning emails at 7 days, 3 days, 1 day remaining
- Auto-downgrade to Free after trial expires (if no payment method added)
- Can convert trial to paid without losing data

---

## 10. X-Factor Differentiators

### 10.1 Unique Capabilities

| Feature | Description | Monetization |
|---------|-------------|-------------|
| **AI Deception Twinning** | Automatically spawns decoy systems that mirror production, learning attacker TTPs in real-time | Pro+ |
| **Threat Actor Attribution** | Maps observed TTPs to known APT groups (APT28, Lazarus, etc.) using RAG over MITRE + threat intel | Pro+ |
| **Autonomous Playbook Generation** | AI writes and executes Ansible/Terraform playbooks to neutralize threats without human intervention | Business+ |
| **Deception-as-Code** | Define deception networks in YAML/JSON, version control them, deploy via API | Business+ |
| **IOC Extraction Pipeline** | Automatically extracts IOCs from sandbox sessions, formats for SIEM/SOAR integration | Starter+ |
| **Live Attack Simulation** | Customers can trigger real attack vectors against their own deception infrastructure | All (limited) |

### 10.2 Competitive Moats

1. **No competitor has autonomous AI-driven deception** — most deception platforms (Attivo, Illusive) are static honeypots. Aetheris dynamically spawns twins and adapts.

2. **eBPF-native telemetry** — Cilium integration gives kernel-level visibility without agents. Competitors rely on network taps or host agents.

3. **MITRE ATT&CK correlation in real-time** — Live TTP mapping during active attacks, not post-mortem analysis.

4. **Deception-as-Code** — First platform to let teams define and version-control their deception infrastructure.

5. **AI Reasoning Transparency** — Full LangGraph state machine visualization. Customers see exactly how the AI thinks, builds trust.

### 10.3 Enterprise Upsell Opportunities

- **White-label**: SOC providers can rebrand Aetheris for their clients
- **On-prem deployment**: Air-gapped environments (government, defense)
- **Custom AI models**: Train on customer's specific threat landscape
- **Compliance packages**: SOC 2, HIPAA, PCI-DSS reporting templates
- **Threat intelligence marketplace**: Share anonymized IOCs across customers

---

## 11. File-by-File Implementation Guide

### New Files to Create

| File Path | Purpose | Phase |
|-----------|---------|-------|
| `prisma/schema.prisma` | Database schema | 1 |
| `prisma/seed.ts` | Seed default orgs + feature flags | 1 |
| `src/lib/db.ts` | Prisma client singleton | 1 |
| `src/server/trpc/index.ts` | tRPC initialization | 2 |
| `src/server/trpc/context.ts` | Request context (auth + db) | 2 |
| `src/server/routers/_app.ts` | Root tRPC router | 2 |
| `src/server/routers/org.ts` | Organization CRUD | 2 |
| `src/server/routers/member.ts` | Team management | 2 |
| `src/server/routers/simulation.ts` | Simulation CRUD | 2 |
| `src/server/routers/audit.ts` | Audit log queries | 5 |
| `src/server/routers/notification.ts` | Notifications | 5 |
| `src/server/routers/apikey.ts` | API key management | 5 |
| `src/server/routers/billing.ts` | Subscription management | 3 |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP handler | 2 |
| `src/app/api/stripe/checkout/route.ts` | Stripe Checkout | 3 |
| `src/app/api/stripe/portal/route.ts` | Stripe Customer Portal | 3 |
| `src/app/api/stripe/webhooks/route.ts` | Stripe webhooks | 3 |
| `src/app/api/health/route.ts` | Health check | 2 |
| `src/lib/stripe.ts` | Stripe client + plan config | 3 |
| `src/lib/rbac.ts` | RBAC permission checks | 4 |
| `src/lib/feature-flags.ts` | Feature flag evaluation | 4 |
| `src/lib/metering.ts` | Usage tracking + limits | 3 |
| `src/lib/rate-limit.ts` | Rate limiting utilities | 0 |
| `src/lib/audit.ts` | Audit logging helper | 5 |
| `src/lib/notifications.ts` | Notification creation | 5 |
| `src/lib/api-auth.ts` | API key validation | 5 |
| `src/hooks/useOrg.ts` | Organization context hook | 2 |
| `src/hooks/useSubscription.ts` | Subscription info hook | 3 |
| `src/hooks/useFeatureFlag.ts` | Feature flag hook | 4 |
| `src/providers/OrgProvider.tsx` | Organization context provider | 2 |
| `src/providers/QueryProvider.tsx` | TanStack Query provider | 2 |
| `src/store/useOrgStore.ts` | Organization state | 2 |
| `src/app/pricing/page.tsx` | Pricing page | 3 |
| `src/app/dashboard/admin/page.tsx` | Admin overview | 5 |
| `src/app/dashboard/admin/members/page.tsx` | Team management | 5 |
| `src/app/dashboard/admin/billing/page.tsx` | Billing management | 3 |
| `src/app/dashboard/admin/audit-log/page.tsx` | Audit log viewer | 5 |
| `src/app/dashboard/admin/api-keys/page.tsx` | API key management | 5 |
| `src/app/dashboard/analytics/page.tsx` | Analytics dashboard | 5 |
| `src/app/api/v1/threats/route.ts` | Public API: threats | 5 |
| `src/app/api/v1/simulations/route.ts` | Public API: simulations | 5 |
| `src/app/api/v1/sandbox/route.ts` | Public API: sandbox | 5 |
| `src/components/shared/UpgradePrompt.tsx` | Upgrade CTA component | 4 |
| `src/components/shared/PlanBadge.tsx` | Plan indicator badge | 4 |
| `.github/workflows/ci.yml` | CI/CD pipeline | 1 |

### Files to Modify

| File Path | Changes | Phase |
|-----------|---------|-------|
| `src/proxy.ts` → `src/middleware.ts` | Rename + add API route protection | 0 |
| `backend/main.py` | Fix auth bypass, restrict CORS, add rate limiting, add tenant context to WS | 0 |
| `next.config.ts` | Add security headers | 0 |
| `package.json` | Add prisma, @trpc, zod, stripe, @tanstack/react-query | 1 |
| `src/app/layout.tsx` | Wrap with OrgProvider + QueryProvider | 2 |
| `src/components/shared/DashboardLayout.tsx` | Add admin nav items, role-based visibility, org switcher | 4 |
| `src/components/marketing/SiteHeader.tsx` | Add pricing link, org switcher | 3 |
| `src/store/useSimulationStore.ts` | Add orgId to all mutations, persist to DB via tRPC | 1 |
| `src/app/dashboard/page.tsx` | Add plan-aware data fetching | 4 |
| `src/app/dashboard/settings/page.tsx` | Split into org settings + system config | 4 |
| `src/app/page.tsx` | Add pricing section to landing page | 3 |

### Dependencies to Add

```json
{
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/next": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "stripe": "^17.0.0",
    "zod": "^3.23.0",
    "superjson": "^2.2.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0"
  }
}
```

---

## 12. Migration Strategy

### For Existing Data
1. Deploy PostgreSQL (Neon or Supabase)
2. Run Prisma migrations
3. Seed default organization for existing users
4. Migrate ephemeral Zustand store initialization to DB-backed data
5. Keep Zustand for real-time WebSocket state (threats, telemetry) — these remain ephemeral per-session but are logged to DB for history

### Deployment Pipeline
1. Railway (FastAPI backend) — add DATABASE_URL env var
2. Vercel (Next.js frontend) — add Prisma, Stripe, tRPC env vars
3. Neon/Supabase (PostgreSQL) — provision free tier for dev, scale for prod

### Rollout Order
1. Phase 0 (security fixes) → Deploy immediately
2. Phase 1 (database) → Deploy schema, run migrations
3. Phase 2 (API layer) → Deploy tRPC, migrate existing pages
4. Phase 3 (billing) → Deploy Stripe integration, create products
5. Phase 4 (feature gating) → Enable plan checks, test upgrade flows
6. Phase 5 (enterprise) → Deploy admin dashboard, audit logging

### Testing Strategy
- Unit tests for RBAC, feature flags, metering (vitest)
- Integration tests for Stripe webhooks (vitest + stripe mock)
- E2E tests for upgrade flow, auth flow (Playwright)
- Load tests for WebSocket multi-tenant routing (k6)

---

## Appendix: Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```
