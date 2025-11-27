import LoginForm from "@/components/forms/LoginForm";
import { loginRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((s) => s.setAuthData);

  async function handle(data: { username: string; password: string }) {
    try {
      const res = await loginRequest({
        username: data.username,
        password: data.password,
      });

      const payload = res.data;

      // ✅ ЕСЛИ ТРЕБУЕТСЯ TELEGRAM-ПОДТВЕРЖДЕНИЕ
      if (payload.twoFactorRequired) {
        setAuthData({
          accessToken: null,
          refreshToken: null,
          userId: null,
          username: payload.username,
          twoFactorRequired: true,
        });

        navigate("/verify");
        return;
      }

      // ✅ ЕСЛИ 2FA НЕ НУЖНА — СРАЗУ ЛОГИНИМ
      setAuthData(payload);
      navigate("/diary");

    } catch (err: any) {
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
