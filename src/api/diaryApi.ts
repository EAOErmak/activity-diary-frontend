import api from "./axiosInstance";
import type { DiaryEntryCreate, DiaryEntryResponse } from "../types/diary";

export const getMyEntries = async (): Promise<DiaryEntryResponse[]> => {
  const r = await api.get("/diary/mine");
  return r.data;
};

export const getEntry = async (id: number): Promise<DiaryEntryResponse> => {
  const r = await api.get(`/diary/${id}`);
  return r.data;
};

export const createEntry = async (payload: DiaryEntryCreate): Promise<DiaryEntryResponse> => {
  const r = await api.post("/diary", payload);
  return r.data;
};

export const updateEntry = async (id: number, payload: DiaryEntryCreate): Promise<DiaryEntryResponse> => {
  const r = await api.put(`/diary/${id}`, payload);
  return r.data;
};

export const deleteEntry = async (id: number): Promise<void> => {
  await api.delete(`/diary/${id}`);
};

export const diaryApi = {
  getMyEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
};