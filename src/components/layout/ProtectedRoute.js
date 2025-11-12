import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
export default function ProtectedRoute({ children }) {
    const { token } = useAuthStore();
    const location = useLocation();
    if (!token) {
        // пользователь не авторизован — редиректим на login
        return (_jsx(Navigate, { to: "/login", state: { from: location, message: "Для доступа нужно войти или зарегистрироваться" }, replace: true }));
    }
    return _jsx(_Fragment, { children: children });
}
