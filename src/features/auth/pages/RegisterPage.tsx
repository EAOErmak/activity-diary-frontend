import { useNavigate } from "react-router-dom";

import RegisterForm from "@/features/auth/components/RegisterForm";
import { registerRequest } from "@/api/authApi";
import type { RegisterRequest } from "@/shared/types/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

export default function RegisterPage() {
  const nav = useNavigate();

  async function handle(data: RegisterRequest) {
    try {
      await registerRequest(data);
      nav("/login"); // экран "Проверьте почту"
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || "Ошибка регистрации");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создать новый аккаунт
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm onSubmit={handle} />
        </CardContent>
      </Card>
    </div>
  );
}
