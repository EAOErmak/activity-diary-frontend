import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0E1420] text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">
        Админ-панель
      </h1>

      {/* --- СТАТИСТИКА --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="p-6 bg-[#151C2C] border border-slate-700/60 rounded-2xl">
          <p className="text-gray-400 text-sm mb-2">Пользователей</p>
          <p className="text-2xl font-bold">—</p>
        </Card>

        <Card className="p-6 bg-[#151C2C] border border-slate-700/60 rounded-2xl">
          <p className="text-gray-400 text-sm mb-2">Записей</p>
          <p className="text-2xl font-bold">—</p>
        </Card>

        <Card className="p-6 bg-[#151C2C] border border-slate-700/60 rounded-2xl">
          <p className="text-gray-400 text-sm mb-2">Телеграм привязки</p>
          <p className="text-2xl font-bold">—</p>
        </Card>

        <Card className="p-6 bg-[#151C2C] border border-slate-700/60 rounded-2xl">
          <p className="text-gray-400 text-sm mb-2">Активных сегодня</p>
          <p className="text-2xl font-bold">—</p>
        </Card>
      </div>

      {/* --- НАВИГАЦИЯ --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="bg-blue-600 hover:bg-blue-700 transition p-6 rounded-2xl shadow flex flex-col gap-2"
        >
          <h2 className="text-xl font-semibold">Пользователи</h2>
          <p className="text-sm text-blue-200">
            Управление пользователями, ролями, блокировками
          </p>
        </Link>

        <Link
          to="/admin/dictionary"
          className="bg-green-600 hover:bg-green-700 transition p-6 rounded-2xl shadow flex flex-col gap-2"
        >
          <h2 className="text-xl font-semibold">Словари</h2>
          <p className="text-sm text-green-200">
            Управление WHAT, WHAT_HAPPENED, ITEM_NAME, UNIT
          </p>
        </Link>
      </div>
    </div>
  );
}
