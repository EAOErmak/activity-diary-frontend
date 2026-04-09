import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { DiaryEntryView } from "@/shared/types/diary";
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

export default function DiaryListPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DiaryEntryView[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState<DisplayStatus | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

  const load = useCallback(async () => {
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

    const result = await diaryApi.getMyEntries(page, PAGE_SIZE, {
      uiStatus: status || undefined,
      now: nowIso,
      tags: tagsParam,
      from,
      to,
    });

    setEntries(result.content ?? []);
    setTotalPages(result.totalPages ?? 0);
    setTotalElements(result.totalElements ?? 0);
  }, [status, tags, tagQuery, date, page]);

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

  const resolvedTotalPages = useMemo(() => {
    if (totalPages > 0) {
      return totalPages;
    }

    if (totalElements > 0) {
      return Math.ceil(totalElements / PAGE_SIZE);
    }

    if (entries.length === 0) {
      return page > 0 ? page + 1 : 0;
    }

    return entries.length === PAGE_SIZE ? page + 2 : page + 1;
  }, [entries.length, page, totalElements, totalPages]);

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
    if (isFirstPage) {
      setPage(0);
      setDate((currentDate) => shiftCalendarDay(currentDate, -1));
      return;
    }

    setPage((prev) => Math.max(0, prev - 1));
  }, [isFirstPage]);

  const handleNextNavigation = useCallback(() => {
    if (isLastPage) {
      setPage(0);
      setDate((currentDate) => shiftCalendarDay(currentDate, 1));
      return;
    }

    setPage((prev) => prev + 1);
  }, [isLastPage]);

  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-hidden bg-page p-6 text-foreground sm:p-10">
      <DiaryListHeader
        count={totalElements}
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

      <DiaryTable
        entries={entries}
        pageSize={PAGE_SIZE}
        deletingEntryId={deletingEntryId}
        onEdit={(id) => {
          setEditEntryId(id);
          setEditOpen(true);
        }}
        onDelete={handleDelete}
      />

      {shouldShowPagination && (
        <Pagination className="mt-6 max-w-6xl">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handlePreviousNavigation();
                }}
              >
                {isFirstPage ? t("common.previousDay") : t("common.previous")}
              </PaginationPrevious>
            </PaginationItem>

            {resolvedTotalPages > 0 && paginationItems.map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {typeof item === "number" ? (
                  <PaginationLink
                    href="#"
                    isActive={item === page + 1}
                    onClick={(event) => {
                      event.preventDefault();
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
                {isLastPage ? t("common.nextDay") : t("common.next")}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
