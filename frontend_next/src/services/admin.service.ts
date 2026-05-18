import { api } from "./api";
import type { AuditLog, PendingUser, SystemStats } from "@/types/domain";

export const adminService = {
  pendingOfficers() {
    return api.get<PendingUser[]>("/pending-officers").then((res) => res.data);
  },
  pendingAuthorities() {
    return api.get<PendingUser[]>("/pending-authorities").then((res) => res.data);
  },
  pendingContractors() {
    return api.get<PendingUser[]>("/pending-contractors").then((res) => res.data);
  },
  approveUser(userId: number, admin_id?: number) {
    return api.put(`/approve-user/${userId}`, { admin_id }).then((res) => res.data);
  },
  rejectUser(userId: number, admin_id?: number) {
    return api.put(`/reject-user/${userId}`, { admin_id }).then((res) => res.data);
  },
  systemStats() {
    return api.get<SystemStats>("/system-stats").then((res) => res.data);
  },
  auditLogs() {
    return api.get<AuditLog[]>("/audit-logs").then((res) => res.data);
  },
};
