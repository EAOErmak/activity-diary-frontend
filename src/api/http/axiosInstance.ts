import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import i18n from "@/shared/i18n/config";
import { isAuthEndpoint } from "@/api/authRoutes";
import { debugAuthFlow } from "@/api/http/authDebug";
import { API_BASE_URL } from "@/api/http/apiConfig";
import {
  getAccessToken,
  hasRefreshToken,
  isAuthRefreshInFlight,
  refreshAuthSession,
  resolveAccessTokenForRequest,
} from "@/api/http/authSession";
import { clearAuthSession } from "@/shared/store/authStore";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retryAfterRefresh?: boolean;
  skipAuthRefresh?: boolean;
  _authAccessToken?: string | null;
  _authTokenWasRefreshed?: boolean;
};

const MAX_TRACKED_REFRESH_ATTEMPTS = 10;
const RECENT_REFRESH_ATTEMPT_WINDOW_MS = 30_000;
const refreshAttemptedAccessTokens: Array<{
  accessToken: string;
  attemptedAt: number;
}> = [];

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

function clearAuthorizationHeader(config: InternalAxiosRequestConfig) {
  if (typeof config.headers?.delete === "function") {
    config.headers.delete("Authorization");
    return;
  }

  if (!config.headers) {
    return;
  }

  delete config.headers.Authorization;
  delete config.headers.authorization;
}

function getAuthorizationHeader(
  config: InternalAxiosRequestConfig | undefined
): string | null {
  if (!config?.headers) {
    return null;
  }

  if (typeof config.headers.get === "function") {
    const headerValue = config.headers.get("Authorization");
    return typeof headerValue === "string" ? headerValue : null;
  }

  const headerValue = config.headers.Authorization ?? config.headers.authorization;

  return typeof headerValue === "string" ? headerValue : null;
}

function getRequestAccessToken(
  config: RetriableRequestConfig | undefined
): string | null {
  if (!config) {
    return null;
  }

  if (config._authAccessToken !== undefined) {
    return config._authAccessToken;
  }

  const authorizationHeader = getAuthorizationHeader(config);

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
}

function pruneRefreshAttempts() {
  const cutoff = Date.now() - RECENT_REFRESH_ATTEMPT_WINDOW_MS;

  for (let index = refreshAttemptedAccessTokens.length - 1; index >= 0; index -= 1) {
    if (refreshAttemptedAccessTokens[index].attemptedAt < cutoff) {
      refreshAttemptedAccessTokens.splice(index, 1);
    }
  }
}

function rememberRefreshAttempt(accessToken: string | null) {
  if (!accessToken) {
    return;
  }

  pruneRefreshAttempts();

  const existingIndex = refreshAttemptedAccessTokens.findIndex(
    (entry) => entry.accessToken === accessToken
  );
  if (existingIndex >= 0) {
    refreshAttemptedAccessTokens.splice(existingIndex, 1);
  }

  refreshAttemptedAccessTokens.push({
    accessToken,
    attemptedAt: Date.now(),
  });

  if (refreshAttemptedAccessTokens.length > MAX_TRACKED_REFRESH_ATTEMPTS) {
    refreshAttemptedAccessTokens.shift();
  }
}

function hasRefreshAttemptForAccessToken(accessToken: string | null) {
  if (!accessToken) {
    return false;
  }

  pruneRefreshAttempts();

  return refreshAttemptedAccessTokens.some(
    (entry) => entry.accessToken === accessToken
  );
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

  const { accessToken, refreshed } = await resolveAccessTokenForRequest();

  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  } else {
    clearAuthorizationHeader(config);
  }

  requestConfig._authAccessToken = accessToken ?? null;
  requestConfig._authTokenWasRefreshed =
    requestConfig._authTokenWasRefreshed === true ||
    requestConfig._retryAfterRefresh === true ||
    refreshed;

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
    const requestAccessToken = getRequestAccessToken(requestConfig);
    const currentAccessToken = getAccessToken();
    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !!requestConfig &&
      !requestConfig.skipAuthRefresh &&
      !requestConfig._retryAfterRefresh &&
      !isAuthEndpoint(requestConfig.url) &&
      hasRefreshToken();

    if (shouldAttemptRefresh && requestConfig) {
      if (
        currentAccessToken &&
        requestAccessToken !== currentAccessToken &&
        hasRefreshAttemptForAccessToken(requestAccessToken)
      ) {
        debugAuthFlow("refresh:retry-with-latest-token", {
          url: requestConfig.url,
        });
        requestConfig._retryAfterRefresh = true;
        requestConfig._authAccessToken = currentAccessToken;
        requestConfig._authTokenWasRefreshed = true;
        setAuthorizationHeader(requestConfig, currentAccessToken);
        return api.request(requestConfig);
      }

      if (
        requestConfig._authTokenWasRefreshed ||
        (hasRefreshAttemptForAccessToken(requestAccessToken) &&
          !isAuthRefreshInFlight())
      ) {
        debugAuthFlow("refresh:skip", {
          reason: requestConfig._authTokenWasRefreshed
            ? "request-already-used-refreshed-token"
            : "token-already-triggered-refresh",
          url: requestConfig.url,
        });
      } else {
        if (!isAuthRefreshInFlight()) {
          rememberRefreshAttempt(requestAccessToken);
        }

        debugAuthFlow("refresh:triggered-by-401", {
          url: requestConfig.url,
        });
        requestConfig._retryAfterRefresh = true;

        try {
          const accessToken = await refreshAuthSession();

          if (!accessToken) {
            clearAuthSession();
            return Promise.reject(error);
          }

          requestConfig._authAccessToken = accessToken;
          requestConfig._authTokenWasRefreshed = true;
          setAuthorizationHeader(requestConfig, accessToken);
          return api.request(requestConfig);
        } catch (refreshError) {
          showErrorToast(refreshError);
          return Promise.reject(refreshError);
        }
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
