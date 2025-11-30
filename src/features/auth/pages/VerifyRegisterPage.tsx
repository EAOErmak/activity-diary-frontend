import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmVerificationRequest } from "@/api/authApi";
import { useAuthStore } from "@/shared/store/authStore";

const TELEGRAM_BOT_URL = "https://t.me/DiaryVerificatorBot"; // ✅ сюда вставь своего бота

export default function RegisterVerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const store = useAuthStore((s) => s);
  const username = store.username;

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

      await confirmVerificationRequest({
        username: safeUsername,
        code,
      });

      alert("✅ Аккаунт подтверждён, теперь можно войти");
      navigate("/login");

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
          Подтверждение регистрации
        </h2>

        {/* ✅ ССЫЛКА НА БОТА */}
        <a
          href={`${TELEGRAM_BOT_URL}?start=verify_${safeUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-600 hover:bg-green-700 py-2 rounded mb-4"
        >
          Открыть Telegram-бота
        </a>

        <p className="text-gray-400 text-sm mb-4 text-center">
          Введите код, который пришёл в Telegram
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
