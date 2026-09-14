import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Stripe webhooks and the health probe carry no Clerk session and must stay reachable.
// Route handlers under /api/stripe verify the session themselves.
export const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/trpc(.*)",
  "/api/stripe/checkout",
  "/api/stripe/portal",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
