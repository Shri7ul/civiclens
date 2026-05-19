export type RequestStatus = "pending" | "approved" | "rejected" | "assigned" | "investigating" | "closed";

export interface PoliceRequest {
  id: number;
  title?: string;
  description: string;
  status: RequestStatus | string;
  created_at?: string;
  citizen_id?: number;
  assigned_officer_id?: number;
  area?: string;
  location?: string;
}

export interface CaseUpdate {
  id: number;
  police_request_id: number;
  update_text: string;
  status?: string;
  created_at?: string;
}

export interface Tender {
  id: number;
  title: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status?: string;
}

export interface TenderParticipation {
  id: number;
  tender_id?: number;
  tender_title?: string;
  contractor_id?: number;
  status: string;
  submitted_at?: string;
  remarks?: string;
}

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  actor_id?: number;
  created_at?: string;
  details?: string;
}

export interface SystemStats {
  users?: number;
  police_requests?: number;
  active_cases?: number;
  tenders?: number;
  pending_approvals?: number;
}
