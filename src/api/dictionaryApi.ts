// src/api/dictionaryApi.ts
import api from "./http/axiosInstance";
import type {
  DictionaryResponse,
  DictionaryType,
  DictionaryEntity,
} from "@/shared/types/dictionary";
import type {
  ApiResponse,
  DropdownOption,
  PageResponse,
} from "@/shared/types/api";

const mapDictionary = (d: DictionaryResponse): DictionaryEntity => ({
  id: d.id,
  type: d.type,
  label: d.label,
  parentId: d.parentId ?? null,
});

// ============================
// ALL (FOR SYNC)
// ============================

export const getAll = async (): Promise<{
  data: Record<DictionaryType, DictionaryEntity[]>;
  version: number;
}> => {
  const { data } = await api.get<ApiResponse<DictionaryResponse[]>>(
    "/dict/all"
  );

  const grouped: Record<DictionaryType, DictionaryEntity[]> = {
    CATEGORY: [],
    SUB_CATEGORY: [],
    METRIC_NAME: [],
    METRIC_UNIT: [],
  };

  for (const d of data.data) {
    grouped[d.type].push({
      id: d.id,
      type: d.type,
      label: d.label,
      parentId: d.parentId ?? null,
    });
  }

  // ⬅️ версия словарей берётся ИЗ SYNC, не из dict/all
  return {
    data: grouped,
    version: 0,
  };
};

// ============================
// LEGACY (optional, can be removed later)
// ============================

const getByType = async (
  type: DictionaryType
): Promise<DictionaryEntity[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>(`/dict/${type}`);
  return r.data.data.map(mapDictionary);
};

const getByTypeAndParent = async (
  type: DictionaryType,
  parentId: number
): Promise<DictionaryEntity[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>(
    `/dict/${type}`,
    { params: { parentId } }
  );
  return r.data.data.map(mapDictionary);
};

// ============================
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ============================

// ✅ CATEGORY — без parent
export const getCategory = async (): Promise<DictionaryEntity[]> => {
  return getByType("CATEGORY");
};

// ✅ SUB_CATEGORY — СТРОГО по parentId (ОБЯЗАТЕЛЕН)
export const getSubCategoryByParent = async (
  parentId: number
): Promise<DictionaryEntity[]> => {
  if (parentId === null || parentId === undefined) {
    throw new Error("parentId is required");
  }

  return getByTypeAndParent("SUB_CATEGORY", parentId);
};

// ✅ ITEM_NAME
export const getMetrics = async (): Promise<DictionaryEntity[]> => {
  return getByType("METRIC_NAME");
};

// ✅ UNIT
export const getUnits = async (): Promise<DictionaryEntity[]> => {
  return getByType("METRIC_UNIT");
};

type GetUnitsByMetricNameIdParams = {
  metricNameId: number;
  page: number;
  limit: number;
  q?: string;
};

export const getUnitsByMetricNameId = async (
  params: GetUnitsByMetricNameIdParams
): Promise<PageResponse<DropdownOption>> => {
  const { metricNameId, page, limit, q } = params;
  const normalizedQuery = q?.trim();

  const { data } = await api.get<ApiResponse<PageResponse<DropdownOption>>>(
    `/dictionary/metric-names/${metricNameId}/units`,
    {
      params: {
        page,
        limit,
        ...(normalizedQuery ? { q: normalizedQuery } : {}),
      },
    }
  );

  return {
    ...data.data,
    items: data.data.items.map((unit) => ({
      id: unit.id,
      label: unit.label,
    })),
  };
};

export const dictionaryApi = {
  getCategory,
  getSubCategoryByParent,
  getMetrics,
  getUnits,
  getUnitsByMetricNameId,
  getAll,
};
