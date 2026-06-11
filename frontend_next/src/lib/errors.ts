import { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof AxiosError) {
    const detail = error.response?.data;

    if (typeof detail === "string") return detail;
    if (typeof detail?.detail === "string") return detail.detail;
    if (typeof detail?.message === "string") return detail.message;

    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
