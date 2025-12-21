import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

export default function HomePage() {
  const nav = useNavigate();
  const { isAuthenticated, username } = useAuthStore();

  function goDiary() {
    nav(isAuthenticated ? "/diary" : "/login");
  }

  function goDashboard() {
    nav(isAuthenticated ? "/dashboard" : "/login");
  }

  function goNewEntry() {
    nav(isAuthenticated ? "/diary/new" : "/login");
  }

  function goCalendar() {
    nav(isAuthenticated ? "/calendar" : "/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
      <div className="w-full max-w-4xl text-center space-y-10 px-4">

        {/* ЗАГОЛОВОК */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isAuthenticated
              ? `Привет, ${username}`
              : "Activity Diary"}
          </h1>

          <p className="text-slate-400 mb-6">
            {isAuthenticated
              ? "Готов продолжить свой дневник?"
              : "Личный дневник активности и аналитики"}
          </p>
        </div>

        {/* ОСНОВНЫЕ ДЕЙСТВИЯ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <button
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            onClick={goDiary}
          >
            📘 Дневник
          </button>

          <button
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white font-semibold"
            onClick={goCalendar}
          >
            🗓 Календарь
          </button>

          <button
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 transition rounded-xl text-white font-semibold"
            onClick={goDashboard}
          >
            📊 Аналитика
          </button>

          <button
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 transition rounded-xl text-white font-semibold"
            onClick={goNewEntry}
          >
            ➕ Новая запись
          </button>
        </div>

        {/* ТЕКСТ-ПОДСКАЗКА */}
        <p className="text-slate-500 text-sm">
          Записывайте действия, планируйте время и анализируйте прогресс.
        </p>
      </div>
    </div>
  );
}
