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

import { DiaryTableRow } from "./DiaryTableRow";

type Props = {
  entries: DiaryEntryView[];
  deletingEntryId: number | null;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTable({ entries, deletingEntryId, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="w-full shrink-0 overflow-hidden">
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
          {entries.map((entry) => (
            <DiaryTableRow
              key={entry.id}
              entry={entry}
              isDeleting={deletingEntryId === entry.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
