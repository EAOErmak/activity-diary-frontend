import axiosInstance from "@/api/http/axiosInstance";
import type {
  UserSyncStateResponse,
  GlobalSyncStateResponse,
} from "@/shared/types/sync";
import type { ApiResponse } from "@/shared/types/api";
import { useAuthStore } from "@/shared/store/authStore";

// =========================
// USER SYNC (user-scoped)
// =========================
export async function getUserSyncState(): Promise<UserSyncStateResponse | null> {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;

  const { data } = await axiosInstance.get<
    ApiResponse<UserSyncStateResponse>
  >("/sync/user");

  return data.data;
}

// =========================
// GLOBAL SYNC (global-scoped)
// =========================
export async function getGlobalSyncState(): Promise<GlobalSyncStateResponse | null> {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;

  const { data } = await axiosInstance.get<
    ApiResponse<GlobalSyncStateResponse>
  >("/sync/global");

  return data.data;
}
