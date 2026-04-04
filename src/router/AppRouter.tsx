import { Routes, Route, useLocation } from "react-router-dom";

import UserLayout from "@/shared/components/layout/UserLayout";
import ProtectedRoute from "@/shared/components/layout/ProtectedRoute";
import AdminProtectedRoute from "@/shared/components/layout/AdminProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import DiaryListPage from "@/features/diary/pages/DiaryListPage/DiaryListPage";
import DiaryFormPage from "@/features/diary/pages/DiaryFormPage";
import DiaryDetailsPage from "@/features/diary/pages/DiaryDetailsPage";
import DiaryEditPage from "@/features/diary/pages/DiaryEditPage";
import EntryTemplatesPage from "@/features/entry-templates/pages/EntryTemplatesPage";
import GoalsPage from "@/features/goals/pages/GoalsPage";

import DashboardPageV3 from "@/features/dashboard/pages/DashboardPageV3";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import CalendarPage from "@/features/calendar/pages/CalendarPage";

import AdminDictionaryPage from "@/features/admin/dictionary/pages/AdminDictionaryShadcnPage";
import AdminUsersPage from "@/features/admin/users/pages/AdminUsersShadcnPage";
import AdminTagsPage from "@/features/admin/tags/pages/AdminTagsShadcnPage";
import AdminOverviewPage from "@/features/admin/dashboard/pages/AdminOverviewShadcnPage";
import AdminMetricLinksPage from "@/features/admin/entry-config/pages/AdminMetricLinksShadcnPage";
import AdminLayout from "@/features/admin/layout/AdminPanelLayout";

// 🆕 MODAL
import { DiaryDetailsDialog } from "@/features/diary/pages/DiaryListPage/components/DiaryDetailsDialog";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import ProfileEditPage from "@/features/profile/pages/ProfileEditPage";
import AdminUserCreatePage from "@/features/admin/users/pages/AdminUserCreateShadcnPage";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";

export default function AppRouter() {
  const location = useLocation();
  const state = location.state as { background?: Location };

  return (
    <>
      {/* ================= ОСНОВНЫЕ РОУТЫ ================= */}
      <Routes location={state?.background || location}>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/*<Route path="/verify-register" element={<VerifyRegisterPage />} />*/}
        {/*<Route path="/verify-login" element={<VerifyLoginPage />} />*/}

        {/* USER */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/diary" element={<DiaryListPage />} />
          <Route path="/diary/new" element={<DiaryFormPage />} />
          <Route path="/entry-templates" element={<EntryTemplatesPage />} />
          <Route path="/goals" element={<GoalsPage />} />

          {/* ❗ ОСТАЁТСЯ как обычная страница (deep link) 
          <Route path="/diary/:id" element={<DiaryDetailsPage />} />*/}

          {/* временно оставляем */}
          <Route path="/diary/:id/edit" element={<DiaryEditPage />} />

          <Route path="/calendar" element={<CalendarPage />} />
         <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "PREMIUM"]}>
              <DashboardPageV3 />
            </RoleProtectedRoute>
          }
        />

          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>

        {/* ADMIN */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tags" element={<AdminTagsPage />} />
          <Route path="/admin/users/create" element={<AdminUserCreatePage />} />
          <Route path="/admin/dictionary" element={<AdminDictionaryPage />} />
          <Route path="/admin/metric-links" element={<AdminMetricLinksPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* ================= MODAL ROUTES ================= */}
      {state?.background && (
        <Routes>
          <Route
            path="/diary/:id"
            element={<DiaryDetailsDialog />}
          />
        </Routes>
      )}
    </>
  );
}
