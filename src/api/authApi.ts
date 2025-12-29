import api from "./http/axiosInstance";

import type { 
  ApiResponse
 } from "@/shared/types/api";

import type { 
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerificationRequest,
  VerificationConfirm,
  RefreshTokenRequest
 } from "@/shared/types/auth";


// ==============================
// ✅ API METHODS (ЧИСТЫЕ DATA НА ВЫХОДЕ)
// ==============================

export const registerRequest = async (
  dto: RegisterRequest
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>("/auth/register", dto);
  return r.data.data;
};

export const loginRequest = async (
  dto: LoginRequest
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>("/auth/login", dto);
  return r.data.data;
};

export const refreshTokenRequest = async (
  dto: RefreshTokenRequest
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>("/auth/refresh", dto);
  return r.data.data;
};

/*
export const confirmLoginRequest = async (
  dto: VerificationConfirm
): Promise<AuthResponse> => {
  const r = await api.post<ApiResponse<AuthResponse>>("/auth/login/confirm", dto);
  return r.data.data;
};

export const confirmVerificationRequest = async (
  dto: VerificationConfirm
): Promise<void> => {
  const r = await api.post<ApiResponse<void>>("/auth/verification/confirm", dto);
  return r.data.data;
};

export const requestVerificationRequest = async (
  dto: VerificationRequest
): Promise<void> => {
  const r = await api.post<ApiResponse<void>>("/auth/verification/request", dto);
  return r.data.data;
};
*/


