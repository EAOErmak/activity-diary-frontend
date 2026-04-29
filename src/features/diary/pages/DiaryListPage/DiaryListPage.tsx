import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useDiaryActions } from "@/features/diary/hooks/useDiary";
import { DiaryListHeader } from "@/features/diary/pages/DiaryListPage/components/DiaryListHeader";
import { DiaryListFilters } from "@/features/diary/pages/DiaryListPage/components/DiaryListFilters";
import { CreateEntryDialog } from "@/features/diary/components/CreateEntryDialog";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";
import { DiaryTable } from "@/features/diary/pages/DiaryListPage/components/DiaryTable";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { diaryKeys } from "@/shared/lib/queryKeys";
import { cn } from "@/shared/lib/utils";
import type { DiaryEntryView, EntryStatus, Page } from "@/shared/types/diary";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;
const DIARY_LIST_STALE_TIME_MS = 30_000;

function shiftCalendarDay(baseDate: Date | undefined, amount: number) {
  const nextDate = baseDate ? new Date(baseDate) : new Date();
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function buildPaginationItems(totalPages: number, currentPage: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ] as const;
}

type PaginationMeta = {
  totalPages: number;
  totalElements: number;
};

function resolvePaginationMeta(result: Pick<Page<DiaryEntryView>, "content" | "totalElements" | "totalPages">, page: number): PaginationMeta {
  const contentLength = result.content?.length ?? 0;
  const apiTotalPages = result.totalPages ?? 0;
  const apiTotalElements = result.totalElements ?? 0;

  const resolvedTotalPages =
    apiTotalPages > 0
      ? apiTotalPages
      : apiTotalElements > 0
        ? Math.ceil(apiTotalElements / PAGE_SIZE)
        : contentLength === 0
          ? (page > 0 ? page + 1 : 0)
          : contentLength === PAGE_SIZE
            ? page + 2
            : page + 1;

  const resolvedTotalElements =
    apiTotalElements > 0
      ? apiTotalElements
      : resolvedTotalPages > page + 1
        ? (page + 1) * PAGE_SIZE + 1
        : page * PAGE_SIZE + contentLength;

  return {
    totalPages: resolvedTotalPages,
    totalElements: resolvedTotalElements,
  };
}

