// src/pages/Auth/VerifyPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmLoginRequest } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const store = useAuthStore((s) => s);
  const { setAuthData } = store;
  const username = store.username;

  // ✅ ЕСЛИ СЮДА ЗАШЛИ БЕЗ ЛОГИНА
  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Ошибка: отсутствует username</p>
      </div>
    );
  }

  const safeUsername = username as string;

  async function handleConfirm() {
    if (code.length !== 6) {
      alert("Введите 6-значный код");
      return;
    }

    try {
      setLoading(true);

    const res = await confirmLoginRequest({
      username: safeUsername,
      code,
    });

      // ✅ СОХРАНЯЕМ JWT
      setAuthData(res.data);

      // ✅ ПЕРЕХОД В ПРИЛОЖЕНИЕ
      navigate("/diary");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Ошибка подтверждения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">
          Подтверждение входа
        </h2>

        <p className="text-gray-300 mb-4">
          Подтвердите вход в Telegram через команду:
        </p>

        <code className="block bg-black text-green-400 p-2 rounded mb-4 text-center">
          /verify {username}
        </code>

        <p className="text-gray-400 text-sm mb-4">
          После этого введите 6-значный код сюда:
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          placeholder="123456"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-4 text-center tracking-widest"
        />

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Проверка..." : "Подтвердить"}
        </button>
      </div>
    </div>
  );
}
