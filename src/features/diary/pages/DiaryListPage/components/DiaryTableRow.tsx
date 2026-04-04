import { useState } from "react"
import type { DiaryEntryView } from "@/shared/types/diary"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { 
  Pencil,
  PanelLeftOpen, 
  Trash2,
} from 'lucide-react';
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
} from "@/shared/components/ui/alert-dialog"
import {
  TableRow,
  TableCell,
} from "@/shared/components/ui/table"
import {
  getUiStatus,
  STATUS_STYLES,
  STATUS_LEFT_BAR,
} from "@/shared/lib/uiStatus"
import { STATUS_LABELS } from "../statusConfig"

type Props = {
  entry: DiaryEntryView;
  isDeleting: boolean;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTableRow({ entry, isDeleting, onEdit, onDelete }: Props) {
  const nav = useNavigate()
  const uiStatus = getUiStatus(entry)
  const location = useLocation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const canEdit = entry.status !== "DELETED";
  const canDelete = entry.status !== "DELETED" && !isDeleting;
  const entryLabel = entry.firstTag?.trim() || `Entry #${entry.id}`

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(entry)
      setDeleteDialogOpen(false)
    } catch {
      // Keep the dialog open when deletion fails.
    }
  }

  return (
    <TableRow>
      {/* LEFT STATUS BAR */}
      <TableCell className="w-1 p-0">
        <div className={`h-full w-1 ${STATUS_LEFT_BAR[uiStatus]}`} />
      </TableCell>

      {/* CATEGORY */}
      <TableCell className="text-surfaceForeground/80">
        {entry.firstTag}
      </TableCell>

      {/* DATE */}
      <TableCell className="text-mutedForeground">
        {entry.whenStarted
          ? new Date(entry.whenStarted).toLocaleDateString()
          : "—"}
      </TableCell>

      {/* STATUS */}
      <TableCell>
        <span
          className={`
            inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
            ${STATUS_STYLES[uiStatus]}
          `}
        >
          {STATUS_LABELS[uiStatus]}
        </span>
      </TableCell>

      {/* ACTIONS */}
      <TableCell className="text-right space-x-2">
        {/* OPEN DETAILS */}
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            nav(`/diary/${entry.id}`, {
              state: { background: location },       
            })
          }
          >
          <PanelLeftOpen />
        </Button>

        {/* EDIT / VIEW */}
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
              aria-label={`Delete entry ${entry.id}`}
              title={canDelete ? "Delete entry" : "Entry cannot be deleted"}
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="max-w-[24rem] overflow-hidden rounded-[1.35rem] border border-border bg-surface p-0 text-surfaceForeground shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            onOverlayClick={() => {
              if (!isDeleting) {
                setDeleteDialogOpen(false)
              }
            }}
          >
            <AlertDialogHeader className="px-5 py-3 text-left">
              <AlertDialogTitle className="text-[1.45rem] leading-tight text-foreground">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                This action cannot be undone. This will permanently delete "{entryLabel}" from
                your diary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="border-t border-border bg-surfaceMuted/70 px-5 py-2.5 sm:flex-row sm:justify-end sm:space-x-2.5">
              <AlertDialogCancel
                disabled={isDeleting}
                className="mt-0 !h-10 border border-border bg-input px-4 text-foreground hover:bg-[hsl(var(--input-hover))] hover:text-foreground"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="!h-10 bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              >
                {isDeleting ? "Deleting..." : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}
