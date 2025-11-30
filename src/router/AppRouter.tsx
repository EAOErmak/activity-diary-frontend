import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PageLayout from "@/shared/components/layout/PageLayout";
import ProtectedRoute from "@/shared/components/layout/ProtectedRoute";
import AdminProtectedRoute from "@/shared/components/layout/AdminProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import VerifyRegisterPage from "@/features/auth/pages/VerifyRegisterPage";
import VerifyLoginPage from "@/features/auth/pages/VerifyLoginPage";

import DiaryListPage from "@/features/diary/pages/DiaryListPage";
import DiaryFormPage from "@/features/diary/pages/DiaryFormPage";
import DiaryDetailsPage from "@/features/diary/pages/DiaryDetailsPage";
import DiaryEditPage from "@/features/diary/pages/DiaryEditPage";

import AdminDictionaryPage from "@/features/admin/dictionary/pages/AdminDictionaryPage";
import AdminUsersPage from "@/features/admin/users/pages/AdminUsersPage";
import AdminDashboardPage from "@/features/admin/dashboard/pages/AdminDashboardPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* ✅ Layout ВСЕГДА СНАРУЖИ */}
      <PageLayout>
        <Routes>
          {/* ✅ ПУБЛИЧНЫЕ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ✅ VERIFY */}
          <Route path="/verify-register" element={<VerifyRegisterPage />} />
          <Route path="/verify-login" element={<VerifyLoginPage />} />

          {/* ✅ ЗАЩИЩЁННЫЕ */}
          <Route
            path="/diary"
            element={
              <ProtectedRoute>
                <DiaryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diary/new"
            element={
              <ProtectedRoute>
                <DiaryFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diary/:id"
            element={
              <ProtectedRoute>
                <DiaryDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diary/:id/edit"
            element={
              <ProtectedRoute>
                <DiaryEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage/>             
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>                
                  <AdminUsersPage/>                
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/dictionary"
            element={
              <AdminProtectedRoute>               
                  <AdminDictionaryPage />
              </AdminProtectedRoute>
            }
          />

          {/* ✅ FALLBACK */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}
