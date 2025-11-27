// ✅ Под новый backend (username + jwt + refresh + telegram 2FA)

// ==============================
// Requests
// ==============================

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  fullName: string;
};

// ==============================
// Responses
// ==============================

export type AuthResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string;
  userId: number;
  twoFactorRequired: boolean;
};

// ==============================
// Forms
// ==============================

export type RegisterFormData = {
  username: string;
  password: string;
  fullName: string;
};

export type LoginFormData = {
  username: string;
  password: string;
};
