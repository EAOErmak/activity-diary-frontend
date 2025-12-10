import api from "../http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { EntryFieldConfig } from "@/shared/types/diary";

// ✅ ПОЛУЧИТЬ ВСЕ КОНФИГИ
export const getAllAdminEntryConfigs = async (): Promise<EntryFieldConfig[]> => {
  const { data } = await api.get<ApiResponse<EntryFieldConfig[]>>(
    "/admin/entry-config"
  );
  return data.data;
};

// ✅ СОЗДАТЬ НОВЫЙ КОНФИГ
export const createAdminEntryConfig = async (
  payload: EntryFieldConfig
): Promise<EntryFieldConfig> => {
  const { data } = await api.post<ApiResponse<EntryFieldConfig>>(
    "/admin/entry-config",
    payload
  );
  return data.data;
};

// ✅ ОБНОВИТЬ КОНФИГ
export const updateAdminEntryConfig = async (
  id: number,
  payload: EntryFieldConfig
): Promise<EntryFieldConfig> => {
  const { data } = await api.put<ApiResponse<EntryFieldConfig>>(
    `/admin/entry-config/${id}`,
    payload
  );
  return data.data;
};
