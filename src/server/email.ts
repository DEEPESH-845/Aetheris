import "server-only";
import { env } from "@/env";

/** Returns false when no email provider is configured; callers fall back to a shareable link. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    console.error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return false;
  }
  return true;
}
