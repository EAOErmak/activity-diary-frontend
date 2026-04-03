import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import { AdminUserCreateForm } from "@/features/admin/users/components/AdminUserCreateForm";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function AdminUserCreateShadcnPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          Создание пользователя
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Новый пользователь
          </h1>
          <p className="text-sm text-muted-foreground">
            Форма использует те же общие UI-компоненты и theme tokens, что и
            остальная админ-панель.
          </p>
        </div>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-foreground">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>Данные аккаунта</CardTitle>
            <CardDescription>
              Создание нового пользователя администратором.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <AdminUserCreateForm />
        </CardContent>
      </Card>

      <Button asChild variant="surface">
        <Link to="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку пользователей
        </Link>
      </Button>
    </div>
  );
}
