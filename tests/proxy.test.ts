import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isProtectedRoute } from "@/proxy";

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);

describe("proxy route protection", () => {
  it("leaves Stripe webhooks and the health probe reachable without a session", () => {
    expect(isProtectedRoute(req("/api/stripe/webhooks"))).toBe(false);
    expect(isProtectedRoute(req("/api/health"))).toBe(false);
  });
  it("protects the dashboard, tRPC, and session-bound Stripe routes", () => {
    expect(isProtectedRoute(req("/dashboard"))).toBe(true);
    expect(isProtectedRoute(req("/dashboard/admin/billing"))).toBe(true);
    expect(isProtectedRoute(req("/api/trpc/org.getCurrent"))).toBe(true);
    expect(isProtectedRoute(req("/api/stripe/checkout"))).toBe(true);
    expect(isProtectedRoute(req("/api/stripe/portal"))).toBe(true);
  });
});
