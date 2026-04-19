import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import i18n from "@/shared/i18n/config";
import { isAuthEndpoint } from "@/api/authRoutes";
import { API_BASE_URL } from "@/api/http/apiConfig";
import {
  getAccessToken,
  hasRefreshToken,
  refreshAuthSession,
  refreshAuthSessionIfNeeded,
} from "@/api/http/authSession";
import { clearAuthSession } from "@/shared/store/authStore";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retryAfterRefresh?: boolean;
  skipAuthRefresh?: boolean;
};

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

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  accessToken: string
) {
  if (typeof config.headers?.set === "function") {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
    return;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${accessToken}`;
}

function showErrorToast(error: unknown) {
  const message = extractErrorMessage(error);

  if (message) {
    toast.error(message);
  }
}

api.interceptors.request.use(async (config) => {
  const requestConfig = config as RetriableRequestConfig;

  if (requestConfig.skipAuthRefresh || isAuthEndpoint(requestConfig.url)) {
    return config;
  }

  const accessToken = hasRefreshToken()
    ? await refreshAuthSessionIfNeeded()
    : getAccessToken();

  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  }

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
    const requestConfig = error.config as RetriableRequestConfig | undefined;
    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !!requestConfig &&
      !requestConfig.skipAuthRefresh &&
      !requestConfig._retryAfterRefresh &&
      !isAuthEndpoint(requestConfig.url) &&
      hasRefreshToken();

    if (shouldAttemptRefresh && requestConfig) {
      requestConfig._retryAfterRefresh = true;

      try {
        const accessToken = await refreshAuthSession();

        if (!accessToken) {
          clearAuthSession();
          return Promise.reject(error);
        }

        setAuthorizationHeader(requestConfig, accessToken);
        return api.request(requestConfig);
      } catch (refreshError) {
        showErrorToast(refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      requestConfig &&
      !isAuthEndpoint(requestConfig.url)
    ) {
      clearAuthSession();
    }

    showErrorToast(error);
    return Promise.reject(error);
  }
);

export default api;
