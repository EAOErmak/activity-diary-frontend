import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type { UserDto } from "@/shared/types/user";

// ==============================
// GET CURRENT USER (ME)
// ==============================
export const getCurrentUser = async (): Promise<UserDto> => {
  const { data } = await api.get<ApiResponse<UserDto>>(
    "/user/me"
  );

  return data.data;
};

// ==============================
// UPDATE PROFILE (FULL NAME)
// PUT /users/profile
// ==============================
export const updateProfile = async (
  payload: { fullName: string }
): Promise<void> => {
  await api.put("/user/profile", payload);
};

// ==============================
// CHANGE USERNAME
// PUT /users/username
// ==============================
export const changeUsername = async (
  payload: { newUsername: string }
): Promise<void> => {
  await api.put("/user/username", payload);
};

// ==============================
// CHANGE PASSWORD
// PUT /users/password
// ==============================
export const changePassword = async (
  payload: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<void> => {
  await api.put("/user/password", payload);
};

// ==============================
// SINGLE EXPORT OBJECT
// ==============================
export const profileApi = {
  getCurrentUser,
  updateProfile,
  changeUsername,
  changePassword,
};
