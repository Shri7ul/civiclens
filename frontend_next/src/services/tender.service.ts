import { api } from "./api";
import type { Tender, TenderParticipation } from "@/types/domain";

export const tenderService = {
  list() {
    return api.get<Tender[]>("/tenders").then((res) => res.data);
  },
  add(payload: Partial<Tender>) {
    return api.post("/add-tender", payload).then((res) => res.data);
  },
  participationStatus(contractorId: number) {
    return api.get<TenderParticipation[]>(`/tender-participation-status/${contractorId}`).then((res) => res.data);
  },
  get(tenderId: number) {
    return api.get<Tender>(`/tenders/${tenderId}`).then((res) => res.data);
  },
  apply(tenderId: number, payload: FormData) {
    return api.post(`/tenders/${tenderId}/apply`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
  },
  bids(tenderId: number) {
    return api.get(`/tenders/${tenderId}/bids`).then((res) => res.data);
  },
  award(tenderId: number, bidId: number) {
    return api.post(`/tenders/${tenderId}/award`, null, { params: { bid_id: bidId } }).then((res) => res.data);
  }
};
