import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DiaryListPage from "@/pages/Diary/DiaryListPage";
import DiaryFormPage from "@/pages/Diary/DiaryFormPage";
import DiaryViewPage from "@/pages/Diary/DiaryViewPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import MainLayout from "@/components/layout/PageLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/diary"
          element={
            <MainLayout>
              <DiaryListPage />
            </MainLayout>
          }
        />
        <Route
          path="/diary/new"
          element={
            <MainLayout>
              <DiaryFormPage />
            </MainLayout>
          }
        />
        <Route
          path="/diary/:id"
          element={
            <MainLayout>
              <DiaryViewPage />
            </MainLayout>
          }
        />
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
