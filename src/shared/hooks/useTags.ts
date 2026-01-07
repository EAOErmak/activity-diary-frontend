import { useTagRepository } from "@/shared/repository/tagRepository";

export function useTags() {
  return useTagRepository((s) => s.data);
}
