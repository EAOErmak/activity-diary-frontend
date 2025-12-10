export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  fullName: string;
};

export type AuthResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string;
  userId: number;
  role: "ADMIN" | "USER";
  twoFactorRequired: boolean;
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
