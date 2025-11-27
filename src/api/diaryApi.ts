import api from "./axiosInstance";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  DiaryEntryResponse,
  Page,
} from "../types/diary";

// ==============================
// GET MY ENTRIES (PAGE)
// ==============================
export const getMyEntries = async (
  page = 0,
  size = 20
): Promise<Page<DiaryEntryResponse>> => {
  const r = await api.get("/diary/mine", {
    params: { page, size },
  });

  return r.data.data; // ApiResponse<Page<DiaryEntryResponse>>
};

// ==============================
// GET ONE ENTRY
// ==============================
export const getEntry = async (id: number): Promise<DiaryEntryResponse> => {
  const r = await api.get(`/diary/${id}`);
  return r.data.data; // ApiResponse<DiaryEntryResponse>
};

// ==============================
// CREATE
// ==============================
export const createEntry = async (
  payload: DiaryEntryCreate
): Promise<DiaryEntryResponse> => {
  const r = await api.post("/diary", payload);
  return r.data.data;
};

// ==============================
// UPDATE
// ==============================
export const updateEntry = async (
  id: number,
  payload: DiaryEntryUpdate
): Promise<DiaryEntryResponse> => {
  const r = await api.put(`/diary/${id}`, payload);
  return r.data.data;
};

// ==============================
// DELETE
// ==============================
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
