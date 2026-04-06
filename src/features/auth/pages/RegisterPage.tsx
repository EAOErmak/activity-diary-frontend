import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const nav = useNavigate();

  async function handle(data: RegisterRequest) {
    try {
      await registerRequest(data);
      nav("/login"); // экран "Проверьте почту"
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || t("auth.registerError"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.registerTitle")}</CardTitle>
          <CardDescription>
            {t("auth.registerSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm onSubmit={handle} />
        </CardContent>
      </Card>
    </div>
  );
}
