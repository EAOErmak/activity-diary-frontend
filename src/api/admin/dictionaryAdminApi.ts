// src/api/admin/dictionaryAdminApi.ts
import api from "../http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DictionaryCreate,
  DictionaryUpdate,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";
import type { DictionaryType } from "@/shared/types/dictionary";

/* ===========================
   GET BY TYPE (ADMIN)
=========================== */

export const getDictionaryByTypeAdmin = async (
  type: DictionaryType
): Promise<DictionaryResponse[]> => {
  const { data } = await api.get<ApiResponse<DictionaryResponse[]>>(
    `/admin/dict/${type}`
  );
  return data.data;
};

/* ===========================
   CREATE
=========================== */

export const createDictionaryItem = async (
  dto: DictionaryCreate
): Promise<DictionaryResponse> => {
  const { data } = await api.post<ApiResponse<DictionaryResponse>>(
    "/admin/dict",
    dto
  );
  return data.data;
};

/* ===========================
   UPDATE
=========================== */

export const updateDictionaryItem = async (
  id: number,
  dto: DictionaryUpdate
): Promise<DictionaryResponse> => {
  const { data } = await api.put<ApiResponse<DictionaryResponse>>(
    `/admin/dict/${id}`,
    dto
  );
  return data.data;
};

/* ===========================
   SEARCH (ADMIN)
=========================== */

export const searchDictionaryAdmin = async (
  q: string
): Promise<DictionaryResponse[]> => {
  const { data } = await api.get<ApiResponse<DictionaryResponse[]>>(
    "/admin/dict/search",
    { params: { q } }
  );
  return data.data;
};
