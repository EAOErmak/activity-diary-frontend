import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
      <div className="w-full max-w-4xl text-center space-y-10 px-4">

        {/* ✅ ЗАГОЛОВОК */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Activity Diary
          </h1>

          <p className="text-slate-400 mb-6">
            Личный дневник активности и аналитики
          </p>
        </div>

        {/* ✅ ОСНОВНЫЕ ДЕЙСТВИЯ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            onClick={() => nav("/diary")}
          >
            📘 Открыть дневник
          </button>

          <button
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 transition rounded-xl text-white font-semibold"
            onClick={() => nav("/dashboard")}
          >
            📊 Посмотреть аналитику
          </button>
        </div>

        {/* ✅ ВСПОМОГАТЕЛЬНЫЙ ТЕКСТ */}
        <p className="text-slate-500 text-sm">
          Записывайте действия, отслеживайте прогресс и анализируйте изменения.
        </p>
      </div>
    </div>
  );
}
