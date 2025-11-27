export type DiaryEntryCreate = {
  whatHappenedId: number;
  whatId: number;
  whenStarted?: string;
  whenEnded?: string;
  howYouWereFeeling?: number;
  anyDescription?: string;
  status?: "ACTIVE" | "PLANNED" | "FINISHED";
  whatDidYouDo?: {
    nameId: number;
    unitId: number;
    count: number;
  }[];
};

export type DiaryEntryUpdate = Partial<DiaryEntryCreate> & {
  whatDidYouDo?: {
    id: number;
    nameId: number;
    unitId: number;
    count: number;
  }[];
};

export type DiaryEntryResponse = {
  id: number;
  whatHappenedId: number;
  whatHappenedName: string;
  whatId: number;
  whatName: string;
  whenStarted: string | null;
  whenEnded: string | null;
  duration: number | null;
  howYouWereFeeling: number | null;
  anyDescription: string | null;
  status: string;
  userId: number;
  whatDidYouDo: {
    id: number;
    nameId: number;
    name: string;
    unitId: number;
    unit: string;
    count: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
