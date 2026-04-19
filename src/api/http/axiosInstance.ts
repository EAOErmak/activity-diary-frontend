import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";
import i18n from "@/shared/i18n/config";
import { session } from "@/platform";
import { isAuthEndpoint } from "@/api/authRoutes";

function buildApiBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (normalizedBaseUrl.endsWith("/api")) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}/api`;
}

const API_BASE_URL = buildApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:18080"
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)
        ?.message ?? error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t("errors.generic");
}

function showErrorToast(error: unknown) {
  const message = extractErrorMessage(error);

  if (message) {
    toast.error(message);
  }
}

api.interceptors.request.use((config) => {
  const accessToken = session.getAccessToken();

  if (!accessToken || isAuthEndpoint(config.url)) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as
      | {
          success?: boolean;
          message?: string | null;
        }
      | undefined;

    if (data?.success === false) {
      toast.error(data.message ?? i18n.t("errors.generic"));
      return Promise.reject(
        new Error(data.message ?? i18n.t("errors.generic"))
      );
    }

    return response;
  },

  async (error: AxiosError) => {
    showErrorToast(error);
    return Promise.reject(error);
  }
);

export default api;
