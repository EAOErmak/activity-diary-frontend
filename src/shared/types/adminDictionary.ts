import type { DictionaryType } from "./dictionary";

export type DictionaryCreate = {
  type: DictionaryType;
  label: string;

  // ✅ доступ по ролям
  allowedRole?: string | null;

  // ✅ обязательно для SUB_CATEGORY
  parentId?: number | null;

  // ✅ обязательно для CATEGORY
  chartType?: "REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE";

  // ✅ НОВОЕ: привязка конфига
  entryFieldConfigId?: number;
};

export type DictionaryUpdate = {
  label?: string;
  active?: boolean;
  allowedRole?: string | null;
};

export type DictionaryResponse = {
  id: number;
  type: DictionaryType;
  label: string;
  active: boolean;
  allowedRole: string | null;

  chartType?: "REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE"; // ✅ ДОБАВИТЬ
  entryFieldConfigId?: number | null; // ✅ ДОБАВИТЬ

  createdAt: string;
  updatedAt: string;
};


export type DictionaryListItem = DictionaryResponse;
