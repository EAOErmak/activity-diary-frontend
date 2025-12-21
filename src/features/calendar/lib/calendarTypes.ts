import type { EntryStatus } from "@/shared/types/diary";

export type CalendarEvent = {
  id: number;
  start: Date;
  end: Date;

  categoryName: string;
  subCategoryName?: string | null;

  status: EntryStatus;
};
