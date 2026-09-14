import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Stripe webhooks and the health probe carry no Clerk session and must stay reachable.
// Route handlers under /api/stripe verify the session themselves.
export const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/trpc(.*)",
  "/api/stripe/checkout",
  "/api/stripe/portal",
]);

// Strict CSP: Clerk mints a per-request nonce, adds 'strict-dynamic', its own frontend API host and
// script origins, and passes the nonce to ClerkProvider. We only add what Clerk cannot know about.
const backendWs = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
export const cspDirectives: Record<string, string[]> = {
  "connect-src": backendWs ? [backendWs] : [],
  "frame-src": ["https://checkout.stripe.com"],
  "img-src": ["blob:", "data:"],
  "object-src": ["none"],
  "base-uri": ["self"],
  "frame-ancestors": ["none"],
};

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up", contentSecurityPolicy: { strict: true, directives: cspDirectives } },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
