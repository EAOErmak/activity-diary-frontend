import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import { AdminUserCreateForm } from "../components/AdminUserCreateForm";

export default function AdminUserCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Создание пользователя</CardTitle>
          <CardDescription>
            Создание нового аккаунта администратором
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AdminUserCreateForm />
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/users")}
          >
            ← Назад к списку пользователей
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
