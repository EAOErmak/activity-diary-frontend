import { useState } from "react";
import { useAuthStore } from "@/shared/store/authStore";

export default function HomePage() {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "ADMIN";

  const [openAdmin, setOpenAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
      <div className="w-full max-w-4xl text-center space-y-10">

        {/* ✅ ЗАГОЛОВОК */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Activity Diary
          </h1>

          <p className="text-slate-400 mb-5">
            Your personal activity tracker — dashboard is coming.
          </p>

          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            onClick={() => window.location.href = "/diary"}
          >
            Open Diary
          </button>
        </div>

        {/* ✅ КНОПКА ОТКРЫТИЯ АДМИНКИ */}
        {isAdmin && (
          <div>
            <button
              onClick={() => setOpenAdmin(!openAdmin)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white font-semibold"
            >
              {openAdmin ? "Close Admin Panel" : "Open Admin Panel"}
            </button>
          </div>
        )}

        {/* ✅ ВЫПАДАЮЩАЯ АДМИН-ПАНЕЛЬ */}
        {isAdmin && openAdmin && (
          <div className="mx-auto max-w-2xl bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-700 space-y-4">

            <h2 className="text-xl text-left font-bold text-white mb-4">
              Админ-панель
            </h2>

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
              onClick={() => window.location.href = "/admin"}
            >
              📊 Dashboard
            </button>

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
              onClick={() => window.location.href = "/admin/users"}
            >
              👤 Пользователи
            </button>

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
              onClick={() => window.location.href = "/admin/dictionary"}
            >
              📚 Словари
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
