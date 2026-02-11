import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DayTemplateCreate,
  DayTemplateUpdate,
  DayTemplateView,
  WeekTemplateCreate,
  WeekTemplateUpdate,
  WeekTemplateView,
} from "@/shared/types/scheduleTemplate";

type PageResponse<T> = {
  content?: T[];
};

const unwrapData = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const extractPageContent = <T>(payload: unknown): T[] => {
  const unwrapped = unwrapData<PageResponse<T> | T[]>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray(unwrapped.content)
  ) {
    return unwrapped.content;
  }

  return [];
};

export const createDayTemplate = async (
  payload: DayTemplateCreate
): Promise<DayTemplateView> => {
  const { data } = await api.post<ApiResponse<DayTemplateView> | DayTemplateView>(
    "/day-templates",
    payload
  );

  return unwrapData<DayTemplateView>(data);
};

export const createWeekTemplate = async (
  payload: WeekTemplateCreate
): Promise<WeekTemplateView> => {
  const { data } = await api.post<ApiResponse<WeekTemplateView> | WeekTemplateView>(
    "/week-templates",
    payload
  );

  return unwrapData<WeekTemplateView>(data);
};

export const listDayTemplates = async (
  page = 0,
  size = 20
): Promise<DayTemplateView[]> => {
  const { data } = await api.get<
    ApiResponse<PageResponse<DayTemplateView> | DayTemplateView[]> | PageResponse<DayTemplateView> | DayTemplateView[]
  >(
    "/day-templates",
    { params: { page, size } }
  );

  return extractPageContent<DayTemplateView>(data);
};

export const listWeekTemplates = async (
  page = 0,
  size = 20
): Promise<WeekTemplateView[]> => {
  const { data } = await api.get<
    ApiResponse<PageResponse<WeekTemplateView> | WeekTemplateView[]> | PageResponse<WeekTemplateView> | WeekTemplateView[]
  >(
    "/week-templates",
    { params: { page, size } }
  );

  return extractPageContent<WeekTemplateView>(data);
};

export const deleteDayTemplate = async (id: number): Promise<void> => {
  await api.delete(`/day-templates/${id}`);
};

export const deleteWeekTemplate = async (id: number): Promise<void> => {
  await api.delete(`/week-templates/${id}`);
};

export const updateDayTemplate = async (
  id: number,
  payload: DayTemplateUpdate
): Promise<DayTemplateView> => {
  const { data } = await api.put<ApiResponse<DayTemplateView> | DayTemplateView>(
    `/day-templates/${id}`,
    payload
  );

  return unwrapData<DayTemplateView>(data);
};

export const updateWeekTemplate = async (
  id: number,
  payload: WeekTemplateUpdate
): Promise<WeekTemplateView> => {
  const { data } = await api.put<ApiResponse<WeekTemplateView> | WeekTemplateView>(
    `/week-templates/${id}`,
    payload
  );

  return unwrapData<WeekTemplateView>(data);
};

export const scheduleTemplateApi = {
  createDayTemplate,
  createWeekTemplate,
  listDayTemplates,
  listWeekTemplates,
  updateDayTemplate,
  updateWeekTemplate,
  deleteDayTemplate,
  deleteWeekTemplate,
};
