import { auth } from "@clerk/nextjs/server";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureTenant } from "@/server/tenant";

export async function createContext(opts?: { req?: Request }) {
  const { userId } = await auth();

  let orgId: string | null = null;
  let role: Role | null = null;
  if (userId) {
    const tenant = await ensureTenant(userId);
    orgId = tenant.orgId;
    role = tenant.role;
  }

  const ip = opts?.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  return { userId, orgId, role, ip, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
