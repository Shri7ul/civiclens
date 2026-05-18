import { api } from "./api";
import type { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthSession>("/login", payload);
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post("/register", payload);
    return data;
  },
  async registerOfficer(payload: any) {
    const { data } = await api.post("/register-officer", payload);
    return data;
  },
  async registerAuthority(payload: any) {
    const { data } = await api.post("/register-authority", payload);
    return data;
  },
  async registerContractor(payload: any) {
    const { data } = await api.post("/register-contractor", payload);
    return data;
  }
};
