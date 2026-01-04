import type { DiaryEntryView } from "@/shared/types/diary"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { 
  Pencil,
  PanelLeftOpen 
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

export function DiaryTableRow({ entry }: { entry: DiaryEntryView }) {
  const nav = useNavigate()
  const uiStatus = getUiStatus(entry)
  const location = useLocation()

  return (
    <TableRow>
      {/* LEFT STATUS BAR */}
      <TableCell className="w-1 p-0">
        <div className={`h-full w-1 ${STATUS_LEFT_BAR[uiStatus]}`} />
      </TableCell>

      {/* ID */}
      <TableCell className="text-mutedForeground">
        {entry.id}
      </TableCell>

      {/* SUBCATEGORY */}
      <TableCell className="font-medium text-primary">
        {entry.subCategoryName}
      </TableCell>

      {/* CATEGORY */}
      <TableCell className="text-surfaceForeground/80">
        {entry.categoryName}
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

        {(uiStatus === "ACTIVE" || uiStatus === "PLANNED") && (
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              nav(`/diary/${entry.id}`, {
                state: { background: location },
                
              })
            }
          >
            <Pencil />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}