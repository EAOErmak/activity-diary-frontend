import api from "./http/axiosInstance";
import type { Tag } from "@/shared/types/tag";
import type { ApiResponse } from "@/shared/types/api";

export async function getAllTags(): Promise<Tag[]> {
  const { data } = await api.get<ApiResponse<Tag[]>>(
    "/tags"
  );
  return data.data;
}

