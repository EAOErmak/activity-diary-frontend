import axios from "axios";

import { AUTH_ENDPOINTS } from "@/api/authRoutes";
import { API_BASE_URL } from "@/api/http/apiConfig";
import { debugAuthFlow } from "@/api/http/authDebug";
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
const AUTH_REFRESH_LOCK_KEY = "auth-storage:refresh-lock";
const AUTH_REFRESH_LOCK_TTL_MS = 10_000;
const AUTH_REFRESH_WAIT_TIMEOUT_MS = 12_000;
const AUTH_REFRESH_WAIT_POLL_MS = 150;

let refreshRequestPromise: Promise<string | null> | null = null;
const refreshLockOwnerId = Math.random().toString(36).slice(2);

type RefreshLockPayload = {
  ownerId: string;
  refreshToken: string;
  startedAt: number;
};

function getAuthState() {
  return useAuthStore.getState();
}

function applyAuthResponse(
  payload: AuthResponse,
  refreshTokenUsed: string
): boolean {
  const currentState = getAuthState();

  if (currentState.refreshToken !== refreshTokenUsed) {
    debugAuthFlow("refresh:stale-result-ignored", {
      reason: "refresh-token-changed",
    });
    return false;
  }

  currentState.setAuthData({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? currentState.refreshToken,
    userId: payload.userId ?? currentState.userId,
    username: payload.username ?? currentState.username,
    role: payload.role ?? currentState.role,
    twoFactorRequired: false,
  });

  return true;
}

function getAccessTokenRefreshReason():
  | "missing-access-token"
  | "expired-access-token"
  | null {
  const { accessToken, refreshToken } = getAuthState();

  if (!refreshToken) {
    return null;
  }

  if (!accessToken) {
    return "missing-access-token";
  }

  return isTokenExpired(accessToken, ACCESS_TOKEN_REFRESH_SKEW_MS)
    ? "expired-access-token"
    : null;
}

function shouldClearExpiredAccessTokenWithoutRefreshToken() {
  const { accessToken, refreshToken } = getAuthState();

  return (
    !!accessToken &&
    !refreshToken &&
    isTokenExpired(accessToken, ACCESS_TOKEN_REFRESH_SKEW_MS)
  );
}

function canUseLocalStorage() {
  return typeof window !== "undefined";
}

function readRefreshLock(): RefreshLockPayload | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<RefreshLockPayload>;

    if (
      typeof parsedValue.ownerId !== "string" ||
      typeof parsedValue.refreshToken !== "string" ||
      typeof parsedValue.startedAt !== "number"
    ) {
      return null;
    }

    return {
      ownerId: parsedValue.ownerId,
      refreshToken: parsedValue.refreshToken,
      startedAt: parsedValue.startedAt,
    };
  } catch {
    return null;
  }
}

function clearRefreshLock() {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_REFRESH_LOCK_KEY);
  } catch {
    return;
  }
}

function isActiveRefreshLock(lock: RefreshLockPayload | null) {
  return !!lock && Date.now() - lock.startedAt < AUTH_REFRESH_LOCK_TTL_MS;
}

function releaseRefreshLockIfOwned() {
  const lock = readRefreshLock();

  if (!lock || lock.ownerId !== refreshLockOwnerId) {
    return;
  }

  clearRefreshLock();
}

function tryAcquireRefreshLock(refreshToken: string) {
  if (!canUseLocalStorage()) {
    return true;
  }

  const currentLock = readRefreshLock();

  if (
    currentLock &&
    isActiveRefreshLock(currentLock) &&
    currentLock.ownerId !== refreshLockOwnerId
  ) {
    return false;
  }

  if (currentLock && !isActiveRefreshLock(currentLock)) {
    clearRefreshLock();
  }

  try {
    window.localStorage.setItem(
      AUTH_REFRESH_LOCK_KEY,
      JSON.stringify({
        ownerId: refreshLockOwnerId,
        refreshToken,
        startedAt: Date.now(),
      } satisfies RefreshLockPayload)
    );
  } catch {
    return true;
  }

  return readRefreshLock()?.ownerId === refreshLockOwnerId;
}

