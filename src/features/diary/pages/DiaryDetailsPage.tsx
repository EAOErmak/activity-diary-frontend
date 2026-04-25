import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { Edit3, Calendar, Activity, Trash2, X } from "lucide-react";

import type { DiaryEntry } from "@/shared/types/diary";
import { getEntryStatus, STATUS_STYLES } from "@/shared/lib/entryStatus";
import { getIntlLocale } from "@/shared/i18n/locale";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";
import { EntryMetricValueCarousel } from "@/features/diary/components/EntryMetricValueCarousel";
import { getStatusLabel } from "@/features/diary/pages/DiaryListPage/statusConfig";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Unknown error";
}

export default function DiaryDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  /* ================================
     LOAD ENTRY
  ================================ */

  useEffect(() => {
    async function fetchEntry() {
      try {
        const data = await diaryApi.getEntry(Number(id));
        setEntry(data);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchEntry();
  }, [id]);

  async function handleDelete() {
    if (!entry) return;
    const ok = confirm(t("diary.deleteConfirm"));
    if (!ok) return;
    await diaryApi.deleteEntry(entry.id);
    window.dispatchEvent(new Event("diary:changed"));
    navigate(-1);
  }

  /* ================================
     STATES
  ================================ */

  if (loading) {
    return (
      <p className="text-center text-foreground mt-20">
        {t("common.loading")}
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive mt-20">
        {`${t("common.error")}: ${error}`}
      </p>
    );
  }

  if (!entry) {
    return (
      <p className="text-center text-mutedForeground mt-20">
        {t("diary.entryNotFound")}
      </p>
    );
  }

  const entryStatus = getEntryStatus({
    id: entry.id,
    whenStarted: entry.whenStarted,
    whenEnded: entry.whenEnded,
    status: entry.status,
    firstTag: entry.firstTag ?? null,
  });
  const canEdit = entry.status !== "DELETED";
  const title = entry.firstTag ?? t("diary.entryTitleFallback");

  /* ================================
     RENDER
  ================================ */

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative mt-6 w-full max-w-2xl mx-auto bg-surface rounded-3xl p-8 shadow-xl"
      >
        <Button
          variant="ghost"
          size="icon" 
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">
            {title}
          </h1>
        </div>

        {/* META */}
        <div className="flex flex-wrap gap-6 text-foreground mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {entry.whenStarted
              ? t("diary.startedAt", {
                  date: new Date(entry.whenStarted).toLocaleString(getIntlLocale()),
                })
              : t("diary.dateNotSpecified")}
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_STYLES[entryStatus]
              }`}
            >
              {getStatusLabel(entryStatus)}
            </span>
          </div>
        </div>

        {/* COMMENT */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-primary mb-2">
            {t("diary.comment")}
          </h3>
          {entry.description ? (
            <p className="text-foreground">
              {entry.description}
            </p>
          ) : (
            <p className="text-mutedForeground italic">
              {t("diary.commentMissing")}
            </p>
          )}
        </div>

        {/* METRICS */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">
            {t("diary.activities")}
          </h3>

          {entry.metrics?.length ? (
            <div className="w-full max-w-full min-w-0 overflow-hidden">
              <EntryMetricValueCarousel metrics={entry.metrics} />
            </div>
          ) : (
            <p className="text-mutedForeground italic">
              {t("diary.activitiesMissing")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {(entryStatus === "PLANNED" || entryStatus === "OVERDUE") && (
            <Button
              onClick={handleDelete}
              variant="primary"
              className="mt-6"
            >
              <Trash2 className="w-4 h-4" />
              {t("common.delete")}
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={() => setEditOpen(true)}
              variant="primary"
              className="mt-6"
            >
              <Edit3 className="w-4 h-4" />
              {t("common.edit")}
            </Button>
          )}
        </div>
      </motion.div>
      {entry && (
        <EditEntryDialog
          entryId={entry.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={setEntry}
        />
      )}
    </div>
  );
}
