import axios from "axios";
import { getToken } from "../lib/tokenUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("🟢 Request:", config.url);
  console.log("🔸 Headers:", config.headers);
  return config;
});

export default api;
