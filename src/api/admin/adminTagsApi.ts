import api from "../http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { Tag } from "@/shared/types/tag";

type Slice<T> = {
  content: T[];
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export const getAdminTags = async (
  page = 0,
  size = 20,
  q?: string
): Promise<Slice<Tag>> => {
  const { data } = await api.get<ApiResponse<Slice<Tag>>>(
    "/admin/tags",
    { params: { page, size, q } }
  );
  return data.data;
};

export const approveTag = async (id: number): Promise<void> => {
  await api.post(`/admin/tags/${id}/approve`);
};

export const rejectTag = async (id: number): Promise<void> => {
  await api.post(`/admin/tags/${id}/reject`);
};

export const deprecateTag = async (id: number): Promise<void> => {
  await api.post(`/admin/tags/${id}/deprecate`);
};
