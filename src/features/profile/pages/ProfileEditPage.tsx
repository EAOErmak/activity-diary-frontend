import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { UpdateProfileForm } from "@/features/profile/components/UpdateProfileForm";
import { ChangeUsernameForm } from "@/features/profile/components/ChangeUsernameForm";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import { useProfile } from "../hooks/useProfile";

export default function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading, error, reloadProfile } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("profile.genericLoading")}
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        {t("profile.loadError")}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-lg border border-border/60 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle>{t("profile.editTitle")}</CardTitle>
          <Button
            variant="ghost"
            className="w-fit px-0"
            onClick={() => navigate("/profile")}
          >
            {`← ${t("profile.backToProfile")}`}
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Full name */}
          <UpdateProfileForm
            fullName={user.fullName}
            onSuccess={reloadProfile}
          />

          <Separator />

          {/* Username */}
          <ChangeUsernameForm 
             username={user.username}
             onSuccess={reloadProfile}
          />

          <Separator />

          {/* Password */}
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
