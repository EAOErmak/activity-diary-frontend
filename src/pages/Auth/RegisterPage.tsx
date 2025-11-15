// src/pages/Auth/RegisterPage.tsx
import React from "react";
import RegisterForm from "@/components/forms/RegisterForm";
import { registerRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import type { RegisterFormData } from "@/types/auth";

export default function RegisterPage() {
  const nav = useNavigate();

  async function handle(data: RegisterFormData) {
    try {
      const resp = await registerRequest(data);

      nav("/verify", {
        state: {
          email: resp.email,
          verifyLink: resp.verifyLink,
          userId: resp.userId,
        },
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка регистрации");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-2">Регистрация</h2>
        <p className="text-sm text-gray-400 mb-4">Создать новый аккаунт</p>

        <RegisterForm onSubmit={handle} />
      </div>
    </div>
  );
}
