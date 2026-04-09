import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PanelLeftOpen, Pencil, Trash2 } from "lucide-react";

import type { DiaryEntryView } from "@/shared/types/diary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { getIntlLocale } from "@/shared/i18n/locale";
import { getUiStatus, STATUS_LEFT_BAR, STATUS_STYLES } from "@/shared/lib/uiStatus";

import { getStatusLabel } from "../statusConfig";
import { DiaryTableRowLayout } from "./DiaryTableRowLayout";

type Props = {
  entry: DiaryEntryView;
  isDeleting: boolean;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTableRow({ entry, isDeleting, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const uiStatus = getUiStatus(entry);
  const canEdit = entry.status !== "DELETED";
  const canDelete = entry.status !== "DELETED" && !isDeleting;
  const entryLabel = entry.firstTag?.trim() || t("diary.entryWithId", { id: String(entry.id) });
  const formattedDate = entry.whenStarted
    ? new Date(entry.whenStarted).toLocaleDateString(getIntlLocale())
    : "\u2014";

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(entry);
      setDeleteDialogOpen(false);
    } catch {
      // Keep the dialog open when deletion fails.
    }
  };

  return (
    <DiaryTableRowLayout
      indicator={<div className={`h-full w-1 ${STATUS_LEFT_BAR[uiStatus]}`} />}
      category={entry.firstTag}
      date={formattedDate}
      status={
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[uiStatus]}`}
        >
          {getStatusLabel(uiStatus)}
        </span>
      }
      actions={
        <>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              navigate(`/diary/${entry.id}`, {
                state: { background: location },
              })
            }
          >
            <PanelLeftOpen />
          </Button>

          <Button
            size="sm"
            variant="primary"
            disabled={!canEdit}
            onClick={() => {
              if (canEdit) {
                onEdit(entry.id);
              }
            }}
            className={!canEdit ? "opacity-60 cursor-not-allowed" : ""}
          >
            <Pencil />
          </Button>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="primary"
                disabled={!canDelete}
                className={!canDelete ? "opacity-60 cursor-not-allowed" : ""}
                aria-label={t("diary.deleteAria", { id: String(entry.id) })}
                title={canDelete ? t("diary.deleteEntry") : t("diary.deleteUnavailable")}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="max-w-[24rem] overflow-hidden rounded-[1.35rem] border border-border bg-surface p-0 text-surfaceForeground shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onOverlayClick={() => {
                if (!isDeleting) {
                  setDeleteDialogOpen(false);
                }
              }}
            >
              <AlertDialogHeader className="px-5 py-3 text-left">
                <AlertDialogTitle className="text-[1.45rem] leading-tight text-foreground">
                  {t("diary.deleteDialogTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                  {t("diary.deleteDialogDescription", { label: entryLabel })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="border-t border-border bg-surfaceMuted/70 px-5 py-2.5 sm:flex-row sm:justify-end sm:space-x-2.5">
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="mt-0 !h-10 border border-border bg-input px-4 text-foreground hover:bg-[hsl(var(--input-hover))] hover:text-foreground"
                >
                  {t("common.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="!h-10 bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                >
                  {isDeleting ? t("common.deleting") : t("common.continue")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    />
  );
}

