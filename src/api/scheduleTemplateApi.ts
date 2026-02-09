import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DayTemplateCreate,
  WeekTemplateCreate,
  ScheduleTemplateView,
} from "@/shared/types/scheduleTemplate";

export const createDayTemplate = async (
  payload: DayTemplateCreate
): Promise<ScheduleTemplateView> => {
  const { data } = await api.post<ApiResponse<ScheduleTemplateView>>(
    "/templates/day",
    payload
  );

  return data.data;
};

export const createWeekTemplate = async (
  payload: WeekTemplateCreate
): Promise<ScheduleTemplateView> => {
  const { data } = await api.post<ApiResponse<ScheduleTemplateView>>(
    "/templates/week",
    payload
  );

  return data.data;
};

export const listTemplates = async (
  page = 0,
  size = 20
): Promise<ScheduleTemplateView[]> => {
  const { data } = await api.get(
    "/templates",
    { params: { page, size } }
  );

  const payload = (data as any)?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/templates/${id}`);
};

export const scheduleTemplateApi = {
  createDayTemplate,
  createWeekTemplate,
  listTemplates,
  deleteTemplate,
};
