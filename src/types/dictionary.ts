// src/types/dictionary.ts

// То, что возвращает /api/dict/* (DictionaryResponseDto)
export type DictionaryResponse = {
  id: number;
  name: string;
  isActive: boolean;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
};

// Упрощённый тип для селектов
export type DictionaryItem = {
  id: number;
  name: string;
};
