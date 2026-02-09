import type { EntryStatus } from "@/shared/types/diary";

export type CalendarEvent = {
  id: number;
  start: Date;
  end: Date;

  firstTag?: string | null;

  status: EntryStatus;
};
