import { NextResponse } from "next/server";
import { env } from "@/env";
import { enforceRetention } from "@/server/retention";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel Cron calls this with `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(req: Request) {
  if (!env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deleted = await enforceRetention();
  return NextResponse.json({ ok: true, deleted, at: new Date().toISOString() });
}
