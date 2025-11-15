export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  email: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  fullName?: string;
};
