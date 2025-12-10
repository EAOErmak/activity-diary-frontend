import axiosInstance from "@/api/http/axiosInstance";
import type { SyncStateResponse } from "@/shared/types/sync";
import type { ApiResponse } from "@/shared/types/api";
import { useAuthStore } from "@/shared/store/authStore";

export async function getSyncState(): Promise<SyncStateResponse | null> {
  const { accessToken } = useAuthStore.getState();

  // ✅ НЕ СТУЧИМ БЕЗ ТОКЕНА — ЭТО УБИРАЕТ 401
  if (!accessToken) return null;

  const { data } = await axiosInstance.get<ApiResponse<SyncStateResponse>>(
    "/sync/state"
  );

  return data.data;
}