function isAnotherTabRefreshing() {
  const currentLock = readRefreshLock();

  return (
    !!currentLock &&
    isActiveRefreshLock(currentLock) &&
    currentLock.ownerId !== refreshLockOwnerId
  );
}

async function waitForExternalRefresh(refreshToken: string) {
  if (!canUseLocalStorage()) {
    return null;
  }

  const waitStartedAt = Date.now();

  while (Date.now() - waitStartedAt < AUTH_REFRESH_WAIT_TIMEOUT_MS) {
    if (!isAnotherTabRefreshing()) {
      await useAuthStore.persist.rehydrate();

      if (
        getRefreshToken() !== refreshToken ||
        !shouldRefreshAccessToken()
      ) {
        return getAccessToken();
      }

      return null;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, AUTH_REFRESH_WAIT_POLL_MS);
    });
  }

  return null;
}

async function requestTokenRefreshWithLock(
  refreshToken: string
): Promise<string | null> {
  while (true) {
    if (tryAcquireRefreshLock(refreshToken)) {
      debugAuthFlow("refresh:start");

      try {
        return await requestTokenRefresh(refreshToken);
      } finally {
        releaseRefreshLockIfOwned();
      }
    }

    debugAuthFlow("refresh:wait-for-external");
    const externalAccessToken = await waitForExternalRefresh(refreshToken);

    if (
      externalAccessToken !== null ||
      getRefreshToken() !== refreshToken ||
      !shouldRefreshAccessToken()
    ) {
      return externalAccessToken ?? getAccessToken();
    }
  }
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

  const didApplyAuthResponse = applyAuthResponse(
    response.data.data,
    refreshToken
  );

  if (didApplyAuthResponse) {
    debugAuthFlow("refresh:success");
  }

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
  return getAccessTokenRefreshReason() !== null;
}

export function isAuthRefreshInFlight() {
  return refreshRequestPromise !== null;
}

export async function resolveAccessTokenForRequest(): Promise<{
  accessToken: string | null;
  refreshed: boolean;
}> {
  const refreshReason = getAccessTokenRefreshReason();

  if (!refreshReason) {
    if (shouldClearExpiredAccessTokenWithoutRefreshToken()) {
      debugAuthFlow("session:cleared-expired-access-token", {
        reason: "missing-refresh-token",
      });
      clearAuthSession();
      return {
        accessToken: null,
        refreshed: false,
      };
    }

    return {
      accessToken: getAccessToken(),
      refreshed: false,
    };
  }

  const accessToken = await refreshAuthSession();

  return {
    accessToken,
    refreshed: true,
  };
}

export async function refreshAuthSession(): Promise<string | null> {
  if (refreshRequestPromise) {
    debugAuthFlow("refresh:reuse-inflight");
    return refreshRequestPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    return null;
  }

  refreshRequestPromise = requestTokenRefreshWithLock(refreshToken)
    .catch((error) => {
      debugAuthFlow("refresh:failure");

      if (getRefreshToken() === refreshToken) {
        clearAuthSession();
      }

      throw error;
    })
    .finally(() => {
      refreshRequestPromise = null;
    });

  return refreshRequestPromise;
}

export async function refreshAuthSessionIfNeeded(): Promise<string | null> {
  const { accessToken } = await resolveAccessTokenForRequest();
  return accessToken;
}

export async function refreshAuthSessionOnStartup(): Promise<string | null> {
  if (shouldClearExpiredAccessTokenWithoutRefreshToken()) {
    debugAuthFlow("startup:cleared-expired-access-token", {
      reason: "missing-refresh-token",
    });
    clearAuthSession();
    return null;
  }

  if (!shouldRefreshAccessToken()) {
    return getAccessToken();
  }

  return refreshAuthSession();
}
