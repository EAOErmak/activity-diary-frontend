const TAG_CHARACTER_PATTERN = /^[\p{L}\p{N}_-]$/u;
const DESCRIPTION_TAG_PATTERN = /#\S+/gu;
const MAX_TAG_NAME_LENGTH = 64;

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

export function normalizeDescriptionTagName(raw: string | null | undefined) {
  if (raw == null) {
    return null;
  }

  let value = raw.trim().toLowerCase();
  const hadHash = value.startsWith("#");

  while (value.startsWith("#")) {
    value = value.slice(1);
  }

  value = value.trim();

  return hadHash ? `#${value}` : value;
}

export function isValidDescriptionTagName(
  value: string | null | undefined
) {
  if (value == null || value.trim() === "") {
    return false;
  }

  return (
    value.startsWith("#") &&
    value.length > 1 &&
    value.length <= MAX_TAG_NAME_LENGTH &&
    !/\s/u.test(value.slice(1))
  );
}

export function extractDescriptionTagNames(value: string) {
  const tagNames: string[] = [];
  const seen = new Set<string>();

  for (const match of value.matchAll(DESCRIPTION_TAG_PATTERN)) {
    const normalized = normalizeDescriptionTagName(match[0]);

    if (!isValidDescriptionTagName(normalized) || normalized == null) {
      continue;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      tagNames.push(normalized);
    }
  }

  return tagNames;
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

function stripLeadingHash(value: string) {
  return value.startsWith("#") ? value.slice(1) : value;
}

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
    const trimmedTag = stripLeadingHash(tag.trim());

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
