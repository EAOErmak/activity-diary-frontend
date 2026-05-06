import api from "./http/axiosInstance";
import type { Tag } from "@/shared/types/tag";
import type {
  ApiResponse,
  DropdownOption,
  PageResponse,
} from "@/shared/types/api";
import { createEmptyPageResponse } from "@/shared/lib/entryDropdown";

export async function getAllTags(q?: string): Promise<Tag[]> {
  const { data } = await api.get<ApiResponse<Tag[]>>(
    "/tags",
    {
      params: q?.trim() ? { q: q.trim() } : undefined,
    }
  );
  return data.data;
}

type GetMetricsByTagIdsParams = {
  tagIds: number[];
  page: number;
  limit: number;
  q?: string;
};

export async function getMetricsByTagIds({
  tagIds,
  page,
  limit,
  q,
}: GetMetricsByTagIdsParams): Promise<PageResponse<DropdownOption>> {
  if (tagIds.length === 0) {
    return createEmptyPageResponse(page, limit);
  }

  const params = new URLSearchParams();
  tagIds.forEach((tagId) => {
    params.append("tagIds", String(tagId));
  });
  params.set("page", String(page));
  params.set("limit", String(limit));

  const normalizedQuery = q?.trim();
  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  const { data } = await api.get<ApiResponse<PageResponse<DropdownOption>>>(
    "/tags/metrics",
    { params }
  );

  return {
    ...data.data,
    items: data.data.items.map((metric) => ({
      id: metric.id,
      label: metric.label,
    })),
  };
}
