// src/api/dictionaryApi.ts
import api from "./http/axiosInstance";
import type {
  DictionaryItem,
  DictionaryResponse,
  DictionaryType,
} from "@/shared/types/dictionary";
import type { ApiResponse } from "@/shared/types/api";

const getByType = async (type: DictionaryType): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>(`/dict/${type}`);
  return r.data.data.map((d) => ({
    id: d.id,
    name: d.label,
  }));
};

// ========= ПУБЛИЧНЫЕ ФУНКЦИИ =========

// Что происходило (WHAT_HAPPENED)
export const getWhatHappened = async (): Promise<DictionaryItem[]> => {
  return getByType("WHAT_HAPPENED");
};

// Раньше было "по parentId", теперь back не использует parent,
// поэтому параметр просто игнорируем, а отдаём все WHAT.
export const getWhatByParent = async (
  parentId: number
): Promise<DictionaryItem[]> => {
  // parentId оставлен только для совместимости с существующим кодом
  void parentId;
  return getByType("WHAT");
};

// Активности (ITEM_NAME)
export const getItemNames = async (): Promise<DictionaryItem[]> => {
  return getByType("ITEM_NAME");
};

// Единицы измерения (UNIT)
export const getUnits = async (): Promise<DictionaryItem[]> => {
  return getByType("UNIT");
};

export const dictionaryApi = {
  getWhatHappened,
  getWhatByParent,
  getItemNames,
  getUnits,
};
