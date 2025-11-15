import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DiaryListPage from "@/pages/Diary/DiaryListPage";
import DiaryFormPage from "@/pages/Diary/DiaryFormPage";
import DiaryViewPage from "@/pages/Diary/DiaryViewPage";
import DiaryDetailsPage from "@/pages/Diary/DiaryDetailsPage";
import DiaryEditPage from "@/pages/Diary/DiaryEditPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import MainLayout from "@/components/layout/PageLayout";
import VerifyPage from "@/pages/Auth/VerifyPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Главная */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        {/* --- Защищённые маршруты дневника --- */}
        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VerifyPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DiaryListPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DiaryFormPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DiaryDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DiaryEditPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/edit/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DiaryEditPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* --- Остальные страницы --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
