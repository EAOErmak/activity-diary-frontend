import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const REFRESH_ENDPOINT = "/auth/refresh";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Один активный refresh
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await api.post(REFRESH_ENDPOINT);
    const newToken = response.data.token;
    console.log("🔁 Refreshed token:", newToken);
    useAuthStore.getState().setAuth(newToken, useAuthStore.getState().user);
    return newToken;
  } catch (error) {
    useAuthStore.getState().logout();
    throw error;
  }
};

// ✅ Добавляем токен перед каждым запросом
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("🟢 Sending request to:", config.url);
  console.log("🔸 With headers:", config.headers);
  return config;
});

// ✅ Обработка 401
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (!originalRequest || originalRequest.url === REFRESH_ENDPOINT)
      return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) refreshPromise = refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        refreshPromise = null;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
