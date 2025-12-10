import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { AdminUserDto, UpdateUserRoleDto } from "@/shared/types/adminUser";

// 🔹 получить всех пользователей
export const getAllUsers = async (): Promise<AdminUserDto[]> => {
  const { data } = await api.get<ApiResponse<AdminUserDto[]>>("/admin/users");
  return data.data;
};

// 🔹 смена роли
export const updateUserRole = async (
  userId: number,
  dto: UpdateUserRoleDto
): Promise<AdminUserDto> => {
  const { data } = await api.put<ApiResponse<AdminUserDto>>(
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
  const { data } = await api.put<ApiResponse<AdminUserDto>>(
    `/admin/users/${userId}/enabled`,
    { enabled }
  );
  return data.data;
};

// 🔹 заблокировать / разблокировать
export const toggleUserLocked = async (
  userId: number,
  locked: boolean
): Promise<AdminUserDto> => {
  const { data } = await api.put<ApiResponse<AdminUserDto>>(
    `/admin/users/${userId}/lock`,
    { locked }
  );
  return data.data;
};
