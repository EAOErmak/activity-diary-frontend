import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import i18n from "@/shared/i18n/config";
import { useAuthStore } from "@/shared/store/authStore";
import { isTokenExpired } from "@/shared/lib/jwt";
import type { ApiResponse } from "@/shared/types/api";
import type { AuthResponse } from "@/shared/types/auth";

export const REFRESH_BUFFER_MS = 5_000;

type RetriableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

// ======================================================
// BASE API (С interceptor'ами)
// ======================================================

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// REFRESH API (БЕЗ interceptor'ов)
// ======================================================

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

function isAuthRequest(url?: string) {
  return (
    url?.includes("/auth/login") ||
    url?.includes("/auth/register") ||
    url?.includes("/auth/verification") ||
    url?.includes("/auth/refresh")
  );
}

function applyAccessToken(
  config: AxiosRequestConfig | InternalAxiosRequestConfig,
  accessToken: string
) {
  config.headers = config.headers ?? {};

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
    return;
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
}

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

async function requestTokenRefresh() {
  const { refreshToken, setTokens, isLoggingOut } =
    useAuthStore.getState();

  if (isLoggingOut) {
    throw new Error("Logout in progress");
  }

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const response = await refreshApi.post<ApiResponse<AuthResponse>>(
    "/auth/refresh",
    { refreshToken }
  );

  const authData = response.data?.data;

  if (!authData?.accessToken || !authData?.refreshToken) {
    throw new Error("Refresh response does not contain tokens");
  }

  setTokens(authData.accessToken, authData.refreshToken);

  return authData.accessToken;
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh()
      .catch((error) => {
        const { isLoggingOut, logout } = useAuthStore.getState();

        if (!isLoggingOut) {
          logout();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function ensureValidAccessToken(
  forceRefresh = false
): Promise<string | null> {
  const {
    accessToken,
    refreshToken,
    logout,
    isLoggingOut,
  } = useAuthStore.getState();

  if (isLoggingOut) {
    return null;
  }

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (
    forceRefresh ||
    !accessToken ||
    isTokenExpired(accessToken, REFRESH_BUFFER_MS)
  ) {
    if (!refreshToken) {
      if (!isLoggingOut) {
        logout();
      }

      return null;
    }

    return refreshAccessToken();
  }

  return accessToken;
}

// ======================================================
// REQUEST INTERCEPTOR — ACCESS TOKEN
// ======================================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isAuthRequest(config.url)) {
      return config;
    }

    const accessToken = await ensureValidAccessToken();

    if (accessToken) {
      applyAccessToken(config, accessToken);
    }

    return config;
  }
);

// ======================================================
// RESPONSE INTERCEPTOR — REFRESH LOGIC
// ======================================================

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
    const originalRequest = error.config as
      | RetriableRequestConfig
      | undefined;

    // ❌ Не обрабатываем refresh запрос
    if (!originalRequest) {
      showErrorToast(error);
      return Promise.reject(error);
    }

    if (isAuthRequest(originalRequest.url)) {
      showErrorToast(error);
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      showErrorToast(error);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // QUEUE — если refresh уже идёт
    // ==================================================


    // ==================================================
    // START REFRESH
    // ==================================================

    try {
      const accessToken = await refreshAccessToken();
      applyAccessToken(originalRequest, accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      showErrorToast(refreshError);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
