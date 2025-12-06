import api from "../http/axiosInstance";
import type { EntryFieldConfigDto } from "@/shared/types/diary";

// ✅ ПОЛУЧИТЬ ВСЕ КОНФИГИ
export const getAllAdminEntryConfigs = () => {
  return api.get<{
    data: EntryFieldConfigDto[];
  }>("/admin/entry-config");
};

// ✅ ПОЛУЧИТЬ ОДИН КОНФИГ ПО ID
//export const getAdminEntryConfigById = (id: number) => {
//  return api.get<{
//    data: EntryFieldConfigDto;
//  }>(`/admin/entry-config/${id}`);
//};

// ✅ СОЗДАТЬ НОВЫЙ КОНФИГ
export const createAdminEntryConfig = (payload: EntryFieldConfigDto) => {
  return api.post<{
    data: EntryFieldConfigDto;
  }>("/admin/entry-config", payload);
};

// ✅ ОБНОВИТЬ КОНФИГ
export const updateAdminEntryConfig = (
  id: number,
  payload: EntryFieldConfigDto
) => {
  return api.put<{
    data: EntryFieldConfigDto;
  }>(`/admin/entry-config/${id}`, payload);
};
