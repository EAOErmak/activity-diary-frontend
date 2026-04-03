import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { clearAdminDatabase } from "@/api/admin/adminDatabaseApi";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export default function AdminOverviewPage() {
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);

  async function handleClearDatabase() {
    const ok = window.confirm(
      "Очистить базу данных? Действие удалит данные из всех таблиц."
    );
    if (!ok) return;

    try {
      setIsClearingDatabase(true);
      const message = await clearAdminDatabase();
      toast.success(message);
    } catch {
      // Error toast is already shown by the axios interceptor.
    } finally {
      setIsClearingDatabase(false);
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="mb-2 text-3xl font-bold text-blue-400">
        Админка - Обзор
      </h1>
      <p className="mb-8 max-w-3xl text-sm text-slate-400">
        Серверная статистика временно скрыта, пока соответствующие
        backend-эндпоинты не работают.
      </p>

      <h2 className="mb-3 text-lg font-semibold">Управление</h2>
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ActionLinkCard
          to="/admin/users"
          title="Пользователи"
          description="Управление аккаунтами, ролями и блокировками."
          className="bg-blue-600 hover:bg-blue-700"
          descriptionClassName="text-blue-100"
        />
        <ActionLinkCard
          to="/admin/dictionary"
          title="Словари"
          description="Редактирование системных справочников и метрик."
          className="bg-green-600 hover:bg-green-700"
          descriptionClassName="text-green-100"
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold">База данных</h2>
      <Card className="rounded-2xl border border-red-500/30 bg-[#151C2C] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-red-200">
              Полная очистка базы
            </h3>
            <p className="max-w-2xl text-sm text-slate-400">
              Вызывает `POST /admin/database/clear` и очищает данные во всех
              таблицах. Используй только для полного сброса среды.
            </p>
          </div>

          <Button
            variant="danger"
            onClick={handleClearDatabase}
            disabled={isClearingDatabase}
          >
            {isClearingDatabase ? "Очистка..." : "Очистить базу"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

type ActionLinkCardProps = {
  to: string;
  title: string;
  description: string;
  className: string;
  descriptionClassName: string;
};

function ActionLinkCard({
  to,
  title,
  description,
  className,
  descriptionClassName,
}: ActionLinkCardProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col gap-2 rounded-2xl p-6 shadow transition ${className}`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className={`text-sm ${descriptionClassName}`}>{description}</p>
    </Link>
  );
}
