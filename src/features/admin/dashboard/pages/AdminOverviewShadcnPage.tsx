import { useState } from "react";
import { Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { clearAdminDatabase } from "@/api/admin/adminDatabaseApi";
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

export default function AdminOverviewShadcnPage() {
  const { t } = useTranslation();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);

  async function handleClearDatabase() {
    try {
      setIsClearingDatabase(true);
      const message = await clearAdminDatabase();
      setIsClearDialogOpen(false);
      toast.success(message);
    } catch {
      // The axios interceptor already shows the backend error message.
    } finally {
      setIsClearingDatabase(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          {t("admin.overviewPage.badge")}
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("admin.overviewPage.title")}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("admin.overviewPage.subtitle")}
          </p>
        </div>
      </div>

      <Card className="w-full max-w-5xl border border-destructive/30 bg-surface 2xl:max-w-6xl">
        <CardHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Database className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>{t("admin.overviewPage.databaseTitle")}</CardTitle>
            <CardDescription>
              {t("admin.overviewPage.databaseDescription")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("admin.overviewPage.databaseWarning")}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={() => setIsClearDialogOpen(true)}
            className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
            disabled={isClearingDatabase}
          >
            {isClearingDatabase
              ? t("admin.overviewPage.clearing")
              : t("admin.overviewPage.clearButton")}
          </Button>
        </CardFooter>
      </Card>

      <AdminConfirmationDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title={t("admin.overviewPage.confirmTitle")}
        description={t("admin.overviewPage.confirmDescription")}
        confirmLabel={
          isClearingDatabase
            ? t("admin.overviewPage.clearing")
            : t("admin.overviewPage.confirmLabel")
        }
        loading={isClearingDatabase}
        tone="danger"
        onConfirm={handleClearDatabase}
      />
    </div>
  );
}
