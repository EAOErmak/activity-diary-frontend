import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import type { DictionaryEntity } from "@/shared/types/dictionary";

export function useSubCategories(parentId?: number): DictionaryEntity[] {
  const entities = useDictionaryRepository(
    (s) => s.getType("SUB_CATEGORY")
  );

  if (parentId == null) return [];

  return entities.filter((e) => e.parentId === parentId);
}
