import api from "./axiosInstance";

// ==============================
// TYPES ПОД ТВОИ DTO
// ==============================

export type AuthRequestDto = {
  username: string;
  password: string;
};

export type RegisterRequestDto = {
  username: string;
  password: string;
  fullName: string;
  chatId?: number;
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
  twoFactorRequired: boolean;
};

// твой ApiResponse<T>
export type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

// ==============================
// API METHODS — 1-в-1 С BACKEND
// ==============================

export const loginRequest = async (
  dto: AuthRequestDto
): Promise<ApiResponse<AuthResponseDto>> => {
  const r = await api.post("/auth/login", dto);
  return r.data;
};

export const confirmLoginRequest = async (
  dto: VerificationConfirmDto
): Promise<ApiResponse<AuthResponseDto>> => {
  const r = await api.post("/auth/login/confirm", dto);
  return r.data;
};

export const registerRequest = async (
  dto: RegisterRequestDto
): Promise<ApiResponse<AuthResponseDto>> => {
  const r = await api.post("/auth/register", dto);
  return r.data;
};

export const requestVerificationRequest = async (
  dto: VerificationRequestDto
): Promise<ApiResponse<void>> => {
  const r = await api.post("/auth/verification/request", dto);
  return r.data;
};

export const refreshTokenRequest = async (
  dto: RefreshTokenRequest
): Promise<ApiResponse<AuthResponseDto>> => {
  const r = await api.post("/auth/refresh", dto);
  return r.data;
};
