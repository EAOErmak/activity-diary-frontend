// ==============================
// ENUMS
// ==============================

export type EntryStatus = "DRAFT" | "FINAL" | "DELETED";


// ==============================
// ACTIVITY ITEMS
// ==============================

export type EntryMetricCreate = {
  metricId: number;
  unitId: number;
  value: number;
};

export type EntryMetricUpdate = {
  id: number;
  metricId: number;
  unitId: number;
  value: number;
};

export type EntryMetricResponse = {
  id: number;
  metricTypeId: number;
  metricTypeName: string;
  unitId: number;
  unitName: string;
  value: number;
};


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
  categoryId: number;
  subCategoryId: number | null;

  whenStarted?: string;
  whenEnded?: string;

  mood?: number;
  description?: string;

  metrics?: EntryMetricCreate[];
};

export type DiaryEntryUpdate = {
  categoryId?: number;
  subCategoryId?: number;

  whenStarted?: string;
  whenEnded?: string;

  mood?: number;
  description?: string;

  metrics?: (EntryMetricUpdate | EntryMetricCreate)[];
};

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
