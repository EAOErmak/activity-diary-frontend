// ==============================
// ENUMS
// ==============================

export type DictionaryType =
  | "CATEGORY"
  | "SUB_CATEGORY"
  | "METRIC_NAME"
  | "METRIC_UNIT";
  
// ==============================
// BACKEND DTO
// ==============================

export type DictionaryResponse = {
  id: number;
  type: DictionaryType;
  label: string;
  active: boolean;
  allowedRole: string | null;
  parentId?: number | null;

  entryFieldConfigId?: number | null;

  createdAt: string;
  updatedAt: string;
};

// ==============================
// FRONT UI MODEL
// ==============================

export type DictionaryItem = {
  id: number;
  name: string;
  entryFieldConfigId?: number | null;
};
