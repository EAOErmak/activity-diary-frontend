import api from "./http/axiosInstance";
import type {
  DiaryEntryCreateDto,
  DiaryEntryUpdateDto,
  DiaryEntryDto,
  EntryFieldConfigDto,
  Page,
} from "@/shared/types/diary";
import type { ApiResponse } from "@/shared/types/api";

// ==============================
// GET MY ENTRIES (PAGE)
// ==============================
export const getMyEntries = async (
  page = 0,
  size = 20
): Promise<Page<DiaryEntryDto>> => {
  const { data } = await api.get<ApiResponse<Page<DiaryEntryDto>>>(
    "/diary/mine",
    {
      params: { page, size },
    }
  );

  return data.data;
};

// ==============================
// GET ONE ENTRY
// ==============================
export const getEntry = async (id: number): Promise<DiaryEntryDto> => {
  const { data } = await api.get<ApiResponse<DiaryEntryDto>>(`/diary/${id}`);
  return data.data;
};

// ==============================
// CREATE
// ==============================
export const createEntry = async (
  payload: DiaryEntryCreateDto
): Promise<DiaryEntryDto> => {
  const { data } = await api.post<ApiResponse<DiaryEntryDto>>(
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
  payload: DiaryEntryUpdateDto
): Promise<DiaryEntryDto> => {
  const { data } = await api.put<ApiResponse<DiaryEntryDto>>(
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
// GET ENTRY FIELD CONFIG
// ==============================
export const getEntryFieldConfig = (whatHappenedId: number) => {
  return api.get<EntryFieldConfigDto>(
    `/diary/entry-config/${whatHappenedId}`
  );
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
  getEntryFieldConfig,
};
