import type { AuthSession } from "@/types/auth";

export const sessionStorageKeys = {
  token: "access_token",
  role: "role",
  userId: "user_id",
} as const;

export function persistSession(session: AuthSession) {
  localStorage.setItem(sessionStorageKeys.token, session.access_token);
  localStorage.setItem(sessionStorageKeys.role, session.role);
  localStorage.setItem(sessionStorageKeys.userId, String(session.user_id));
  if (session.roles) {
    localStorage.setItem("roles", JSON.stringify(session.roles));
  }
  if (typeof session.has_citizen_services !== "undefined") {
    localStorage.setItem("has_citizen_services", session.has_citizen_services ? "1" : "0");
  }
}

export function clearSession() {
  localStorage.removeItem(sessionStorageKeys.token);
  localStorage.removeItem(sessionStorageKeys.role);
  localStorage.removeItem(sessionStorageKeys.userId);
  localStorage.removeItem("roles");
  localStorage.removeItem("has_citizen_services");
}
