import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { AdminUserDto, UpdateUserRoleDto, CreateUserByAdminPayload } from "@/shared/types/adminUser";

// 🔹 получить всех пользователей
export const getAllUsers = async (): Promise<AdminUserDto[]> => {
  const { data } = await api.get<ApiResponse<AdminUserDto[]>>("/admin/users");
  return data.data;
};

// 🔹 создать пользователя админом
export const createUserByAdmin = async (
  payload: CreateUserByAdminPayload
): Promise<void> => {
  await api.post("/admin/users", payload);
};

export const adminUsersApi = {
  createUserByAdmin,
};


// 🔹 смена роли
export const updateUserRole = async (
  userId: number,
  dto: UpdateUserRoleDto
): Promise<AdminUserDto> => {
  const { data } = await api.post<ApiResponse<AdminUserDto>>(
    `/admin/users/${userId}/role`,
    dto
  );
  return data.data;
};

// 🔹 включить / выключить пользователя
export const toggleUserEnabled = async (
  userId: number,
  enabled: boolean
): Promise<AdminUserDto> => {
  const { data } = await api.post<ApiResponse<AdminUserDto>>(
    `/admin/users/${userId}/block`,
    { enabled }
  );
  return data.data;
};

// 🔹 заблокировать / разблокировать
export const toggleUserLocked = async (
  userId: number,
  locked: boolean
): Promise<AdminUserDto> => {
  const { data } = await api.post<ApiResponse<AdminUserDto>>(
    `/admin/users/${userId}/unblock`,
    { locked }
  );
  return data.data;
};
