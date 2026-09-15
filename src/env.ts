import "server-only";
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal("").transform(() => undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  NEXT_PUBLIC_BACKEND_WS_URL: optionalUrl,
  NEXT_PUBLIC_BILLING_ENABLED: z.enum(["true", "false"]).default("false"),
  STRIPE_SECRET_KEY: z.string().optional().or(z.literal("").transform(() => undefined)),
  STRIPE_WEBHOOK_SECRET: z.string().optional().or(z.literal("").transform(() => undefined)),
  // Set by the Resend marketplace integration. Absent locally: invites are shared by link instead.
  RESEND_API_KEY: z.string().optional().or(z.literal("").transform(() => undefined)),
  CRON_SECRET: z.string().optional().or(z.literal("").transform(() => undefined)),
  EMAIL_FROM: z.string().default("Aetheris <noreply@aetheris.dev>"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment:\n${issues}`);
}

if (parsed.data.NODE_ENV === "production" && parsed.data.NEXT_PUBLIC_BACKEND_WS_URL?.startsWith("ws://")) {
  throw new Error("NEXT_PUBLIC_BACKEND_WS_URL must use wss:// in production");
}

export const env = parsed.data;
