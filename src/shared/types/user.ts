export type UserDto = {
  id: number;
  username: string;
  fullName: string;
  role: "USER" | "ADMIN" | "PREMIUM";
  enabled: boolean;
};
