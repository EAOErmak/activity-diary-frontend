export type AdminUserDto = {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "USER" | "PREMIUM";
  enabled: boolean;
  accountLocked: boolean;
  lockUntil: string | null;
  failed2faAttempts: number;
  createdAt: string; // ISO
  chatId: number | null;
};

export type UpdateUserRoleDto = {
  role: "ADMIN" |  "PREMIUM" | "USER";
};

export type CreateUserByAdminPayload = {
  username: string;   // email / login
  password: string;
  fullName?: string;
  email?: string;
  role: "USER" | "PREMIUM" | "ADMIN";
};
