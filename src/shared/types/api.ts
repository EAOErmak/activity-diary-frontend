// src/shared/types/api.ts

// Обёртка, которая у тебя на бэке как ApiResponse<T>
export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};
