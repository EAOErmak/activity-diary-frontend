import { useMemo, useState } from "react";
import { AlertTriangle, Database, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearAdminDatabase,
  clearAdminDatabaseTable,
} from "@/api/admin/adminDatabaseApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getIntlLocale } from "@/shared/i18n/locale";
import { syncAllAdminManagedCaches } from "@/shared/lib/adminCacheSync";
import { getAdminDatabaseTableTypesQueryOptions } from "@/shared/lib/queryOptions";
import type { AdminDatabaseTableType } from "@/shared/types/adminDatabase";

type PendingAction =
  | { kind: "database" }
  | { kind: "table"; tableType: AdminDatabaseTableType }
  | null;

function formatTableDisplayName(tableType: AdminDatabaseTableType) {
  return tableType.tableName || tableType.label || tableType.value;
}

export default function AdminDatabaseShadcnPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [clearingTarget, setClearingTarget] = useState<string | "database" | null>(
    null
  );
  const {
    data: tableTypes = [],
    isPending: isLoadingTableTypes,
    error,
  } = useQuery<AdminDatabaseTableType[], Error>(
    getAdminDatabaseTableTypesQueryOptions()
  );
  const tableTypesErrorMessage = error?.message ?? null;

  const sortedTableTypes = useMemo(
    () =>
      [...tableTypes].sort((left, right) =>
        formatTableDisplayName(left).localeCompare(
          formatTableDisplayName(right),
          locale
        )
      ),
    [locale, tableTypes]
  );

  async function handleConfirmAction() {
    if (pendingAction == null) {
      return;
    }

    const nextClearingTarget =
      pendingAction.kind === "database"
        ? "database"
        : pendingAction.tableType.value;

    try {
      setClearingTarget(nextClearingTarget);

      const message =
        pendingAction.kind === "database"
          ? await clearAdminDatabase()
          : await clearAdminDatabaseTable(pendingAction.tableType.value);

      await syncAllAdminManagedCaches(queryClient);
      setPendingAction(null);
      toast.success(message);
    } catch {
      // axios interceptor already shows the backend error
    } finally {
      setClearingTarget(null);
    }
  }

  const isClearingDatabase = clearingTarget === "database";
  const isConfirmationLoading =
    pendingAction?.kind === "database"
      ? isClearingDatabase
      : pendingAction != null && clearingTarget === pendingAction.tableType.value;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          {t("admin.databasePage.badge")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.databasePage.title")}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("admin.databasePage.subtitle")}
        </p>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("admin.databasePage.tablesTitle")}</CardTitle>
            <CardDescription>
              {t("admin.databasePage.tablesDescription")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {t("admin.databasePage.tableCount", {
              count: sortedTableTypes.length,
            })}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.databasePage.tableColumn")}</TableHead>
                <TableHead>{t("admin.databasePage.identifierColumn")}</TableHead>
                <TableHead className="w-40 text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTableTypes ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t("admin.databasePage.loadingTableTypes")}
                  </TableCell>
                </TableRow>
              ) : tableTypesErrorMessage ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-destructive"
                  >
                    {tableTypesErrorMessage}
                  </TableCell>
                </TableRow>
              ) : sortedTableTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t("admin.databasePage.emptyTableTypes")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedTableTypes.map((tableType) => {
                  const isClearingTable = clearingTarget === tableType.value;

                  return (
                    <TableRow key={tableType.value}>
                      <TableCell className="font-medium">
                        {formatTableDisplayName(tableType)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {tableType.value}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="surface"
                          size="sm"
                          disabled={clearingTarget !== null}
                          onClick={() =>
                            setPendingAction({
                              kind: "table",
                              tableType,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isClearingTable
                            ? t("admin.databasePage.clearing")
                            : t("admin.databasePage.clearTableButton")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-destructive/30 bg-surface">
        <CardHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Database className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>{t("admin.databasePage.fullResetTitle")}</CardTitle>
            <CardDescription>
              {t("admin.databasePage.fullResetDescription")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p>{t("admin.databasePage.fullResetWarning")}</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={() => setPendingAction({ kind: "database" })}
            className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
            disabled={clearingTarget !== null}
          >
            {isClearingDatabase
              ? t("admin.databasePage.clearing")
              : t("admin.databasePage.clearDatabaseButton")}
          </Button>
        </CardFooter>
      </Card>

      <AdminConfirmationDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && clearingTarget === null) {
            setPendingAction(null);
          }
        }}
        title={
          pendingAction?.kind === "database"
            ? t("admin.databasePage.fullResetConfirmTitle")
            : t("admin.databasePage.tableResetConfirmTitle")
        }
        description={
          pendingAction?.kind === "database"
            ? t("admin.databasePage.fullResetConfirmDescription")
            : pendingAction == null
              ? ""
              : t("admin.databasePage.tableResetConfirmDescription", {
                  table: formatTableDisplayName(pendingAction.tableType),
                  value: pendingAction.tableType.value,
                })
        }
        confirmLabel={
          pendingAction?.kind === "database"
            ? isConfirmationLoading
              ? t("admin.databasePage.clearing")
              : t("admin.databasePage.fullResetConfirmLabel")
            : isConfirmationLoading
              ? t("admin.databasePage.clearing")
              : t("admin.databasePage.tableResetConfirmLabel")
        }
        loading={Boolean(isConfirmationLoading)}
        tone="danger"
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
