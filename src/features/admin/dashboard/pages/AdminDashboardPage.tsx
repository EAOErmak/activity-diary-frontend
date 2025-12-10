import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";

import {
  getAdminDashboardStats,
} from "@/api/dashboardApi";

type AdminDashboardStats = {
  totalUsers: number;
  activeToday: number;
  blockedUsers: number;
  newUsersLast7Days: number;

  totalEntries: number;
  entriesToday: number;
  entriesLast7Days: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getAdminDashboardStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return <div className="p-6 text-white">Загрузка...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-2 text-blue-400">
        Админка — Обзор
      </h1>
      <p className="text-slate-400 mb-8 text-sm">
        Состояние системы и общая активность платформы
      </p>

      {/* ===== СИСТЕМА ===== */}
      <h2 className="text-lg font-semibold mb-3">Система</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Всего пользователей" value={stats.totalUsers} />
        <StatCard title="Активных сегодня" value={stats.activeToday} />
        <StatCard title="Заблокированных" value={stats.blockedUsers} />
        <StatCard title="Новых за 7 дней" value={stats.newUsersLast7Days} />
      </div>

      {/* ===== АКТИВНОСТЬ ===== */}
      <h2 className="text-lg font-semibold mb-3">Активность</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Всего записей" value={stats.totalEntries} />
        <StatCard title="Записей сегодня" value={stats.entriesToday} />
        <StatCard title="Записей за 7 дней" value={stats.entriesLast7Days} />
      </div>

      {/* ===== БЫСТРЫЕ ДЕЙСТВИЯ ===== */}
      <h2 className="text-lg font-semibold mb-3">Управление</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="bg-blue-600 hover:bg-blue-700 transition p-6 rounded-2xl shadow flex flex-col gap-2"
        >
          <h2 className="text-xl font-semibold">Пользователи</h2>
          <p className="text-sm text-blue-200">
            Управление аккаунтами, ролями и блокировками
          </p>
        </Link>

        <Link
          to="/admin/dictionary"
          className="bg-green-600 hover:bg-green-700 transition p-6 rounded-2xl shadow flex flex-col gap-2"
        >
          <h2 className="text-xl font-semibold">Словари</h2>
          <p className="text-sm text-green-200">
            Управление SUB_CATEGORY, CATEGORY, METRIC_NAME, METRIC_UNIT
          </p>
        </Link>

        <Link
          to="/admin/entry-config"
          className="bg-purple-600 hover:bg-purple-700 transition p-6 rounded-2xl shadow flex flex-col gap-2"
        >
          <h2 className="text-xl font-semibold">Конфигурация записей</h2>
          <p className="text-sm text-purple-200">
            Управление полями формы дневника
          </p>
        </Link>
      </div>
    </div>
  );
}

/* ===== ВСПОМОГАТЕЛЬНАЯ КАРТОЧКА ===== */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-6 bg-[#151C2C] border border-slate-700/60 rounded-2xl">
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}
