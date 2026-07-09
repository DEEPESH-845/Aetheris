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
    const resourceMatch =
      rule.resource === "*" ||
      rule.resource === resource ||
      resource.startsWith(rule.resource.replace("*", ""));
    const actionMatch = rule.actions.includes(action) || rule.actions.includes("admin");

    if (resourceMatch && actionMatch) return true;
  }
  return false;
}

export function requirePermission(role: Role, resource: string, action: Action): void {
  if (!hasPermission(role, resource, action)) {
    throw new Error(`Permission denied: ${role} cannot ${action} on ${resource}`);
  }
}
