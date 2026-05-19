import { api } from "./api";

export const publicService = {
  dashboard() {
    return api.get(`/public-dashboard`).then((res) => res.data);
  },
  publicCases() {
    return api.get(`/public-cases`).then((res) => res.data);
  },
  // Admin helpers (require admin_id in payload)
  createPublicCase(payload: any) {
    return api.post(`/admin/public-case`, payload).then((res) => res.data);
  },
  updatePublicCase(id: number, payload: any) {
    return api.put(`/admin/public-case/${id}`, payload).then((res) => res.data);
  },
  deletePublicCase(id: number, payload: any) {
    return api.delete(`/admin/public-case/${id}`, { data: payload }).then((res) => res.data);
  }
};
