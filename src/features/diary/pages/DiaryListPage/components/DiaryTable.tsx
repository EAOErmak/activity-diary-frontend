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

export function DiaryTable({ entries }: { entries: DiaryEntryView[] }) {
  return (
    <Card className="max-w-6xl mx-auto overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>ID</TableHead>
            <TableHead>Подкатегория</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.map((e) => (
            <DiaryTableRow key={e.id} entry={e} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
