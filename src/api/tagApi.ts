import api from "./http/axiosInstance";
import type { Tag } from "@/shared/types/tag";
import type { ApiResponse } from "@/shared/types/api";
import type { DictionaryEntity } from "@/shared/types/dictionary";

type DictionaryOptionDto = Pick<DictionaryEntity, "id" | "label">;

export async function getAllTags(q?: string): Promise<Tag[]> {
  const { data } = await api.get<ApiResponse<Tag[]>>(
    "/tags",
    {
      params: q?.trim() ? { q: q.trim() } : undefined,
    }
  );
  return data.data;
}

export async function getMetricsByTags(
  tagIds: number[]
): Promise<DictionaryEntity[]> {
  if (tagIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams();
  tagIds.forEach((tagId) => {
    params.append("tagIds", String(tagId));
  });

  const { data } = await api.get<ApiResponse<DictionaryOptionDto[]>>(
    "/tags/metrics",
    { params }
  );

  return data.data.map((metric) => ({
    id: metric.id,
    type: "METRIC_NAME",
    label: metric.label,
    parentId: null,
  }));
}
