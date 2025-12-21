import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "@/shared/components/layout/UserLayout";
import ProtectedRoute from "@/shared/components/layout/ProtectedRoute";
import AdminProtectedRoute from "@/shared/components/layout/AdminProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import VerifyRegisterPage from "@/features/auth/pages/VerifyRegisterPage";
import VerifyLoginPage from "@/features/auth/pages/VerifyLoginPage";

import DiaryListPage from "@/features/diary/pages/DiaryListPage/DiaryListPage";
import DiaryFormPage from "@/features/diary/pages/DiaryFormPage";
import DiaryDetailsPage from "@/features/diary/pages/DiaryDetailsPage";
import DiaryEditPage from "@/features/diary/pages/DiaryEditPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

// ✅ НОВОЕ
import CalendarPage from "@/features/calendar/pages/CalendarPage";

import AdminDictionaryPage from "@/features/admin/dictionary/pages/AdminDictionaryPage";
import AdminUsersPage from "@/features/admin/users/pages/AdminUsersPage";
import AdminDashboardPage from "@/features/admin/dashboard/pages/AdminDashboardPage";
import AdminEntryConfigPage from "@/features/admin/entry-config/pages/AdminEntryConfigPage";
import AdminLayout from "@/features/admin/layout/AdminLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-register" element={<VerifyRegisterPage />} />
        <Route path="/verify-login" element={<VerifyLoginPage />} />

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
          <Route path="/diary/:id" element={<DiaryDetailsPage />} />
          <Route path="/diary/:id/edit" element={<DiaryEditPage />} />

          <Route path="/calendar" element={<CalendarPage />} /> {/* ✅ */}

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* ADMIN */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/dictionary" element={<AdminDictionaryPage />} />
          <Route path="/admin/entry-config" element={<AdminEntryConfigPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
