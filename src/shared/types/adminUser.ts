export type AdminUserDto = {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "USER";
  enabled: boolean;
  accountLocked: boolean;
  createdAt: string; // Instant → ISO string
  chatId: number | null;
};

export type UpdateUserRoleDto = {
  role: "ADMIN" | "USER";
};