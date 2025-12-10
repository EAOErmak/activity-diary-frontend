export type AdminUserDto = {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "USER";
  enabled: boolean;
  accountLocked: boolean;
  lockUntil: string | null;
  failed2faAttempts: number;
  createdAt: string; // ISO
  chatId: number | null;
};

export type UpdateUserRoleDto = {
  role: "ADMIN" | "USER";
};
