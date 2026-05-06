import { Navigate, Outlet } from "react-router-dom";

import { isDesktopApp } from "@/platform";

type WebOnlyRouteProps = {
  redirectTo?: string;
};

export default function WebOnlyRoute({
  redirectTo = "/diary",
}: WebOnlyRouteProps) {
  if (isDesktopApp) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
