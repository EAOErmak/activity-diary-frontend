import { useAuthStore } from "../store/authStore";
export const useAuth = () => {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);
    const email = user?.email || null;
    return { token, user, email, isAuthenticated, setAuth, logout };
};
