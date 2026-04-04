import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/shared/components/ui/table";
import { DiaryTableRow } from "./DiaryTableRow";
import type { DiaryEntryView } from "@/shared/types/diary";

type Props = {
  entries: DiaryEntryView[];
  deletingEntryId: number | null;
  onEdit: (id: number) => void;
  onDelete: (entry: DiaryEntryView) => Promise<void>;
};

export function DiaryTable({ entries, deletingEntryId, onEdit, onDelete }: Props) {
  return (
    <Card className="max-w-6xl mx-auto overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Категория</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
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
        </TableBody>
      </Table>
    </Card>
  );
}
