"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { AuthSession, LoginPayload, UserRole } from "@/types/auth";
import { roleHomePath } from "@/lib/rbac";
import { clearSession, persistSession, sessionStorageKeys } from "@/store/session-storage";

interface AuthContextValue {
  session: AuthSession | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const validRoles: UserRole[] = ["citizen", "officer", "authority", "contractor", "admin"];

function isUserRole(value: string | null): value is UserRole {
  return validRoles.includes(value as UserRole);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const access_token = localStorage.getItem(sessionStorageKeys.token);
    const role = localStorage.getItem(sessionStorageKeys.role);
    const userId = localStorage.getItem(sessionStorageKeys.userId);
    const parsedUserId = Number(userId);
    const rolesRaw = localStorage.getItem("roles");
    const hasCitizen = localStorage.getItem("has_citizen_services");

    if (access_token && isUserRole(role) && Number.isFinite(parsedUserId)) {
      const parsedRoles = rolesRaw ? JSON.parse(rolesRaw) as string[] : undefined;
      setSession({ access_token, role, user_id: parsedUserId, roles: parsedRoles, has_citizen_services: hasCitizen === "1" });
    } else {
      clearSession();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextSession = await authService.login(payload);
    persistSession(nextSession);
    document.cookie = `access_token=${nextSession.access_token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `role=${nextSession.role}; path=/; max-age=86400; SameSite=Lax`;
    if (nextSession.roles) {
      document.cookie = `roles=${encodeURIComponent(JSON.stringify(nextSession.roles))}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (typeof nextSession.has_citizen_services !== "undefined") {
      document.cookie = `has_citizen_services=${nextSession.has_citizen_services ? "1" : "0"}; path=/; max-age=86400; SameSite=Lax`;
    }
    setSession(nextSession);
    toast.success("Signed in successfully");
    router.push(roleHomePath[nextSession.role]);
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    document.cookie = "roles=; path=/; max-age=0";
    document.cookie = "has_citizen_services=; path=/; max-age=0";
    setSession(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, role: session?.role ?? null, isLoading, isAuthenticated: Boolean(session), login, logout }),
    [session, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
