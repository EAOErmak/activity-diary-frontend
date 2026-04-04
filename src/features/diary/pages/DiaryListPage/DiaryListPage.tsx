import React, { useCallback, useEffect, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { DiaryListHeader } from "@/features/diary/pages/DiaryListPage/components/DiaryListHeader";
import { DiaryListFilters } from "@/features/diary/pages/DiaryListPage/components/DiaryListFilters";
import { CreateEntryDialog } from "@/features/diary/components/CreateEntryDialog";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";
import type { DisplayStatus } from "@/features/diary/pages/DiaryListPage/statusConfig";
import { DiaryTable } from "@/features/diary/pages/DiaryListPage/components/DiaryTable";
import type { DiaryEntryView } from "@/shared/types/diary";

export default function DiaryListPage() {
  const [entries, setEntries] = useState<DiaryEntryView[]>([]);

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

    const result = await diaryApi.getMyEntries(0, 20, {
      uiStatus: status || undefined,
      now: nowIso,
      tags: tagsParam,
      from,
      to,
    });

    setEntries(result.content ?? []);
  }, [status, tags, tagQuery, date]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("diary:changed", onChanged);
    return () => window.removeEventListener("diary:changed", onChanged);
  }, [load]);

  const handleDelete = useCallback(async (entry: DiaryEntryView) => {
    if (entry.status === "DELETED") return;

    setDeletingEntryId(entry.id);
    try {
      await diaryApi.deleteEntry(entry.id);
      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
      window.dispatchEvent(new Event("diary:changed"));
    } finally {
      setDeletingEntryId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-page text-foreground p-6 sm:p-10">
      <DiaryListHeader
        count={entries.length}
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
        onStatusChange={setStatus}
        onTagsChange={setTags}
        onTagQueryChange={setTagQuery}
        onDateChange={setDate}
        onReset={() => {
          setStatus("");
          setTags([]);
          setTagQuery("");
          setDate(undefined);
        }}
      />

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
  );
}
