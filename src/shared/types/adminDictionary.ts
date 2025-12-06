// src/shared/types/adminDictionary.ts

import type { DictionaryType } from "./dictionary";

export type DictionaryCreateDto = {
  type: DictionaryType;
  label: string;

  // ✅ доступ по ролям
  allowedRole?: string | null;

  // ✅ обязательно для WHAT
  parentId?: number | null;

  // ✅ обязательно для WHAT_HAPPENED
  chartType?: "REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE";

  // ✅ НОВОЕ: привязка конфига
  entryFieldConfigId?: number;
};

export type DictionaryUpdateDto = {
  label?: string;
  active?: boolean;
  allowedRole?: string | null;
};

export type DictionaryResponseDto = {
  id: number;
  type: DictionaryType;
  label: string;
  active: boolean;
  allowedRole: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DictionaryListItemDto = DictionaryResponseDto;
