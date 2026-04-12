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
import { getIntlLocale } from "@/shared/i18n/locale";
import { getUiStatus, STATUS_LEFT_BAR, STATUS_STYLES } from "@/shared/lib/uiStatus";

import { getStatusLabel } from "../statusConfig";
import { DiaryTableRowLayout } from "./DiaryTableRowLayout";
import {
  DiaryTableActionButton,
  DiaryTableCategoryContent,
  DiaryTableDateContent,
  DiaryTableIndicator,
  DiaryTableStatusBadge,
} from "./DiaryTableRowContent";

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
  const formattedStartTime = entry.whenStarted
    ? new Date(entry.whenStarted).toLocaleTimeString(getIntlLocale(), {
        hour: "2-digit",
        minute: "2-digit",
      })
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
      indicator={<DiaryTableIndicator className={STATUS_LEFT_BAR[uiStatus]} />}
      category={<DiaryTableCategoryContent>{entry.firstTag}</DiaryTableCategoryContent>}
      date={<DiaryTableDateContent>{formattedStartTime}</DiaryTableDateContent>}
      status={
        <DiaryTableStatusBadge toneClassName={STATUS_STYLES[uiStatus]}>
          {getStatusLabel(uiStatus)}
        </DiaryTableStatusBadge>
      }
      actions={
        <>
          <DiaryTableActionButton
            icon={<PanelLeftOpen />}
            onClick={() =>
              navigate(`/diary/${entry.id}`, {
                state: { background: location },
              })
            }
          />

          <DiaryTableActionButton
            icon={<Pencil />}
            disabled={!canEdit}
            onClick={() => {
              if (canEdit) {
                onEdit(entry.id);
              }
            }}
            className={!canEdit ? "opacity-60 cursor-not-allowed" : ""}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <DiaryTableActionButton
                icon={<Trash2 />}
                disabled={!canDelete}
                className={!canDelete ? "opacity-60 cursor-not-allowed" : ""}
                aria-label={t("diary.deleteAria", { id: String(entry.id) })}
                title={canDelete ? t("diary.deleteEntry") : t("diary.deleteUnavailable")}
              />
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

