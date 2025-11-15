import axios from "axios";
import { useAuthStore } from "../store/authStore";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ||
        "https://activity-diary-backend.onrender.com/api",
    headers: { "Content-Type": "application/json" },
});
// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Если 401 → logout
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        useAuthStore.getState().logout();
    }
    return Promise.reject(error);
});
export default api;
