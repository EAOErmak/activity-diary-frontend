import { Card } from "@/shared/components/ui/card";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { PanelLeftOpen, Pencil, Trash2 } from "lucide-react";
import { getIntlLocale } from "@/shared/i18n/locale";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { DiaryTableRow } from "./DiaryTableRow";
import type { DiaryEntryView } from "@/shared/types/diary";

type Props = {
  entries: DiaryEntryView[];
  pageSize: number;
  deletingEntryId: number | null;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTable({ entries, pageSize, deletingEntryId, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const placeholderRows = Math.max(0, pageSize - entries.length);
  const placeholderDate = new Date(2026, 11, 31).toLocaleDateString(getIntlLocale());
  const placeholderStatusLabel = [
    t("diary.status.active"),
    t("diary.status.planned"),
    t("diary.status.finished"),
    t("diary.status.failed"),
  ].reduce((longest, current) => (current.length > longest.length ? current : longest));

  return (
    <Card className="max-w-6xl mx-auto overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>{t("diary.category")}</TableHead>
            <TableHead>{t("common.date")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.map((e) => (
            <DiaryTableRow
              key={e.id}
              entry={e}
              isDeleting={deletingEntryId === e.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {Array.from({ length: placeholderRows }, (_, index) => (
            <TableRow
              key={`placeholder-row-${index}`}
              aria-hidden="true"
              className="pointer-events-none hover:bg-transparent"
            >
              <TableCell className="w-1 p-0">
                <div className="invisible h-full w-1" />
              </TableCell>
              <TableCell className="text-surfaceForeground/80">
                <span className="invisible">Placeholder category</span>
              </TableCell>
              <TableCell className="text-mutedForeground">
                <span className="invisible whitespace-nowrap">{placeholderDate}</span>
              </TableCell>
              <TableCell>
                <span className="invisible inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
                  {placeholderStatusLabel}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="invisible"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <PanelLeftOpen />
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="invisible"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Pencil />
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="invisible"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
