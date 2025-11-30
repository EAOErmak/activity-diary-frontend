import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/diary" replace />; // ❗ НЕ админ → в дневник
  }

  return <>{children}</>;
}
