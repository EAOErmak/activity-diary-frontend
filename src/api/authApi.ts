import api from "./axiosInstance";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; email: string };

export const loginRequest = async (dto: LoginRequest): Promise<LoginResponse> => {
  const r = await api.post("/auth/login", dto);
  return r.data;
};

export type RegisterRequest = { email: string; password: string; name?: string };
export const registerRequest = async (dto: {
    email: string;
    password: string;
    name?: string;
}) => {
    const r = await api.post("/auth/register", dto);
    return r.data as {
        email: string;
        userId: number;
        verifyLink: string;
    };
};

