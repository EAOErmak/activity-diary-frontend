// ==============================
// ENUMS
// ==============================

export type EntryStatus = "ACTIVE" | "PLANNED" | "FINISHED";

// ==============================
// ACTIVITY ITEMS
// ==============================

export type ActivityItemCreateDto = {
  nameId: number;
  unitId: number;
  count: number;
};

export type ActivityItemUpdateDto = {
  id: number;
  nameId: number;
  unitId: number;
  count: number;
};

export type ActivityItemResponseDto = {
  id: number;
  nameId: number;
  name: string;
  unitId: number;
  unit: string;
  count: number;
};

// ==============================
// DIARY ENTRY
// ==============================

export type DiaryEntryCreateDto = {
  whatHappenedId: number;
  whatId: number;
  whenStarted?: string; // LocalDateTime → ISO string
  whenEnded?: string;
  howYouWereFeeling?: number; // Short
  anyDescription?: string;
  status?: EntryStatus;
  whatDidYouDo?: ActivityItemCreateDto[];
};

export type DiaryEntryUpdateDto = {
  whatHappenedId?: number;
  whatId?: number;
  whenStarted?: string;
  whenEnded?: string;
  howYouWereFeeling?: number;
  anyDescription?: string;
  status?: EntryStatus;
  whatDidYouDo?: ActivityItemUpdateDto[];
};

export type DiaryEntryDto = {
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
  status: EntryStatus;

  userId: number;

  whatDidYouDo: ActivityItemResponseDto[];

  createdAt: string; // Instant
  updatedAt: string; // Instant
};

// ==============================
// PAGINATION (SPRING PAGE)
// ==============================

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
