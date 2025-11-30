// src/shared/types/adminDictionary.ts

import type { DictionaryType } from "./dictionary";

export type DictionaryCreateDto = {
  type: DictionaryType;
  label: string;
  allowedRole?: string | null;
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
