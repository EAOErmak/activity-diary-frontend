import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return false;
    }
  }

  return failureCount < 3;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});
