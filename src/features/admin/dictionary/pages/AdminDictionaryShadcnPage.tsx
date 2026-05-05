import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  createDictionaryItem,
  updateDictionaryItem,
} from "@/api/admin/dictionaryAdminApi";
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
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { syncDictionaryCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import { getAdminDictionaryByTypeQueryOptions } from "@/shared/lib/queryOptions";
import type {
  DictionaryCreate,
  DictionaryResponse,
  DictionaryUpdate,
} from "@/shared/types/adminDictionary";

type Tab = "METRIC_NAME" | "METRIC_UNIT";

type PendingAction =
  | {
      title: string;
      description: string;
      confirmLabel: string;
      run: () => Promise<void>;
    }
  | null;

export default function AdminDictionaryShadcnPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("METRIC_NAME");
  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const { data: items = [], isPending: isLoadingItems, error } = useQuery<
    DictionaryResponse[],
    Error
  >(getAdminDictionaryByTypeQueryOptions(tab));
  const itemsErrorMessage = error?.message ?? null;

  function getRoleLabel(role: string | null) {
    if (role === "ADMIN") return t("admin.roles.admin");
    if (role === "PREMIUM") return t("admin.roles.premium");
    if (role === "USER") return t("admin.roles.user");
    return t("admin.dictionaryPage.allAccess");
  }

  async function handleCreate() {
    if (!label.trim()) {
      toast.error(t("admin.dictionaryPage.nameRequired"));
      return;
    }

    const payload: DictionaryCreate = {
      type: tab,
      label: label.trim(),
      allowedRole,
    };

    try {
      setIsCreating(true);
      await createDictionaryItem(payload);
      await syncDictionaryCachesAfterAdminMutation(queryClient, tab);
      setLabel("");
      setAllowedRole(null);
    } finally {
      setIsCreating(false);
    }
  }

  function requestToggle(item: DictionaryResponse) {
    setPendingAction({
      title: item.active
        ? t("admin.dictionaryPage.deactivateTitle")
        : t("admin.dictionaryPage.activateTitle"),
      description: t("admin.dictionaryPage.toggleDescription", {
        label: item.label,
      }),
      confirmLabel: item.active
        ? t("admin.dictionaryPage.deactivateConfirm")
        : t("admin.dictionaryPage.activateConfirm"),
      run: async () => {
        const payload: DictionaryUpdate = {
          active: !item.active,
        };

        await updateDictionaryItem(item.id, payload);
        await syncDictionaryCachesAfterAdminMutation(queryClient, tab);
      },
    });
  }

  function requestRoleChange(item: DictionaryResponse, role: string | null) {
    setPendingAction({
      title: t("admin.dictionaryPage.changeAccessTitle"),
      description: t("admin.dictionaryPage.changeAccessDescription", {
        label: item.label,
      }),
      confirmLabel: t("admin.dictionaryPage.saveAccess"),
      run: async () => {
        const payload: DictionaryUpdate = {
          allowedRole: role,
        };

        await updateDictionaryItem(item.id, payload);
        await syncDictionaryCachesAfterAdminMutation(queryClient, tab);
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.dictionaryPage.title")}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("admin.dictionaryPage.subtitle")}
        </p>
      </div>

      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.dictionaryPage.typeTitle")}</CardTitle>
          <CardDescription>
            {t("admin.dictionaryPage.typeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={tab === "METRIC_NAME" ? "primary" : "form"}
            onClick={() => setTab("METRIC_NAME")}
          >
            {t("admin.dictionaryPage.metricNameTab")}
          </Button>
          <Button
            variant={tab === "METRIC_UNIT" ? "primary" : "form"}
            onClick={() => setTab("METRIC_UNIT")}
          >
            {t("admin.dictionaryPage.metricUnitTab")}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.dictionaryPage.addTitle")}</CardTitle>
          <CardDescription>
            {t("admin.dictionaryPage.addDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {t("admin.dictionaryPage.nameLabel")}
            </div>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t("admin.dictionaryPage.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.dictionaryPage.accessLabel")}
            </p>
            <Select
              value={allowedRole ?? "ALL"}
              onValueChange={(value) =>
                setAllowedRole(value === "ALL" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("admin.dictionaryPage.allAccess")}</SelectItem>
                <SelectItem value="USER">{t("admin.roles.user")}</SelectItem>
                <SelectItem value="ADMIN">{t("admin.roles.admin")}</SelectItem>
                <SelectItem value="PREMIUM">{t("admin.roles.premium")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating
              ? t("admin.dictionaryPage.creatingButton")
              : t("admin.dictionaryPage.createButton")}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-surface">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("admin.dictionaryPage.itemsTitle")}</CardTitle>
            <CardDescription>
              {t("admin.dictionaryPage.itemsDescription")}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-transparent px-3 py-1"
          >
            {t("admin.dictionaryPage.totalCount", { count: items.length })}
          </Badge>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>{t("admin.dictionaryPage.nameColumn")}</TableHead>
              <TableHead className="w-[240px]">
                {t("admin.dictionaryPage.accessColumn")}
              </TableHead>
              <TableHead className="w-32 text-center">
                {t("admin.dictionaryPage.activeColumn")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingItems ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.dictionaryPage.loading")}
                </TableCell>
              </TableRow>
            ) : itemsErrorMessage ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-destructive">
                  {itemsErrorMessage}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.dictionaryPage.empty")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.allowedRole ?? "ALL"}
                      onValueChange={(value) =>
                        requestRoleChange(item, value === "ALL" ? null : value)
                      }
                      disabled={isMutating}
                    >
                      <SelectTrigger className="min-w-[180px]">
                        <SelectValue>{getRoleLabel(item.allowedRole)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">{t("admin.dictionaryPage.allAccess")}</SelectItem>
                        <SelectItem value="USER">{t("admin.roles.user")}</SelectItem>
                        <SelectItem value="ADMIN">{t("admin.roles.admin")}</SelectItem>
                        <SelectItem value="PREMIUM">{t("admin.roles.premium")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          item.active
                            ? "rounded-full border-transparent bg-primary/10 text-primary"
                            : "rounded-full border-transparent bg-input text-muted-foreground"
                        }
                      >
                        {item.active
                          ? t("admin.dictionaryPage.yes")
                          : t("admin.dictionaryPage.no")}
                      </Badge>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() => requestToggle(item)}
                        disabled={isMutating}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
        loading={isMutating}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
