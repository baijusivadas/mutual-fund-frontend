import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message || error.response?.data?.error || error.message || fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
