import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    // пользователь не авторизован — редиректим на login
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Для доступа нужно войти или зарегистрироваться" }}
        replace
      />
    );
  }

  return <>{children}</>;
}
