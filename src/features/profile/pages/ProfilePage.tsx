import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { ProfileView } from "../components/ProfileView";
import { useProfile } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading, error } = useProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("profile.loading")}
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        {error ? t(error) : t("profile.notFound")}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-lg border border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <ProfileView user={user} />
        </CardContent>

        {/* 👇 КРАСИВО СНИЗУ ПО ЦЕНТРУ */}
        <CardFooter className="flex justify-center">
          <Button
            variant="primary"
            onClick={() => navigate("/profile/edit")}
          >
            {t("profile.editButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
