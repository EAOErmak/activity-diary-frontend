import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DiaryEntryTemplateCreate,
  DiaryEntryTemplateUpdate,
  DiaryEntryTemplate,
  DiaryEntryTemplateView,
} from "@/shared/types/entryTemplate";

export const createEntryTemplate = async (
  payload: DiaryEntryTemplateCreate
): Promise<DiaryEntryTemplateView> => {
  const { data } = await api.post<ApiResponse<DiaryEntryTemplateView>>(
    "/entry-templates",
    payload
  );

  return data.data;
};

export const listEntryTemplates = async (
  page = 0,
  size = 20
): Promise<DiaryEntryTemplateView[]> => {
  const { data } = await api.get(
    "/entry-templates",
    { params: { page, size } }
  );

  const payload = (data as any)?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

export const getEntryTemplate = async (
  id: number
): Promise<DiaryEntryTemplate> => {
  const { data } = await api.get(`/entry-templates/${id}`);

  const payload = (data as any)?.data ?? data;

  // если вдруг сервер завернул еще глубже
  const dto = (payload as any)?.data ?? payload;

  if (!dto || typeof dto !== "object") {
    throw new Error("Empty/invalid response for getEntryTemplate");
  }

  return dto as DiaryEntryTemplate;
};


export const updateEntryTemplate = async (
  id: number,
  payload: DiaryEntryTemplateUpdate
): Promise<DiaryEntryTemplateView> => {
  const { data } = await api.put<ApiResponse<DiaryEntryTemplateView>>(
    `/entry-templates/${id}`,
    payload
  );
  return data.data;
};

export const deleteEntryTemplate = async (
  id: number
): Promise<void> => {
  await api.delete(`/entry-templates/${id}`);
};

export const entryTemplateApi = {
  createEntryTemplate,
  listEntryTemplates,
  getEntryTemplate,
  updateEntryTemplate,
  deleteEntryTemplate,
};
