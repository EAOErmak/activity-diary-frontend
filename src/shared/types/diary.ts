// ==============================
// ENUMS
// ==============================

export type EntryStatus = "WIN" | "LOSE" | "DELETED";

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

export type EntryFieldConfig = {
  id?: number;
  name: string;

  showSubCategory: boolean;
  showMetrics: boolean;
  showMood: boolean;
  showDescription: boolean;

  requiredSubCategory: boolean;
  requiredMetrics: boolean;
};

// ==============================
// DIARY ENTRY (CREATE / UPDATE)
// ==============================

export type DiaryEntryCreate = {
  categoryId: number
  subCategoryId: number | null
  whenStarted?: string
  whenEnded?: string
  mood?: number
  description?: string
  tags?: string[]
  metrics?: EntryMetricCreate[]
}

export type DiaryEntryUpdate = {
  categoryId?: number
  subCategoryId?: number
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

  categoryId: number;
  categoryName: string;

  subCategoryId: number;
  subCategoryName: string;

  whenStarted: string | null;
  whenEnded: string | null;
  duration: number | null;

  mood: number | null;
  description: string | null;
  status: EntryStatus;

  userId: number;

  metrics: EntryMetricResponse[];

  createdAt: string;
  updatedAt: string;
};

export type DiaryEntryView = {
  id: number;
  categoryName: string;
  subCategoryName?: string | null;
  whenStarted: string | null;
  whenEnded: string | null;
  status: EntryStatus;
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
