import type { DictionaryType } from "./dictionary";

export type DictionaryCreate = {
  type: DictionaryType;
  label: string;

  // ✅ доступ по ролям
  allowedRole?: string | null;
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

  createdAt: string;
  updatedAt: string;
};

export type DictionaryListItem = DictionaryResponse;

export type AdminDictionaryListResponse = {
  items: DictionaryResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type AdminDictionaryListParams = {
  type: DictionaryType;
  page?: number;
  limit?: number;
  q?: string;
};
