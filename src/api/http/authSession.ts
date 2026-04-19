import axios from "axios";

import { AUTH_ENDPOINTS } from "@/api/authRoutes";
import { API_BASE_URL } from "@/api/http/apiConfig";
import { isTokenExpired } from "@/shared/lib/jwt";
import { clearAuthSession, useAuthStore } from "@/shared/store/authStore";
import type { ApiResponse } from "@/shared/types/api";
import type { AuthResponse } from "@/shared/types/auth";

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_REFRESH_SKEW_MS = 5_000;

let refreshRequestPromise: Promise<string | null> | null = null;

function getAuthState() {
  return useAuthStore.getState();
}

function applyAuthResponse(payload: AuthResponse) {
  const currentState = getAuthState();

  currentState.setAuthData({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? currentState.refreshToken,
    userId: payload.userId ?? currentState.userId,
    username: payload.username ?? currentState.username,
    role: payload.role ?? currentState.role,
    twoFactorRequired: false,
  });
}

async function requestTokenRefresh(
  refreshToken: string
): Promise<string | null> {
  const response = await refreshClient.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.refresh,
    {
      refreshToken,
    }
  );

  if (response.data.success === false || !response.data.data) {
    throw new Error(response.data.message ?? "Failed to refresh session.");
  }

  if (!response.data.data.accessToken) {
    throw new Error("Refresh endpoint did not return an access token.");
  }

  applyAuthResponse(response.data.data);

  return getAccessToken();
}

export function getAccessToken() {
  return getAuthState().accessToken;
}

export function getRefreshToken() {
  return getAuthState().refreshToken;
}

export function hasRefreshToken() {
  return !!getRefreshToken();
}

export function shouldRefreshAccessToken() {
  const { accessToken, refreshToken } = getAuthState();

  return (
    !!refreshToken &&
    (!accessToken || isTokenExpired(accessToken, ACCESS_TOKEN_REFRESH_SKEW_MS))
  );
}

export async function refreshAuthSession(): Promise<string | null> {
  if (refreshRequestPromise) {
    return refreshRequestPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    return null;
  }

  refreshRequestPromise = requestTokenRefresh(refreshToken)
    .catch((error) => {
      clearAuthSession();
      throw error;
    })
    .finally(() => {
      refreshRequestPromise = null;
    });

  return refreshRequestPromise;
}

export async function refreshAuthSessionIfNeeded(): Promise<string | null> {
  if (!shouldRefreshAccessToken()) {
    return getAccessToken();
  }

  return refreshAuthSession();
}

export async function refreshAuthSessionOnStartup(): Promise<string | null> {
  if (!hasRefreshToken()) {
    return getAccessToken();
  }

  return refreshAuthSession();
}
