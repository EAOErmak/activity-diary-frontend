export type DropdownOption = {
  id: number;
  label: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T;
};
