import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { Edit3, Calendar, Activity, Play, X } from "lucide-react";

import type { DiaryEntry } from "@/shared/types/diary";
import { getUiStatus, STATUS_STYLES } from "@/shared/lib/uiStatus";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";

/* ================================
   UI LABELS
================================ */

const UI_STATUS_LABELS: Record<
  "PLANNED" | "ACTIVE" | "WIN" | "LOSE",
  string
> = {
  PLANNED: "Запланировано",
  ACTIVE: "Активно",
  WIN: "Успех",
  LOSE: "Провал",
};

/* ================================
   PAGE
================================ */

export default function DiaryDetailsPage() {
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
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchEntry();
  }, [id]);

  /* ================================
     STATES
  ================================ */

  if (loading) {
    return (
      <p className="text-center text-foreground mt-20">
        Загрузка...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive mt-20">
        Ошибка: {error}
      </p>
    );
  }

  if (!entry) {
    return (
      <p className="text-center text-mutedForeground mt-20">
        Запись не найдена
      </p>
    );
  }

  const uiStatus = getUiStatus(entry);
  const canEdit = uiStatus === "PLANNED" || uiStatus === "ACTIVE";

  /* ================================
     RENDER
  ================================ */

  return (
    <div className="">
      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative max-w-3xl mx-auto bg-surface rounded-3xl p-8 shadow-xl"
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
            {entry.categoryName}
          </h1>
        </div>

        <p className="text-mutedForeground text-lg mb-8">
          {entry.subCategoryName}
        </p>

        {/* META */}
        <div className="flex flex-wrap gap-6 text-foreground mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {entry.whenStarted
              ? `Начато: ${new Date(entry.whenStarted).toLocaleString()}`
              : "Дата не указана"}
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_STYLES[uiStatus]
              }`}
            >
              {UI_STATUS_LABELS[uiStatus]}
            </span>
          </div>
        </div>

        {/* COMMENT */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Комментарий
          </h3>
          {entry.description ? (
            <p className="text-foreground">
              {entry.description}
            </p>
          ) : (
            <p className="text-mutedForeground italic">
              Комментарий отсутствует
            </p>
          )}
        </div>

        {/* METRICS */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">
            Активности
          </h3>

          {entry.metrics?.length ? (
            <ul className="space-y-3 text-foreground">
              {entry.metrics.map((m) => (
                <li key={m.id}>
                  <div className="font-medium text-primary">
                    {m.metricTypeName}
                  </div>

                  <ul className="pl-4 list-disc space-y-1">
                    {m.values.map((v, idx) => (
                      <li key={idx}>
                        {v.value} {v.unitName}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-mutedForeground italic">
              Активности не указаны
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {uiStatus === "PLANNED" && (
            <Button
              onClick={() => setEditOpen(true)}
              className="bg-primary text-primaryForeground hover:opacity-90 mt-6"
            >
              <Play className="w-4 h-4" />
              Продолжить
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={() => setEditOpen(true)}
              variant="primary"
              className="mt-6"
            >
              <Edit3 className="w-4 h-4" />
              Редактировать
            </Button>
          )}
        </div>
      </motion.div>
      {entry && (
        <EditEntryDialog
          entryId={entry.id}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
