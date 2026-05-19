import { api } from "./api";
import type { CaseUpdate, PoliceRequest } from "@/types/domain";

export const caseService = {
  assignedCases(officerId: number) {
    return api.get<PoliceRequest[]>(`/assigned-cases/${officerId}`).then((res) => res.data);
  },
  assignCase(payload: { police_request_id: number; officer_id: number }) {
    return api.post("/assign-case", payload).then((res) => res.data);
  },
  // backend expects { police_request_id, officer_id, update_message, case_status }
  addCaseUpdate(payload: { police_request_id: number; officer_id: number; update_message: string; case_status: string }) {
    return api.post("/add-case-update", payload).then((res) => res.data);
  },
  caseUpdates(policeRequestId: number) {
    return api.get<CaseUpdate[]>(`/case-updates/${policeRequestId}`).then((res) => res.data);
  },
  uploadCaseDocument(formData: FormData) {
    return api.post("/upload-case-document", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
  },
  caseDocuments(policeRequestId: number) {
    return api.get(`/case-documents/${policeRequestId}`).then((res) => res.data);
  },
  confirmSolved(payload: { police_request_id: number; user_id: number }) {
    return api.post(`/case/confirm-solved`, payload).then((res) => res.data);
  },
  rejectSolved(payload: { police_request_id: number; user_id: number }) {
    return api.post(`/case/reject-solved`, payload).then((res) => res.data);
  },
};
