import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DiaryListPage from "@/pages/Diary/DiaryListPage";
import DiaryFormPage from "@/pages/Diary/DiaryFormPage";
import DiaryDetailsPage from "@/pages/Diary/DiaryDetailsPage";
import DiaryEditPage from "@/pages/Diary/DiaryEditPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import MainLayout from "@/components/layout/PageLayout";
export default function AppRouter() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MainLayout, { children: _jsx(HomePage, {}) }) }), _jsx(Route, { path: "/diary", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DiaryListPage, {}) }) }) }), _jsx(Route, { path: "/diary/new", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DiaryFormPage, {}) }) }) }), _jsx(Route, { path: "/diary/:id", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DiaryDetailsPage, {}) }) }) }), _jsx(Route, { path: "/diary/:id/edit", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DiaryEditPage, {}) }) }) }), _jsx(Route, { path: "/diary/edit/:id", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DiaryEditPage, {}) }) }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DashboardPage, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
