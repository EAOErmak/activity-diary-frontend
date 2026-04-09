import { useTranslation } from "react-i18next";

import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { DiaryEntryView } from "@/shared/types/diary";

import { DiaryTablePlaceholderRow } from "./DiaryTablePlaceholderRow";
import { DiaryTableRow } from "./DiaryTableRow";

type Props = {
  entries: DiaryEntryView[];
  pageSize: number;
  deletingEntryId: number | null;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTable({ entries, pageSize, deletingEntryId, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const rows = Array.from({ length: pageSize }, (_, index) => entries[index] ?? null);

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
          {rows.map((entry, index) =>
            entry ? (
              <DiaryTableRow
                key={entry.id}
                entry={entry}
                isDeleting={deletingEntryId === entry.id}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <DiaryTablePlaceholderRow key={`placeholder-row-${index}`} />
            ),
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
