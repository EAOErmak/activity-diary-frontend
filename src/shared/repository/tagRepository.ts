import { create } from "zustand";
import type { Repository } from "./Repository";
import type { Tag } from "@/shared/types/tag";

type TagState = {
  data: Tag[];
  version: number;
  hydrate: () => void;
};

export const useTagRepository = create<TagState>(() => ({
  data: [],
  version: 0,
  hydrate: () => {
    const raw = localStorage.getItem("tags");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    useTagRepository.setState(parsed);
  },
}));

export const tagRepository: Repository<Tag[]> = {
  get() {
    return useTagRepository.getState();
  },

  set(data, version) {
    useTagRepository.setState({ data, version });
    localStorage.setItem(
      "tags",
      JSON.stringify({ data, version })
    );
  },
};
