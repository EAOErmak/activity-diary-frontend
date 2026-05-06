import type { DropdownOption, PageResponse } from "@/shared/types/api";

export const ENTRY_DROPDOWN_PAGE_LIMIT = 6;
export const ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS = 300;

export function createEmptyPageResponse<T>(
  page: number,
  limit: number
): PageResponse<T> {
  return {
    items: [],
    page,
    limit,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  };
}

export async function collectExistingDropdownOptionIds(
  optionIds: ReadonlyArray<number | null | undefined>,
  fetchPage: (page: number) => Promise<PageResponse<DropdownOption>>
) {
  const unresolvedIds = new Set(
    optionIds.filter((id): id is number => typeof id === "number")
  );
  const resolvedIds = new Set<number>();

  if (unresolvedIds.size === 0) {
    return resolvedIds;
  }

  let page = 0;

  while (unresolvedIds.size > 0) {
    const response = await fetchPage(page);

    response.items.forEach((item) => {
      if (unresolvedIds.delete(item.id)) {
        resolvedIds.add(item.id);
      }
    });

    if (!response.hasNext) {
      break;
    }

    page += 1;
  }

  return resolvedIds;
}
