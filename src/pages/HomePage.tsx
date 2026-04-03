import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

import { Button } from "@/shared/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, username } = useAuthStore();
  const navigate = useNavigate();
  function handleStart() {
    navigate(isAuthenticated ? "/diary" : "/login");
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
          <Button onClick={handleStart}>
            {isAuthenticated
              ? "Продолжить"
              : "Начать"}
          </Button>
        </div>

        {/* ТЕКСТ-ПОДСКАЗКА */}
        <p className="text-slate-500 text-sm">
          Записывайте действия, планируйте время и анализируйте прогресс.
        </p>
      </div>
    </div>
  );
}
