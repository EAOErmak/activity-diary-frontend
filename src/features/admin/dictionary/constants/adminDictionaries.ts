import type { DictionaryType } from "@/shared/types/dictionary";

export type AdminDictionaryType = DictionaryType;

export const ADMIN_DICTIONARY_TYPES: {
  value: AdminDictionaryType;
  label: string;
}[] = [
  { value: "METRIC_NAME", label: "Название активности" },
  { value: "METRIC_UNIT", label: "Единицы измерения" },
];
