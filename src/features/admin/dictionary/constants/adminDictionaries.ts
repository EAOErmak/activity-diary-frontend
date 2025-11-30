import type { DictionaryType } from "@/shared/types/dictionary";

export type AdminDictionaryType = DictionaryType;

export const ADMIN_DICTIONARY_TYPES: {
  value: AdminDictionaryType;
  label: string;
}[] = [
  { value: "WHAT_HAPPENED", label: "Что происходило" },
  { value: "WHAT", label: "Что делал" },
  { value: "ITEM_NAME", label: "Название активности" },
  { value: "UNIT", label: "Единицы измерения" },
];
