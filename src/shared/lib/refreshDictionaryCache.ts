import { dictionaryApi } from "@/api/dictionaryApi";
import { useDictionaryRepository } from "@/shared/repository/dictionaryRepository";

export async function refreshDictionaryCache() {
  const { data, version } = await dictionaryApi.getAll();
  useDictionaryRepository.getState().setAll(data, version);
}
