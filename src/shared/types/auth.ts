export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
  fullName: string;
};

export type RegisterResponse = {
  message: string;
};

export type AuthResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string;
  userId: number;
  role: "ADMIN" | "USER" | "PREMIUM";
  twoFactorRequired?: boolean | null;
};

export type VerificationRequest = {
  username: string;
};

export type VerificationConfirm = {
  username: string;
  code: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};
