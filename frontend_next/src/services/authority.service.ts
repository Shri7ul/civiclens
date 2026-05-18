import { api } from "./api";

export const authorityService = {
  unassignedRequests() {
    return api.get<any[]>('/unassigned-police-requests').then((res) => res.data);
  },
  allOfficers() {
    return api.get<any[]>('/all-officers').then((res) => res.data);
  },
  assignCase(payload: { police_request_id: number; officer_id: number; assigned_by_authority_id?: number }) {
    return api.post('/assign-case', payload).then((res) => res.data);
  },
  reassignCase(payload: { police_request_id: number; officer_id: number; assigned_by_authority_id?: number }) {
    return api.post('/reassign-case', payload).then((res) => res.data);
  },
  updateCaseStatus(payload: { police_request_id: number; status: string; authority_id?: number }) {
    return api.patch('/update-case-status', payload).then((res) => res.data);
  },
  assignedCases(officer_id: number) {
    return api.get<any[]>(`/assigned-cases/${officer_id}`).then((res) => res.data);
  }
  ,
  assignedCasesAll() {
    return api.get<any[]>('/assigned-cases').then((res) => res.data);
  }
};
