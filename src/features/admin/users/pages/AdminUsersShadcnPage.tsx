import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Search, ShieldCheck, Unlock, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  getAllUsers,
  toggleUserEnabled,
  toggleUserLocked,
  updateUserRole,
} from "@/api/admin/adminUsersApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getIntlLocale } from "@/shared/i18n/locale";
import { useAuthStore } from "@/shared/store/authStore";
import type { AdminUserDto } from "@/shared/types/adminUser";

type RoleFilter = "ALL" | "ADMIN" | "USER" | "PREMIUM";
type StatusFilter = "ALL" | "ENABLED" | "DISABLED" | "LOCKED";

type PendingAction =
  | {
      title: string;
      description: string;
      confirmLabel: string;
      tone?: "primary" | "danger";
      run: () => Promise<void>;
    }
  | null;

const ROLE_OPTIONS: Array<AdminUserDto["role"]> = [
  "USER",
  "PREMIUM",
  "ADMIN",
];

const ROLE_BADGE_CLASS: Record<AdminUserDto["role"], string> = {
  USER: "border-border text-foreground",
  PREMIUM: "border-primary/30 text-primary",
  ADMIN: "border-destructive/30 text-destructive",
};

export default function AdminUsersShadcnPage() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { userId: currentUserId } = useAuthStore();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  function getRoleLabel(role: AdminUserDto["role"]) {
    if (role === "ADMIN") return t("admin.roles.admin");
    if (role === "PREMIUM") return t("admin.roles.premium");
    return t("admin.roles.user");
  }

  function requireNotSelf(message: string, userId: number) {
    if (userId !== currentUserId) return true;

    toast.error(message);
    return false;
  }

  function requestRoleChange(
    user: AdminUserDto,
    nextRole: AdminUserDto["role"]
  ) {
    if (!requireNotSelf(t("admin.usersPage.selfRoleError"), user.id)) {
      return;
    }

    if (user.role === nextRole) return;

    setPendingAction({
      title: t("admin.usersPage.roleChangeTitle"),
      description: t("admin.usersPage.roleChangeDescription", {
        username: user.username,
        role: getRoleLabel(nextRole),
      }),
      confirmLabel: t("admin.usersPage.roleChangeConfirm"),
      run: async () => {
        await updateUserRole(user.id, { role: nextRole });
        await load();
      },
    });
  }

  function requestToggleEnabled(user: AdminUserDto) {
    if (!requireNotSelf(t("admin.usersPage.selfDisableError"), user.id)) {
      return;
    }

    const enabling = !user.enabled;

    setPendingAction({
      title: enabling
        ? t("admin.usersPage.enableTitle")
        : t("admin.usersPage.disableTitle"),
      description: t("admin.usersPage.toggleEnabledDescription", {
        action: enabling
          ? t("admin.usersPage.enableAction")
          : t("admin.usersPage.disableAction"),
        username: user.username,
      }),
      confirmLabel: enabling
        ? t("admin.usersPage.enableConfirm")
        : t("admin.usersPage.disableConfirm"),
      tone: enabling ? "primary" : "danger",
      run: async () => {
        await toggleUserEnabled(user.id, !user.enabled);
        await load();
      },
    });
  }

  function requestToggleLock(user: AdminUserDto) {
    if (!requireNotSelf(t("admin.usersPage.selfLockError"), user.id)) {
      return;
    }

    const unlocking = user.accountLocked;

    setPendingAction({
      title: unlocking
        ? t("admin.usersPage.unlockTitle")
        : t("admin.usersPage.lockTitle"),
      description: t("admin.usersPage.toggleLockDescription", {
        action: unlocking
          ? t("admin.usersPage.unlockAction")
          : t("admin.usersPage.lockAction"),
        username: user.username,
      }),
      confirmLabel: unlocking
        ? t("admin.usersPage.unlockConfirm")
        : t("admin.usersPage.lockConfirm"),
      tone: unlocking ? "primary" : "danger",
      run: async () => {
        await toggleUserLocked(user.id, !user.accountLocked);
        await load();
      },
    });
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;

    try {
      setIsMutating(true);
      await pendingAction.run();
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.fullName.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ENABLED" && user.enabled) ||
        (statusFilter === "DISABLED" && !user.enabled) ||
        (statusFilter === "LOCKED" && user.accountLocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.usersPage.title")}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("admin.usersPage.subtitle")}
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/users/create">
            <UserPlus className="mr-2 h-4 w-4" />
            {t("admin.usersPage.createUser")}
          </Link>
        </Button>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.usersPage.filtersTitle")}</CardTitle>
          <CardDescription>
            {t("admin.usersPage.filtersDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_200px_200px_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {t("admin.usersPage.searchLabel")}
            </div>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("admin.usersPage.searchPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.usersPage.roleLabel")}
            </p>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as RoleFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.usersPage.rolePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("admin.usersPage.allRoles")}</SelectItem>
                <SelectItem value="ADMIN">{t("admin.roles.admin")}</SelectItem>
                <SelectItem value="USER">{t("admin.roles.user")}</SelectItem>
                <SelectItem value="PREMIUM">{t("admin.roles.premium")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.usersPage.statusLabel")}
            </p>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.usersPage.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("admin.usersPage.allStatuses")}</SelectItem>
                <SelectItem value="ENABLED">{t("admin.usersPage.active")}</SelectItem>
                <SelectItem value="DISABLED">{t("admin.usersPage.disabled")}</SelectItem>
                <SelectItem value="LOCKED">{t("admin.usersPage.locked")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-start lg:justify-end">
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
              {t("admin.usersPage.foundCount", {
                count: filteredUsers.length,
              })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.usersPage.listTitle")}</CardTitle>
          <CardDescription>
            {t("admin.usersPage.listDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>{t("admin.usersPage.userColumn")}</TableHead>
                <TableHead>{t("admin.usersPage.roleColumn")}</TableHead>
                <TableHead>{t("admin.usersPage.statusesColumn")}</TableHead>
                <TableHead>{t("admin.usersPage.createdColumn")}</TableHead>
                <TableHead className="w-[260px]">
                  {t("admin.usersPage.actionsColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t("admin.usersPage.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t("admin.usersPage.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUserId;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            {isSelf && (
                              <Badge variant="outline" className="rounded-full">
                                {t("admin.usersPage.you")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.fullName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className={`rounded-full ${ROLE_BADGE_CLASS[user.role]}`}
                          >
                            {getRoleLabel(user.role)}
                          </Badge>
                          <Select
                            value={user.role}
                            disabled={isSelf || isMutating}
                            onValueChange={(value) =>
                              requestRoleChange(user, value as AdminUserDto["role"])
                            }
                          >
                            <SelectTrigger className="min-w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {getRoleLabel(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={
                              user.enabled
                                ? "rounded-full border-primary/30 text-primary"
                                : "rounded-full"
                            }
                          >
                            {user.enabled
                              ? t("admin.usersPage.active")
                              : t("admin.usersPage.disabled")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              user.accountLocked
                                ? "rounded-full border-destructive/30 text-destructive"
                                : "rounded-full"
                            }
                          >
                            {user.accountLocked
                              ? t("admin.usersPage.locked")
                              : t("admin.usersPage.unlocked")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString(locale)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={isSelf || isMutating}
                            onClick={() => requestToggleEnabled(user)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {user.enabled
                              ? t("admin.usersPage.disableConfirm")
                              : t("admin.usersPage.enableConfirm")}
                          </Button>
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={isSelf || isMutating}
                            onClick={() => requestToggleLock(user)}
                            className={
                              user.accountLocked
                                ? "text-primary"
                                : "text-destructive"
                            }
                          >
                            {user.accountLocked ? (
                              <Unlock className="mr-2 h-4 w-4" />
                            ) : (
                              <Lock className="mr-2 h-4 w-4" />
                            )}
                            {user.accountLocked
                              ? t("admin.usersPage.unlockConfirm")
                              : t("admin.usersPage.lockConfirm")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminConfirmationDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !isMutating) {
            setPendingAction(null);
          }
        }}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
        confirmLabel={pendingAction?.confirmLabel ?? t("common.continue")}
        tone={pendingAction?.tone ?? "primary"}
        loading={isMutating}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
