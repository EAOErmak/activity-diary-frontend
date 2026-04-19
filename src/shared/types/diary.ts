// ==============================
// ENUMS
// ==============================

export type EntryStatus =
  | "FINISHED"
  | "FAILED"
  | "ACTIVE"
  | "PLANNED"
  | "OVERDUE"
  | "DELETED";

export type ManualEntryStatus = "FAILED" | "FINISHED" | "PLANNED";

// ==============================
// METRICS (NEW MODEL)
// ==============================

export type EntryMetricValue = {
  unitId: number
  unitName?: string
  value: number
}

export type EntryMetricCreate = {
  metricTypeId: number
  values: EntryMetricValue[]
}

export type EntryMetricUpdate = {
  id: number
  metricTypeId: number
  values: EntryMetricValue[]
}

export type EntryMetricResponse = {
  id: number
  metricTypeId: number
  metricTypeName: string
  values: EntryMetricValue[]
}


// ==============================
// ENTRY FIELD CONFIG
// ==============================

// ==============================
// DIARY ENTRY (CREATE / UPDATE)
// ==============================

export type DiaryEntryCreate = {
  whenStarted?: string
  whenEnded?: string
  mood?: number
  description?: string
  tags?: string[]
  metrics?: EntryMetricCreate[]
}

export type DiaryEntryUpdate = {
  whenStarted?: string
  whenEnded?: string
  mood?: number
  description?: string
  tags?: string
  status?: EntryStatus
  metrics?: (EntryMetricUpdate | EntryMetricCreate)[]
}

// ==============================
// DIARY ENTRY (READ)
// ==============================

export type DiaryEntry = {
  id: number;

  whenStarted: string | null;
  whenEnded: string | null;
  duration: number | null;

  mood: number | null;
  description: string | null;
  status: EntryStatus;
  firstTag?: string | null;

  userId: number;

  metrics: EntryMetricResponse[];

  createdAt: string;
  updatedAt: string;
};

export type DiaryEntryView = {
  id: number;
  whenStarted: string | null;
  whenEnded: string | null;
  status: EntryStatus;
  firstTag: string | null;
};

// ==============================
// PAGINATION
// ==============================

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
