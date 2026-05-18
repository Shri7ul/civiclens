import { api } from "./api";
import type { PoliceRequest } from "@/types/domain";

export const policeService = {
  addPoliceRequest(payload: Partial<PoliceRequest>) {
    return api.post("/add-police-request", payload).then((res) => res.data);
  },
  myPoliceRequests(userId: number) {
    return api.get<PoliceRequest[]>(`/my-police-requests/${userId}`).then((res) => res.data);
  },
  allPoliceRequests() {
    return api.get<PoliceRequest[]>("/police-requests").then((res) => res.data);
  },
};
