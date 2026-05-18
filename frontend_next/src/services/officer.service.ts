import { api } from "./api";

export const officerService = {
  byUser(userId: number) {
    return api.get(`/officer-by-user/${userId}`).then((res) => res.data);
  },
};
