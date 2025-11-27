import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://activity-diary-backend.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// ============================
// REQUEST — подставляем ACCESS
// ============================
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ============================
// RESPONSE — refresh при 401
// ============================
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken, setTokens, logout } =
        useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          "/api/auth/refresh",
          { refreshToken },
          {
            baseURL:
              import.meta.env.VITE_API_BASE_URL ||
              "https://activity-diary-backend.onrender.com/api",
          }
        );

        const data = res.data?.data;

        const newAccess = data.accessToken;
        const newRefresh = data.refreshToken;

        setTokens(newAccess, newRefresh);

        api.defaults.headers.common.Authorization =
          "Bearer " + newAccess;

        processQueue(null, newAccess);

        originalRequest.headers.Authorization =
          "Bearer " + newAccess;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
