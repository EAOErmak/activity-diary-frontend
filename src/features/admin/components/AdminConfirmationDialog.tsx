import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";

type AdminConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "primary" | "danger";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  tone = "primary",
  onOpenChange,
  onConfirm,
}: AdminConfirmationDialogProps) {
  const { t } = useTranslation();
  const confirmClassName =
    tone === "danger"
      ? "!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
      : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border border-border bg-surface text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="surface" disabled={loading}>
              {cancelLabel ?? t("common.cancel")}
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              disabled={loading}
              className={confirmClassName}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
