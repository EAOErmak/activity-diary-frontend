// src/api/admin/dictionaryAdminApi.ts
import api from "../http/axiosInstance";
import type {
  DictionaryCreateDto,
  DictionaryUpdateDto,
  DictionaryResponseDto,
} from "@/shared/types/adminDictionary";
import type { ApiResponse } from "@/shared/types/api";
import type { DictionaryType } from "@/shared/types/dictionary";

/* ===========================
   GET BY TYPE (ADMIN)
=========================== */

export const getDictionaryByTypeAdmin = async (
  type: DictionaryType
): Promise<DictionaryResponseDto[]> => {
  const r = await api.get<ApiResponse<DictionaryResponseDto[]>>(
    `/admin/dict/${type}`
  );
  return r.data.data;
};

/* ===========================
   CREATE
=========================== */

export const createDictionaryItem = async (
  dto: DictionaryCreateDto
): Promise<DictionaryResponseDto> => {
  const r = await api.post<ApiResponse<DictionaryResponseDto>>(
    "/admin/dict",
    dto
  );
  return r.data.data;
};

/* ===========================
   UPDATE
=========================== */

export const updateDictionaryItem = async (
  id: number,
  dto: DictionaryUpdateDto
): Promise<DictionaryResponseDto> => {
  const r = await api.put<ApiResponse<DictionaryResponseDto>>(
    `/admin/dict/${id}`,
    dto
  );
  return r.data.data;
};

/* ===========================
   SEARCH (ADMIN)
=========================== */

export const searchDictionaryAdmin = async (
  q: string
): Promise<DictionaryResponseDto[]> => {
  const r = await api.get<ApiResponse<DictionaryResponseDto[]>>(
    "/admin/dict/search",
    { params: { q } }
  );
  return r.data.data;
};
