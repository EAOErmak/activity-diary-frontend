import RegisterForm from "@/components/forms/RegisterForm";
import { registerRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { RegisterFormData } from "@/types/auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const setAuthData = useAuthStore((s) => s.setAuthData);

  async function handle(data: RegisterFormData) {
    try {
      const res = await registerRequest({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
      });

      const payload = res.data;

      // ✅ ЕСЛИ НУЖНА TELEGRAM-ВЕРИФИКАЦИЯ
      if (payload.twoFactorRequired) {
        setAuthData({
          accessToken: null,
          refreshToken: null,
          userId: payload.userId,
          username: payload.username,
          twoFactorRequired: true,
        });

        nav("/verify");
        return;
      }

      // ✅ ЕСЛИ ВЕРИФИКАЦИЯ НЕ НУЖНА — СРАЗУ ЛОГИНИМ
      setAuthData(payload);
      nav("/diary");

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