export default function DiaryListPage() {
  const { t } = useTranslation();
  const { deleteEntry } = useDiaryActions();
  const [page, setPage] = useState(0);
  const [paginationMetaByContext, setPaginationMetaByContext] = useState<Record<string, PaginationMeta>>({});

  const [status, setStatus] = useState<EntryStatus | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const requestNowRef = useRef(new Date().toISOString());
  const normalizedTags = useMemo(
    () => [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].sort(),
    [tags]
  );
  const normalizedTagQuery = useMemo(
    () => tagQuery.trim().toLowerCase(),
    [tagQuery]
  );
  const selectedDateKey = useMemo(
    () => (date ? new Date(date).toISOString().slice(0, 10) : null),
    [date]
  );
  const filterContextKey = useMemo(
    () =>
      JSON.stringify({
        status: status || null,
        tags: normalizedTags,
        tagQuery: normalizedTagQuery,
        date: selectedDateKey,
      }),
    [normalizedTagQuery, normalizedTags, selectedDateKey, status]
  );

  const diaryListQuery = useQuery<Page<DiaryEntryView>, Error>({
    queryKey: diaryKeys.list({
      page,
      size: PAGE_SIZE,
      status: status || null,
      tags: normalizedTags,
      tagQuery: normalizedTagQuery,
      date: selectedDateKey,
    }),
    queryFn: async () => {
      const mergedTags = normalizedTagQuery
        ? Array.from(new Set([normalizedTagQuery, ...normalizedTags]))
        : normalizedTags;
      const tagsParam = mergedTags.length ? mergedTags : undefined;

      let from: string | undefined;
      let to: string | undefined;
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        from = start.toISOString();
        to = end.toISOString();
      }

      return diaryApi.getMyEntries(page, PAGE_SIZE, {
        status: status || undefined,
        now: requestNowRef.current,
        tags: tagsParam,
        from,
        to,
      });
    },
    staleTime: DIARY_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const entries = diaryListQuery.data?.content ?? [];

  useEffect(() => {
    if (!diaryListQuery.data || diaryListQuery.isPlaceholderData) {
      return;
    }

    const nextPaginationMeta = resolvePaginationMeta({
      content: diaryListQuery.data.content ?? [],
      totalPages: diaryListQuery.data.totalPages ?? 0,
      totalElements: diaryListQuery.data.totalElements ?? 0,
    }, page);

    setPaginationMetaByContext((current) => {
      const previousMeta = current[filterContextKey];
      if (
        previousMeta?.totalPages === nextPaginationMeta.totalPages &&
        previousMeta?.totalElements === nextPaginationMeta.totalElements
      ) {
        return current;
      }

      return {
        ...current,
        [filterContextKey]: nextPaginationMeta,
      };
    });
  }, [diaryListQuery.data, diaryListQuery.isPlaceholderData, filterContextKey, page]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  const currentPaginationMeta = paginationMetaByContext[filterContextKey];
  const resolvedTotalPages = currentPaginationMeta?.totalPages ?? 0;
  const resolvedTotalElements = currentPaginationMeta?.totalElements ?? 0;
  const isPageTransitioning = diaryListQuery.isFetching;
  const isPaginationMetaPending = isPageTransitioning && !currentPaginationMeta;
  const isPaginationInteractionLocked = isPageTransitioning;

  const paginationItems = useMemo(
    () => buildPaginationItems(resolvedTotalPages, page + 1),
    [page, resolvedTotalPages]
  );
  const shouldShowPagination = Boolean(date) || resolvedTotalPages > 0;
  const isFirstPage = page === 0;
  const isLastPage = resolvedTotalPages <= 1 || page >= resolvedTotalPages - 1;

  const handleDelete = useCallback(async (entry: DiaryEntryView) => {
    if (entry.status === "DELETED") return;

    setDeletingEntryId(entry.id);
    try {
      const shouldShiftPage = entries.length === 1 && page > 0;
      await deleteEntry(entry.id, {
        invalidateDiaryLists: !shouldShiftPage,
      });
      if (shouldShiftPage) {
        setPage((prev) => prev - 1);
      }
    } finally {
      setDeletingEntryId(null);
    }
  }, [deleteEntry, entries.length, page]);

  const handlePreviousNavigation = useCallback(() => {
    if (isPaginationInteractionLocked || isPaginationMetaPending) {
      return;
    }

    if (isFirstPage) {
      setPage(0);
      setDate((currentDate) => shiftCalendarDay(currentDate, -1));
      return;
    }

    setPage((prev) => Math.max(0, prev - 1));
  }, [isFirstPage, isPaginationInteractionLocked, isPaginationMetaPending]);

  const handleNextNavigation = useCallback(() => {
    if (isPaginationInteractionLocked || isPaginationMetaPending) {
      return;
    }

    if (isLastPage) {
      setPage(0);
      setDate((currentDate) => shiftCalendarDay(currentDate, 1));
      return;
    }

    setPage((prev) => prev + 1);
  }, [isLastPage, isPaginationInteractionLocked, isPaginationMetaPending]);

  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-hidden bg-page p-6 text-foreground sm:p-10">
      <div className="mx-auto flex h-full w-full max-w-[57.6rem] flex-col">
        <DiaryListHeader
          count={resolvedTotalElements}
          onCreate={() => {
            setEditOpen(false);
            setEditEntryId(null);
            setCreateOpen(true);
          }}
        />

        <CreateEntryDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        {editEntryId !== null && (
          <EditEntryDialog
            entryId={editEntryId}
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setEditEntryId(null);
            }}
          />
        )}

        <DiaryListFilters
          status={status}
          tags={tags}
          tagQuery={tagQuery}
          date={date}
          onStatusChange={(value) => {
            setPage(0);
            setStatus(value);
          }}
          onTagsChange={(value) => {
            setPage(0);
            setTags(value);
          }}
          onTagQueryChange={(value) => {
            setPage(0);
            setTagQuery(value);
          }}
          onDateChange={(value) => {
            setPage(0);
            setDate(value);
          }}
          onReset={() => {
            setPage(0);
            setStatus("");
            setTags([]);
            setTagQuery("");
            setDate(new Date());
          }}
        />

        <div className="relative min-h-0 flex-1">
          <div
            className={cn(
              "pb-16 transition-opacity duration-150 ease-out",
              isPageTransitioning && "opacity-70"
            )}
          >
            <DiaryTable
              entries={entries}
              deletingEntryId={deletingEntryId}
              onEdit={(id) => {
                setEditEntryId(id);
                setEditOpen(true);
              }}
              onDelete={handleDelete}
            />
          </div>

          {shouldShowPagination && (
            <div className="absolute inset-x-0 bottom-0 translate-y-5 transform-gpu">
              <Pagination>
                <PaginationContent className="flex-nowrap">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePreviousNavigation();
                      }}
                    >
                      {isPaginationMetaPending
                        ? t("common.previous")
                        : isFirstPage
                          ? t("common.previousDay")
                          : t("common.previous")}
                    </PaginationPrevious>
                  </PaginationItem>

                  {resolvedTotalPages > 0 && paginationItems.map((item, index) => (
                    <PaginationItem key={`pagination-slot-${index}`}>
                      {typeof item === "number" ? (
                        <PaginationLink
                          href="#"
                          isActive={item === page + 1}
                          className="tabular-nums"
                          onClick={(event) => {
                            event.preventDefault();
                            if (isPaginationInteractionLocked) {
                              return;
                            }
                            setPage(item - 1);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleNextNavigation();
                      }}
                    >
                      {isPaginationMetaPending
                        ? t("common.next")
                        : isLastPage
                          ? t("common.nextDay")
                          : t("common.next")}
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
