// src/shared/types/dictionary.ts

export type DictionaryType = "WHAT" | "WHAT_HAPPENED" | "ITEM_NAME" | "UNIT";

// То, что реально приходит с бэка (DictionaryResponseDto)
export type DictionaryResponse = {
  id: number;
  type: DictionaryType;
  label: string;
  active: boolean;
  allowedRole: string | null;
  createdAt: string;
  updatedAt: string;
};

// Упрощённый тип для селектов
export type DictionaryItem = {
  id: number;
  name: string;
};
