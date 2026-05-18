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
};
