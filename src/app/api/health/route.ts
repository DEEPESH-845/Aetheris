import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "error";
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("db timeout")), 2000)),
    ]);
    db = "ok";
  } catch (err) {
    console.error("health: database check failed", err);
  }
  const status = db === "ok" ? "healthy" : "degraded";
  return NextResponse.json(
    { status, checks: { db, dbLatencyMs: Date.now() - started }, timestamp: new Date().toISOString() },
    { status: db === "ok" ? 200 : 503 },
  );
}
