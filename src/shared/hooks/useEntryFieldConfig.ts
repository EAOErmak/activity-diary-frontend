// shared/hooks/useCategoryConfig.ts
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";

export function useEntryFieldConfig(categoryId?: number | null) {
  return useDictionaryRepository((s) =>
    s.getCategoryConfig(categoryId)
  );
}
