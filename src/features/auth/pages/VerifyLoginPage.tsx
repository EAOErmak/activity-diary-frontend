import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { confirmLoginRequest } from "@/api/authApi";
import { useAuthStore } from "@/shared/store/authStore";

export default function VerifyLoginPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const setAuthData = useAuthStore((s) => s.setAuthData);

  const username = state?.username;
  const [code, setCode] = useState("");

  if (!username) {
    return (
      <div className="min-h-screen grid place-items-center text-red-400">
        Ошибка: отсутствует username для подтверждения входа
      </div>
    );
  }

  async function handleConfirm() {
    try {
      const payload = await confirmLoginRequest({
        username,
        code,
      });

      // ✅ УСПЕШНО ПОДТВЕРДИЛИ ВХОД
    setAuthData({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        userId: payload.userId,
        username: payload.username,
        role: payload.role ?? "USER",
        twoFactorRequired: false,
    });
      navigate("/diary");

    } catch (err: any) {
      alert(err?.response?.data?.message || "Неверный код");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="bg-slate-900 p-6 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-2">Подтверждение входа</h2>

        <p className="text-gray-400 mb-4">
          Введите 6-значный код, отправленный вам в Telegram
        </p>

        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          maxLength={6}
          className="mb-4 text-center tracking-widest"
        />

        <Button onClick={handleConfirm} className="w-full">
          Подтвердить вход
        </Button>
      </div>
    </div>
  );
}
