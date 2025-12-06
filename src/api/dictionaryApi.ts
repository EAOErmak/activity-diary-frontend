// src/api/dictionaryApi.ts
import api from "./http/axiosInstance";
import type {
  DictionaryItem,
  DictionaryResponse,
  DictionaryType,
} from "@/shared/types/dictionary";
import type { ApiResponse } from "@/shared/types/api";

const mapDictionary = (d: DictionaryResponse): DictionaryItem => ({
  id: d.id,
  name: d.label,
});

// ============================
// БАЗОВЫЕ ЗАПРОСЫ
// ============================

const getByType = async (type: DictionaryType): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>(
    `/dict/${type}`
  );
  return r.data.data.map(mapDictionary);
};

const getByTypeAndParent = async (
  type: DictionaryType,
  parentId: number
): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>(
    `/dict/${type}`,
    {
      params: { parentId },
    }
  );

  return r.data.data.map(mapDictionary);
};

// ============================
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ============================

// ✅ WHAT_HAPPENED — без parent
export const getWhatHappened = async (): Promise<DictionaryItem[]> => {
  return getByType("WHAT_HAPPENED");
};

// ✅ WHAT — СТРОГО по parentId (ОБЯЗАТЕЛЕН)
export const getWhatByParent = async (
  parentId: number
): Promise<DictionaryItem[]> => {
  if (!parentId) {
    throw new Error("parentId is required for WHAT");
  }

  return getByTypeAndParent("WHAT", parentId);
};

// ✅ ITEM_NAME
export const getItemNames = async (): Promise<DictionaryItem[]> => {
  return getByType("ITEM_NAME");
};

// ✅ UNIT
export const getUnits = async (): Promise<DictionaryItem[]> => {
  return getByType("UNIT");
};

export const dictionaryApi = {
  getWhatHappened,
  getWhatByParent,
  getItemNames,
  getUnits,
};
