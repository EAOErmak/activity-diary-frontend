export type ActivityItemDTO = {
  id?: number;
  title: string;
  description?: string;
  count?: number;
};

export type DiaryEntryCreate = {
  whatHappened: string;
  what?: string;
  whenStarted?: string | null;
  whenEnded?: string | null;
  duration?: number;
  howYouWereFeeling?: number | null;
  anyDescription?: string;
  whatDidYouDo?: ActivityItemDTO[];
  status?: "ACTIVE" | "PLANNED" | "FINISHED";
};

export type DiaryEntryResponse = DiaryEntryCreate & {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId?: number;
};
