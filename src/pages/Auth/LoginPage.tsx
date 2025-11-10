import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import { loginRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const nav = useNavigate();

  async function handle(data: { email: string; password: string }) {
    try {
      const res = await loginRequest(data);
      setToken(res.token);
      nav("/diary");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка логина");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-2">Вход</h2>
        <p className="text-sm text-gray-400 mb-4">Войдите в свой аккаунт</p>
        <LoginForm onSubmit={handle} />
      </div>
    </div>
  );
}
