import api from "./http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  DiaryEntryTemplateCreate,
  DiaryEntryTemplateUpdate,
  DiaryEntryTemplate,
  DiaryEntryTemplateView,
} from "@/shared/types/entryTemplate";

function isValidHourMinute(hour: number, minute: number): boolean {
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function toTimeString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeLocalTime(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const match = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d{1,9})?)?$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return isValidHourMinute(hour, minute) ? toTimeString(hour, minute) : null;
  }

  if (Array.isArray(value)) {
    const [rawHour, rawMinute] = value;
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    return isValidHourMinute(hour, minute) ? toTimeString(hour, minute) : null;
  }

  if (typeof value === "object") {
    const obj = value as { hour?: unknown; minute?: unknown };
    const hour = Number(obj.hour);
    const minute = Number(obj.minute);
    return isValidHourMinute(hour, minute) ? toTimeString(hour, minute) : null;
  }

  return null;
}

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

  const normalized = dto as DiaryEntryTemplate & {
    timeStart?: unknown;
    timeEnd?: unknown;
  };

  return {
    ...normalized,
    timeStart: normalizeLocalTime(normalized.timeStart),
    timeEnd: normalizeLocalTime(normalized.timeEnd),
  };
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
