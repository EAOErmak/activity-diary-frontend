import type { UserDto } from "@/shared/types/user";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type Props = {
  user: UserDto;
  onEdit?: () => void;
};

export function ProfileView({ user, onEdit }: Props) {
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
        <p className="text-sm text-muted-foreground">Полное имя</p>
        <p className="text-base font-medium">{user.fullName}</p>
      </div>

      {/* Role */}
      <div>
        <p className="text-sm text-muted-foreground">Роль</p>
        <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
          {user.role}
        </Badge>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Статус аккаунта</p>
          <p className="text-base font-medium">
            {user.enabled ? "Активен" : "Отключён"}
          </p>
        </div>
      </div>

      {onEdit && (
        <Button className="w-full" onClick={onEdit}>
          Редактировать профиль
        </Button>
      )}
    </div>
  );
}
