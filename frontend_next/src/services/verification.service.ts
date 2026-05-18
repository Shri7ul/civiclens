import { api } from "./api";

export const verificationService = {
  verifyOtp(payload: { user_id: number; otp_code: string }) {
    return api.post("/verify-otp", payload).then((res) => res.data);
  },
  verifyNid(payload: { user_id: number; nid: string; dob: string; address?: string }) {
    return api.post("/verify-nid", payload).then((res) => res.data);
  },
  uploadNidImage(formData: FormData) {
    return api.post("/upload-nid-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data);
  },
  getStatus(userId: number) {
    return api.get(`/verification-status/${userId}`).then((res) => res.data);
  },
};
