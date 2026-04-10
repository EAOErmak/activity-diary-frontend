import type { ReactNode } from "react";

import { TableCell, TableRow } from "@/shared/components/ui/table";

type Props = {
  indicator: ReactNode;
  category: ReactNode;
  date: ReactNode;
  status: ReactNode;
  actions: ReactNode;
};

export function DiaryTableRowLayout({
  indicator,
  category,
  date,
  status,
  actions,
}: Props) {
  return (
    <TableRow>
      <TableCell className="w-1 p-0">{indicator}</TableCell>
      <TableCell className="text-surfaceForeground/80">{category}</TableCell>
      <TableCell className="text-mutedForeground">{date}</TableCell>
      <TableCell>{status}</TableCell>
      <TableCell className="text-right space-x-2">{actions}</TableCell>
    </TableRow>
  );
}
