import { AppRole } from "@prisma/client";

export type Permission =
  | "projects:read"
  | "projects:write"
  | "consultants:read"
  | "consultants:write"
  | "time:read"
  | "time:write"
  | "time:review"
  | "expenses:read"
  | "expenses:write"
  | "forecasts:read"
  | "forecasts:write"
  | "stats:read"
  | "users:manage";

const allPermissions: Permission[] = [
  "projects:read",
  "projects:write",
  "consultants:read",
  "consultants:write",
  "time:read",
  "time:write",
  "time:review",
  "expenses:read",
  "expenses:write",
  "forecasts:read",
  "forecasts:write",
  "stats:read",
  "users:manage",
];

export const rolePermissions: Record<AppRole, Permission[]> = {
  ADMIN: allPermissions,
  PM: [
    "projects:read",
    "projects:write",
    "consultants:read",
    "consultants:write",
    "time:read",
    "time:write",
    "time:review",
    "expenses:read",
    "expenses:write",
    "forecasts:read",
    "forecasts:write",
    "stats:read",
  ],
  CONSULTANT: ["projects:read", "consultants:read", "time:read", "time:write", "stats:read"],
  FINANCE: ["projects:read", "expenses:read", "expenses:write", "forecasts:read", "stats:read"],
  VIEWER: ["projects:read", "consultants:read", "time:read", "expenses:read", "forecasts:read", "stats:read"],
};

export function resolvePermissions(roles: AppRole[]): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of roles) {
    for (const permission of rolePermissions[role]) {
      permissions.add(permission);
    }
  }

  return Array.from(permissions);
}
