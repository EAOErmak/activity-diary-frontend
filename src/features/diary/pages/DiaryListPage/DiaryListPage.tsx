import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { DiaryListHeader } from "@/features/diary/pages/DiaryListPage/components/DiaryListHeader";
import { DiaryListFilters } from "@/features/diary/pages/DiaryListPage/components/DiaryListFilters";
import { CreateEntryDialog } from "@/features/diary/components/CreateEntryDialog";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";
import type { DisplayStatus } from "@/features/diary/pages/DiaryListPage/statusConfig";
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
import { cn } from "@/shared/lib/utils";
import type { DiaryEntryView, Page } from "@/shared/types/diary";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;

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
  const [entries, setEntries] = useState<DiaryEntryView[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [paginationMetaByContext, setPaginationMetaByContext] = useState<Record<string, PaginationMeta>>({});

  const [status, setStatus] = useState<DisplayStatus | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const latestLoadIdRef = useRef(0);
  const filterContextKey = useMemo(() => JSON.stringify({
    status: status || null,
    tags: [...tags].sort(),
    tagQuery: tagQuery.trim().toLowerCase(),
    date: date ? new Date(date).toISOString().slice(0, 10) : null,
  }), [date, status, tagQuery, tags]);

  const load = useCallback(async () => {
    const loadId = latestLoadIdRef.current + 1;
    latestLoadIdRef.current = loadId;
    setIsPageTransitioning(true);

    const nowIso = new Date().toISOString();
    const query = tagQuery.trim().toLowerCase();
    const mergedTags = query ? [query, ...tags] : tags;
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

    try {
      const result = await diaryApi.getMyEntries(page, PAGE_SIZE, {
        uiStatus: status || undefined,
        now: nowIso,
        tags: tagsParam,
        from,
        to,
      });

      if (latestLoadIdRef.current !== loadId) {
        return;
      }

      const nextPaginationMeta = resolvePaginationMeta({
        content: result.content ?? [],
        totalPages: result.totalPages ?? 0,
        totalElements: result.totalElements ?? 0,
      }, page);

      startTransition(() => {
        setEntries(result.content ?? []);
        setTotalPages(nextPaginationMeta.totalPages);
        setTotalElements(nextPaginationMeta.totalElements);
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
        setIsPageTransitioning(false);
      });
    } catch (error) {
      if (latestLoadIdRef.current === loadId) {
        setIsPageTransitioning(false);
      }
      throw error;
    }
  }, [date, filterContextKey, page, status, tagQuery, tags]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("diary:changed", onChanged);
    return () => window.removeEventListener("diary:changed", onChanged);
  }, [load]);

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
      await diaryApi.deleteEntry(entry.id);
      if (entries.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        await load();
      }
      window.dispatchEvent(new Event("diary:changed"));
    } finally {
      setDeletingEntryId(null);
    }
  }, [entries.length, load, page]);

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
            setDate(undefined);
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
