import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoginForm from "@/features/auth/components/LoginForm";
import { loginRequest } from "@/api/authApi";
import { useAuthStore } from "@/shared/store/authStore";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuthData = useAuthStore((s) => s.setAuthData);

  async function handle(data: { username: string; password: string }) {
    try {
      const payload = await loginRequest({
        email: data.username,
        password: data.password,
      });

      // ✅ 2FA
      if (payload.twoFactorRequired) {
        setAuthData({
          accessToken: null,
          refreshToken: null,
          userId: null,
          username: payload.username,
          role: payload.role ?? "USER",
          twoFactorRequired: true,
        });

        navigate("/verify-login", {
          state: { username: payload.username },
        });
        return;
      }

      // ✅ обычный логин
      setAuthData({
        ...payload,
        twoFactorRequired: payload.twoFactorRequired ?? false,
      });
      navigate("/diary");
    } catch (err: any) {
      alert(err?.response?.data?.message || t("auth.loginError"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
          <CardDescription>
            {t("auth.loginSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm onSubmit={handle} />
        </CardContent>
      </Card>
    </div>
  );
}
