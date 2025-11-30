import RegisterForm from "@/features/auth/components/RegisterForm";
import { registerRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";
import type { RegisterFormData } from "@/shared/types/auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const setAuthData = useAuthStore((s) => s.setAuthData);

  async function handle(data: RegisterFormData) {
    try {
      const payload = await registerRequest({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
      });

      // ✅ ПОСЛЕ РЕГИСТРАЦИИ ВСЕГДА ИДЁМ НА VERIFY-REGISTER
      setAuthData({
        accessToken: null,
        refreshToken: null,
        userId: null,                 // ✅ ОБЯЗАТЕЛЬНО null
        username: payload.username,   // ✅ ТОЛЬКО username
        role: payload.role ?? "USER",
        twoFactorRequired: true,
      });

      nav("/verify-register");

    } catch (err: any) {
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
