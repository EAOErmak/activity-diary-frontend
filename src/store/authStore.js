import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAuthStore = create()(persist((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    setAuth: (token, user) => set({ token, user, isAuthenticated: !!token }),
    setToken: (token) => set((state) => ({ ...state, token, isAuthenticated: !!token })),
    setUser: (user) => set((state) => ({ ...state, user })),
    logout: () => {
        localStorage.removeItem("auth-storage");
        set({ token: null, user: null, isAuthenticated: false });
    },
}), {
    name: "auth-storage", // ключ в localStorage
}));
