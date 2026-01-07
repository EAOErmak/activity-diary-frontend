import React, { useMemo, useState } from "react";
import { useDiaryRepository } from "@/shared/repository/diaryRepository";
import { DiaryListHeader } from "@/features/diary/pages/DiaryListPage/components/DiaryListHeader";
import { DiaryListFilters } from "@/features/diary/pages/DiaryListPage/components/DiaryListFilters";
import { CreateEntryDialog } from "@/features/diary/components/CreateEntryDialog";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";
import { getDisplayStatus, DisplayStatus } from "@/features/diary/pages/DiaryListPage/helpers";
import { DiaryTable } from "@/features/diary/pages/DiaryListPage/components/DiaryTable";

export default function DiaryListPage() {
  const entries = useDiaryRepository((s) => s.list);

  const [status, setStatus] = useState<DisplayStatus | "">("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return entries.filter((e) => {
      const ds = getDisplayStatus(e);
      const byStatus = status ? ds === status : true;
      const title = (e.subCategoryName ?? "").toLowerCase();
      const bySearch = q ? title.includes(q) : true;
      const byDate =
        !date || !e.whenStarted
          ? !date
          : new Date(e.whenStarted).toDateString() === date.toDateString();

      return byStatus && bySearch && byDate;
    });
  }, [entries, status, search, date]);

  return (
    <div className="min-h-screen bg-page text-foreground p-6 sm:p-10">
      <DiaryListHeader
        count={filtered.length}
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
        search={search}
        date={date}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onDateChange={setDate}
        onReset={() => {
          setStatus("");
          setSearch("");
          setDate(undefined);
        }}
      />

    <DiaryTable
      entries={filtered}
      onEdit={(id) => {
        setEditEntryId(id);
        setEditOpen(true);
      }}
    />
    </div>
  );
}
