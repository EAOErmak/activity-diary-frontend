import type { DiaryEntryView } from "@/shared/types/diary"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { 
  Pencil,
  PanelLeftOpen, 
  Eye,
  PencilOff
} from 'lucide-react';
import {
  TableRow,
  TableCell,
} from "@/shared/components/ui/table"
import {
  getUiStatus,
  STATUS_STYLES,
  STATUS_LEFT_BAR,
} from "@/shared/lib/uiStatus"
import { STATUS_LABELS } from "../helpers"

export function DiaryTableRow({ entry, onEdit }: { entry: DiaryEntryView; onEdit: (id: number) => void }) {
  const nav = useNavigate()
  const uiStatus = getUiStatus(entry)
  const location = useLocation()
  const canEdit = uiStatus === "PLANNED" || uiStatus === "ACTIVE";

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
          {canEdit ? (
            <Pencil />
          ) : (
            <PencilOff />
          )}
        </Button>
      </TableCell>
    </TableRow>
  )
}