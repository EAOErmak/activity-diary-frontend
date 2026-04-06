import type { UserDto } from "@/shared/types/user";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type Props = {
  user: UserDto;
  onEdit?: () => void;
};

export function ProfileView({ user, onEdit }: Props) {
  const { t } = useTranslation();
  const roleLabels = {
    USER: t("profile.roles.user"),
    PREMIUM: t("profile.roles.premium"),
    ADMIN: t("profile.roles.admin"),
  } as const;

  return (
    <div className="space-y-6">
      {/* Username */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Username</p>
          <p className="text-base font-medium">{user.username}</p>
        </div>
      </div>

      {/* Full name */}
      <div>
        <p className="text-sm text-muted-foreground">{t("profile.fullName")}</p>
        <p className="text-base font-medium">{user.fullName}</p>
      </div>

      {/* Role */}
      <div>
        <p className="text-sm text-muted-foreground">{t("profile.role")}</p>
        <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
          {roleLabels[user.role] ?? user.role}
        </Badge>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("profile.accountStatus")}</p>
          <p className="text-base font-medium">
            {user.enabled ? t("profile.active") : t("profile.disabled")}
          </p>
        </div>
      </div>

      {onEdit && (
        <Button className="w-full" onClick={onEdit}>
          {t("profile.editButton")}
        </Button>
      )}
    </div>
  );
}
