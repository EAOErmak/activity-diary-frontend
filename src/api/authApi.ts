import api from "./http/axiosInstance";
import { AUTH_ENDPOINTS } from "./authRoutes";

import type { 
  ApiResponse
 } from "@/shared/types/api";

import type { 
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  RefreshTokenRequest
 } from "@/shared/types/auth";


// ==============================
// ✅ API METHODS (ЧИСТЫЕ DATA НА ВЫХОДЕ)
// ==============================

export const registerRequest = async (
  dto: RegisterRequest
): Promise<RegisterResponse> => {
  const r = await api.post<ApiResponse<RegisterResponse>>(
    AUTH_ENDPOINTS.register,
    dto
  );
  return r.data.data;
};

export const loginRequest = async (
  dto: LoginRequest
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.login,
    dto
  );
  return r.data.data;
};

export const refreshTokenRequest = async (
  dto: RefreshTokenRequest
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.refresh,
    dto
  );
  return r.data.data;
};


