// src/api/dictionaryApi.ts
import api from "./axiosInstance";
import type { DictionaryItem, DictionaryResponse } from "@/types/dictionary";

type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

// WHAT HAPPENED
export const getWhatHappened = async (): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>("/dict/what-happened");
  return r.data.data.map((d) => ({ id: d.id, name: d.name }));
};

// WHAT (by parent)
export const getWhatByParent = async (
  parentId: number
): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>("/dict/what", {
    params: { parentId },
  });
  return r.data.data.map((d) => ({ id: d.id, name: d.name }));
};

// ITEM NAMES (activities)
export const getItemNames = async (): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>("/dict/item-name");
  return r.data.data.map((d) => ({ id: d.id, name: d.name }));
};

// UNITS
export const getUnits = async (): Promise<DictionaryItem[]> => {
  const r = await api.get<ApiResponse<DictionaryResponse[]>>("/dict/unit");
  return r.data.data.map((d) => ({ id: d.id, name: d.name }));
};

export const dictionaryApi = {
  getWhatHappened,
  getWhatByParent,
  getItemNames,
  getUnits,
};
