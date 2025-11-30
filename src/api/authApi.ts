import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";


// ==============================
// TYPES
// ==============================

export type AuthRequestDto = {
  username: string;
  password: string;
};

export type RegisterRequestDto = {
  username: string;
  password: string;
  fullName: string;
};

export type VerificationRequestDto = {
  username: string;
};

export type VerificationConfirmDto = {
  username: string;
  code: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type AuthResponseDto = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string;
  userId: number;
  role: "ADMIN" | "USER";
  twoFactorRequired: boolean;
};

// ==============================
// ✅ API METHODS (ЧИСТЫЕ DATA НА ВЫХОДЕ)
// ==============================

export const loginRequest = async (
  dto: AuthRequestDto
): Promise<AuthResponseDto> => {
  const r = await api.post<ApiResponse<AuthResponseDto>>("/auth/login", dto);
  return r.data.data;
};

export const confirmLoginRequest = async (
  dto: VerificationConfirmDto
): Promise<AuthResponseDto> => {
  const r = await api.post<ApiResponse<AuthResponseDto>>("/auth/login/confirm", dto);
  return r.data.data;
};

export const confirmVerificationRequest = async (
  dto: VerificationConfirmDto
): Promise<void> => {
  const r = await api.post<ApiResponse<void>>("/auth/verification/confirm", dto);
  return r.data.data;
};

export const registerRequest = async (
  dto: RegisterRequestDto
): Promise<AuthResponseDto> => {
  const r = await api.post<ApiResponse<AuthResponseDto>>("/auth/register", dto);
  return r.data.data;
};

export const requestVerificationRequest = async (
  dto: VerificationRequestDto
): Promise<void> => {
  const r = await api.post<ApiResponse<void>>("/auth/verification/request", dto);
  return r.data.data;
};

export const refreshTokenRequest = async (
  dto: RefreshTokenRequest
): Promise<AuthResponseDto> => {
  const r = await api.post<ApiResponse<AuthResponseDto>>("/auth/refresh", dto);
  return r.data.data;
};
