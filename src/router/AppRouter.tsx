import {
  Navigate,
  Route,
  Routes,
  type Location,
  useLocation,
} from "react-router-dom";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import UserLayout from "@/shared/components/layout/UserLayout";
import ProtectedRoute from "@/shared/components/layout/ProtectedRoute";
import AdminProtectedRoute from "@/shared/components/layout/AdminProtectedRoute";

import DiaryListPage from "@/features/diary/pages/DiaryListPage/DiaryListPage";
import DashboardPageV3 from "@/features/dashboard/pages/DashboardPageV3";
import NotFoundPage from "@/pages/NotFoundPage";

import AdminDictionaryPage from "@/features/admin/dictionary/pages/AdminDictionaryShadcnPage";
import AdminTagsPage from "@/features/admin/tags/pages/AdminTagsShadcnPage";
import AdminMetricLinksPage from "@/features/admin/entry-config/pages/AdminMetricLinksShadcnPage";
import AdminGeneralFoodsPage from "@/features/admin/food/pages/AdminGeneralFoodsShadcnPage";
import AdminLayout from "@/features/admin/layout/AdminPanelLayout";

import { DiaryDetailsDialog } from "@/features/diary/pages/DiaryListPage/components/DiaryDetailsDialog";
import RouteScrollManager from "@/shared/components/layout/RouteScrollManager";

export default function AppRouter() {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;
  const routingLocation = state?.background || location;

  return (
    <>
      <RouteScrollManager location={routingLocation} />

      <Routes location={routingLocation}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/diary" replace />} />
          <Route path="/diary" element={<DiaryListPage />} />
          <Route path="/analytics" element={<DashboardPageV3 />} />
          <Route path="/dashboard" element={<DashboardPageV3 />} />
          <Route path="/calendar" element={<Navigate to="/diary" replace />} />
          <Route path="/entry-templates" element={<Navigate to="/diary" replace />} />
          <Route path="/food" element={<Navigate to="/diary" replace />} />
          <Route path="/goals" element={<Navigate to="/diary" replace />} />
          <Route path="/settings" element={<Navigate to="/diary" replace />} />
          <Route path="/profile" element={<Navigate to="/diary" replace />} />
          <Route path="/profile/edit" element={<Navigate to="/diary" replace />} />
          <Route path="/diary/new" element={<Navigate to="/diary" replace />} />
          <Route path="/diary/:id/edit" element={<Navigate to="/diary" replace />} />
        </Route>

        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dictionary" replace />} />
          <Route path="/admin/tags" element={<AdminTagsPage />} />
          <Route path="/admin/dictionary" element={<AdminDictionaryPage />} />
          <Route path="/admin/metric-links" element={<AdminMetricLinksPage />} />
          <Route path="/admin/foods" element={<AdminGeneralFoodsPage />} />
          <Route path="/admin/users" element={<Navigate to="/admin/dictionary" replace />} />
          <Route path="/admin/users/create" element={<Navigate to="/admin/dictionary" replace />} />
          <Route path="/admin/database" element={<Navigate to="/admin/dictionary" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {state?.background && (
        <Routes>
          <Route path="/diary/:id" element={<DiaryDetailsDialog />} />
        </Routes>
      )}
    </>
  );
}
