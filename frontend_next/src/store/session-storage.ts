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
}

export function clearSession() {
  localStorage.removeItem(sessionStorageKeys.token);
  localStorage.removeItem(sessionStorageKeys.role);
  localStorage.removeItem(sessionStorageKeys.userId);
}
