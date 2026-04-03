import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Database, Tags, Users } from "lucide-react";
import { toast } from "sonner";

import { clearAdminDatabase } from "@/api/admin/adminDatabaseApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const ACTION_CARDS = [
  {
    to: "/admin/users",
    title: "Пользователи",
    description: "Управление аккаунтами, ролями и блокировками.",
    icon: Users,
  },
  {
    to: "/admin/dictionary",
    title: "Словари",
    description: "Редактирование системных справочников и метрик.",
    icon: BookOpen,
  },
  {
    to: "/admin/tags",
    title: "Теги",
    description: "Модерация пользовательских тегов и статусов.",
    icon: Tags,
  },
] as const;

export default function AdminOverviewShadcnPage() {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);

  async function handleClearDatabase() {
    try {
      setIsClearingDatabase(true);
      const message = await clearAdminDatabase();
      setIsClearDialogOpen(false);
      toast.success(message);
    } catch {
      // The axios interceptor already shows the backend error message.
    } finally {
      setIsClearingDatabase(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          Админ-панель
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Обзор
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Серверная статистика временно скрыта, пока соответствующие
            backend-эндпоинты не работают. Ниже оставлены только рабочие
            административные действия.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.to} className="border border-border bg-surface">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="surface" className="w-full">
                  <Link to={card.to}>Открыть раздел</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="border border-destructive/30 bg-surface">
        <CardHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Database className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>База данных</CardTitle>
            <CardDescription>
              Полная очистка вызывает `POST /admin/database/clear` и удаляет
              данные из всех таблиц.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Используй эту операцию только для полного сброса среды. Отменить
            очистку после запуска нельзя.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={() => setIsClearDialogOpen(true)}
            className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
            disabled={isClearingDatabase}
          >
            {isClearingDatabase ? "Очистка..." : "Очистить базу"}
          </Button>
        </CardFooter>
      </Card>

      <AdminConfirmationDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="Подтвердите очистку базы"
        description="Это действие удалит данные из всех таблиц. Отменить очистку после запуска нельзя."
        confirmLabel={isClearingDatabase ? "Очистка..." : "Удалить все данные"}
        loading={isClearingDatabase}
        tone="danger"
        onConfirm={handleClearDatabase}
      />
    </div>
  );
}
