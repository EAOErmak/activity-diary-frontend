const TAG_CHARACTER_PATTERN = /^[\p{L}\p{N}_-]$/u;

export type ActiveDescriptionTag = {
  hashIndex: number;
  query: string;
  cursorIndex: number;
};

function isTagCharacter(character: string | undefined) {
  if (!character) {
    return false;
  }

  return TAG_CHARACTER_PATTERN.test(character);
}

export function findActiveDescriptionTag(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null = selectionStart
): ActiveDescriptionTag | null {
  if (
    selectionStart == null ||
    selectionEnd == null ||
    selectionStart !== selectionEnd
  ) {
    return null;
  }

  const cursorIndex = selectionStart;
  const hashIndex = value.lastIndexOf("#", cursorIndex - 1);

  if (hashIndex === -1) {
    return null;
  }

  if (isTagCharacter(value[hashIndex - 1])) {
    return null;
  }

  const query = value.slice(hashIndex + 1, cursorIndex);

  if (!query) {
    return null;
  }

  if ([...query].some((character) => !isTagCharacter(character))) {
    return null;
  }

  if (isTagCharacter(value[cursorIndex])) {
    return null;
  }

  return {
    hashIndex,
    query,
    cursorIndex,
  };
}

type CandidateTag = {
  name: string;
  normalizedName: string;
};

export function findBestMatchingTag(
  query: string,
  tags: readonly string[],
  locale?: string
): string | null {
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);

  if (!normalizedQuery) {
    return null;
  }

  const uniqueCandidates = new Map<string, CandidateTag>();

  for (const tag of tags) {
    const trimmedTag = tag.trim();

    if (!trimmedTag) {
      continue;
    }

    const normalizedName = trimmedTag.toLocaleLowerCase(locale);

    if (!uniqueCandidates.has(normalizedName)) {
      uniqueCandidates.set(normalizedName, {
        name: trimmedTag,
        normalizedName,
      });
    }
  }

  const matches = [...uniqueCandidates.values()]
    .filter(
      (candidate) =>
        candidate.normalizedName.startsWith(normalizedQuery) &&
        candidate.normalizedName !== normalizedQuery
    )
    .sort((left, right) => {
      const byContinuationLength =
        (left.normalizedName.length - normalizedQuery.length) -
        (right.normalizedName.length - normalizedQuery.length);

      if (byContinuationLength !== 0) {
        return byContinuationLength;
      }

      return left.name.localeCompare(right.name, locale, {
        sensitivity: "base",
      });
    });

  return matches[0]?.name ?? null;
}
