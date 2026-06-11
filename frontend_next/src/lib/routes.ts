import type { UserRole } from "@/types/auth";

export const roleHomePath: Record<UserRole, string> = {
  citizen: "/citizen/dashboard",
  officer: "/officer/dashboard",
  authority: "/authority/dashboard",
  contractor: "/contractor/dashboard",
  admin: "/admin/dashboard",
};

export const protectedPrefixes: Record<UserRole, string> = {
  citizen: "/citizen",
  officer: "/officer",
  authority: "/authority",
  contractor: "/contractor",
  admin: "/admin",
};
