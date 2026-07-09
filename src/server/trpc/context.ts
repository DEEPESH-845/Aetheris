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
      orderBy: { createdAt: "asc" },
      select: { orgId: true, role: true },
    });
    orgId = membership?.orgId ?? null;
    role = membership?.role ?? null;
  }

  return { userId, orgId, role, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
