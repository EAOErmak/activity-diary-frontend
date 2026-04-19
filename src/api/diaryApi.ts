import api from "./http/axiosInstance";
import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  DiaryEntry,
  Page,
  DiaryEntryView,
} from "@/shared/types/diary";
import type { ApiResponse } from "@/shared/types/api";
import type { UiStatus } from "@/shared/lib/uiStatus";

// ==============================
// GET MY ENTRIES (PAGE)
// ==============================
type DiaryMineFilters = {
  uiStatus?: UiStatus;
  now?: string;
  tags?: string[];
  from?: string;
  to?: string;
};

export const getMyEntries = async (
  page = 0,
  size = 20,
  filters: DiaryMineFilters = {}
): Promise<Page<DiaryEntryView>> => {
  const { data } = await api.get<ApiResponse<Page<DiaryEntryView>>>(
    "/diary/mine",
    {
      params: { page, size, ...filters },
    }
  );

  return data.data;
};

// ==============================
// GET WEEK (CALENDAR)
// ==============================
export const getEntriesByRange = async (
  from: string,
  to: string
): Promise<DiaryEntryView[]> => {
  const { data } = await api.get<ApiResponse<DiaryEntryView[]>>(
    "/diary/range",
    { params: { from, to } }
  );
  return data.data;
};

// ==============================
// GET ONE ENTRY
// ==============================
export const getEntry = async (id: number): Promise<DiaryEntry> => {
  const { data } = await api.get<ApiResponse<DiaryEntry>>(`/diary/${id}`);
  return data.data;
};

// ==============================
// CREATE
// ==============================
export const createEntry = async (
  payload: DiaryEntryCreate
): Promise<DiaryEntry> => {
  const { data } = await api.post<ApiResponse<DiaryEntry>>(
    "/diary",
    payload
  );

  return data.data;
};

// ==============================
// UPDATE
// ==============================
export const updateEntry = async (
  id: number,
  payload: DiaryEntryUpdate
): Promise<DiaryEntry> => {
  const { data } = await api.put<ApiResponse<DiaryEntry>>(
    `/diary/${id}`,
    payload
  );

  return data.data;
};

// ==============================
// DELETE
// ==============================
export const deleteEntry = async (id: number): Promise<void> => {
  await api.delete(`/diary/${id}`);
};


// ==============================
// SINGLE EXPORT OBJECT
// ==============================
export const diaryApi = {
  getMyEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getEntriesByRange,
};
