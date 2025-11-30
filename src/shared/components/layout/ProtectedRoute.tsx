import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
