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
  entryFieldConfigId: d.entryFieldConfigId ?? null,
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

// ✅ CATEGORY — без parent
export const getCategory = async (): Promise<DictionaryItem[]> => {
  return getByType("CATEGORY");
};

// ✅ SUB_CATEGORY — СТРОГО по parentId (ОБЯЗАТЕЛЕН)
export const getSubCategoryByParent = async (
  parentId: number
): Promise<DictionaryItem[]> => {
  if (parentId === null || parentId === undefined) {
    throw new Error("parentId is required");
  }

  return getByTypeAndParent("SUB_CATEGORY", parentId);
};

// ✅ ITEM_NAME
export const getMetrics = async (): Promise<DictionaryItem[]> => {
  return getByType("METRIC_NAME");
};

// ✅ UNIT
export const getUnits = async (): Promise<DictionaryItem[]> => {
  return getByType("METRIC_UNIT");
};

export const dictionaryApi = {
  getCategory,
  getSubCategoryByParent,
  getMetrics,
  getUnits,
};
