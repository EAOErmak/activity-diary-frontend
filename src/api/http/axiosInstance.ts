import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/store/authStore";

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

// ======================================================
// REQUEST INTERCEPTOR — ACCESS TOKEN
// ======================================================

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  const isAuthRequest =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/verification") ||
    config.url?.includes("/auth/refresh");

  if (accessToken && !isAuthRequest) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ======================================================
// RESPONSE INTERCEPTOR — REFRESH LOGIC
// ======================================================

let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data: any = response.data;
    if (data && data.success === false) {
      toast.error(data.message ?? "Ошибка");
      return Promise.reject(
        new Error(data.message ?? "Ошибка")
      );
    }
    return response;
  },

  async (error: AxiosError) => {
    const message =
      (error.response?.data as any)?.message ?? error.message;
    if (message) {
      toast.error(message);
    }
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // ❌ Не обрабатываем refresh запрос
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const {
      refreshToken,
      setTokens,
      logout,
      isLoggingOut,
    } = useAuthStore.getState();

    if (isLoggingOut) {
      return Promise.reject(error);
    }

    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    // ==================================================
    // QUEUE — если refresh уже идёт
    // ==================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    // ==================================================
    // START REFRESH
    // ==================================================

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await refreshApi.post("/auth/refresh", {
        refreshToken,
      });

      const data = res.data?.data;

      const newAccess = data.accessToken;
      const newRefresh = data.refreshToken;

      setTokens(newAccess, newRefresh);

      api.defaults.headers.common.Authorization =
        `Bearer ${newAccess}`;

      processQueue(null, newAccess);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization =
        `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
