export type UserRole = "citizen" | "officer" | "authority" | "contractor" | "admin";

export interface AuthSession {
  access_token: string;
  role: UserRole;
  user_id: number;
  roles?: string[];
  has_citizen_services?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nid?: string;
  phone?: string;
}
