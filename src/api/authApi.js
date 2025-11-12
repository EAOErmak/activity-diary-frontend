import api from "./axiosInstance";
export const loginRequest = async (dto) => {
    const r = await api.post("/auth/login", dto);
    return r.data;
};
export const registerRequest = async (dto) => {
    const r = await api.post("/auth/register", dto);
    return r.data;
};
export const verifyEmail = async (token) => {
    const r = await api.post(`/auth/verify?token=${encodeURIComponent(token)}`);
    return r.data;
};
