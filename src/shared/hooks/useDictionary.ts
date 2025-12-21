import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";
import type {
  DictionaryType,
  DictionaryEntity,
} from "@/shared/types/dictionary";

export function useDictionary(type: DictionaryType): DictionaryEntity[] {
  return useDictionaryRepository((s) => s.getType(type));
}
