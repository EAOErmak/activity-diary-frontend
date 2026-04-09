import type { ReactNode } from "react";

import { TableCell, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type Props = {
  indicator: ReactNode;
  category: ReactNode;
  date: ReactNode;
  status: ReactNode;
  actions: ReactNode;
  isPlaceholder?: boolean;
};

export function DiaryTableRowLayout({
  indicator,
  category,
  date,
  status,
  actions,
  isPlaceholder = false,
}: Props) {
  return (
    <TableRow
      aria-hidden={isPlaceholder || undefined}
      className={cn(isPlaceholder && "pointer-events-none hover:bg-transparent")}
    >
      <TableCell className="w-1 p-0">{indicator}</TableCell>
      <TableCell className="text-surfaceForeground/80">{category}</TableCell>
      <TableCell className="text-mutedForeground">{date}</TableCell>
      <TableCell>{status}</TableCell>
      <TableCell className="text-right space-x-2">{actions}</TableCell>
    </TableRow>
  );
}
