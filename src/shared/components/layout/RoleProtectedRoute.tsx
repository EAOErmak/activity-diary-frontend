import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

type Props = {
  allowedRoles: Array<"ADMIN" | "PREMIUM" | "USER">;
  children: React.ReactNode;
};

export default function RoleProtectedRoute({
  allowedRoles,
  children,
}: Props) {
  const { role, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
