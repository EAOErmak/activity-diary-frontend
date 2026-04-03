import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";

export const clearAdminDatabase = async (): Promise<string> => {
  const { data } = await api.post<ApiResponse<null>>("/admin/database/clear");
  return data.message ?? "Database cleared";
};
