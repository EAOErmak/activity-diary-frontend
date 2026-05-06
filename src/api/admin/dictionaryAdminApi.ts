// src/api/admin/dictionaryAdminApi.ts
import api from "../http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AdminDictionaryListParams,
  AdminDictionaryListResponse,
  DictionaryCreate,
  DictionaryUpdate,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";

function filterDictionaryItemsByPrefix(
  items: DictionaryResponse[],
  query: string
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    item.label.toLocaleLowerCase().startsWith(normalizedQuery)
  );
}

function normalizeDictionaryListResponse(
  payload: AdminDictionaryListResponse | DictionaryResponse[],
  params: AdminDictionaryListParams
): AdminDictionaryListResponse {
  if (Array.isArray(payload)) {
    const page = params.page ?? 0;
    const limit = params.limit ?? 10;
    const filteredItems = filterDictionaryItemsByPrefix(
      payload,
      params.q ?? ""
    );
    const totalElements = filteredItems.length;
    const totalPages =
      totalElements === 0 ? 0 : Math.ceil(totalElements / limit);
    const startIndex = page * limit;
    const items = filteredItems.slice(startIndex, startIndex + limit);

    return {
      items,
      page,
      limit,
      totalElements,
      totalPages,
      hasNext: page + 1 < totalPages,
      hasPrevious: page > 0,
    };
  }

  return payload;
}

/* ===========================
   GET BY TYPE (ADMIN)
=========================== */

export const getDictionaryByTypeAdmin = async (
  params: AdminDictionaryListParams
): Promise<AdminDictionaryListResponse> => {
  const normalizedQuery = params.q?.trim() ?? "";
  const page = params.page ?? 0;
  const limit = params.limit ?? 10;
  const { data } = await api.get<
    ApiResponse<AdminDictionaryListResponse | DictionaryResponse[]>
  >(`/admin/dict/${params.type}`, {
    params: {
      page,
      limit,
      q: normalizedQuery,
    },
  });

  return normalizeDictionaryListResponse(data.data, {
    ...params,
    page,
    limit,
    q: normalizedQuery,
  });
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
