import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Calendar, Activity, Play } from "lucide-react";

import type { DiaryEntry } from "@/shared/types/diary";
import { getUiStatus, STATUS_STYLES } from "@/shared/lib/uiStatus";

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
      <p className="text-center text-white mt-20">
        Загрузка...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-400 mt-20">
        Ошибка: {error}
      </p>
    );
  }

  if (!entry) {
    return (
      <p className="text-center text-gray-400 mt-20">
        Запись не найдена
      </p>
    );
  }

  const uiStatus = getUiStatus(entry);

  /* ================================
     RENDER
  ================================ */

  return (
    <div className="min-h-screen bg-[#0E1420] text-white p-6 sm:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        <div className="flex gap-2">
          {uiStatus === "PLANNED" && (
            <Button
              onClick={() => navigate(`/diary/${id}/edit`)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              <Play className="w-4 h-4" />
              Продолжить
            </Button>
          )}

          <Button
            onClick={() => navigate(`/diary/${id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500"
          >
            <Edit3 className="w-4 h-4" />
            Редактировать
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl mx-auto bg-[#151C2C]/90 border border-slate-700/60 rounded-3xl p-8 shadow-xl"
      >
        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-400 mb-1">
            {entry.subCategoryName}
          </h1>
          <p className="text-xs text-slate-500">
            ID: {entry.id}
          </p>
        </div>

        <p className="text-gray-400 text-lg mb-8">
          {entry.categoryName}
        </p>

        {/* META */}
        <div className="flex flex-wrap gap-6 text-gray-300 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            {entry.whenStarted
              ? `Начато: ${new Date(entry.whenStarted).toLocaleString()}`
              : "Дата не указана"}
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
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
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Комментарий
          </h3>
          {entry.description ? (
            <p className="text-gray-300">
              {entry.description}
            </p>
          ) : (
            <p className="text-slate-500 italic">
              Комментарий отсутствует
            </p>
          )}
        </div>

        {/* METRICS */}
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            Активности
          </h3>

          {entry.metrics?.length ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              {entry.metrics.map((m) => (
                <li key={m.id}>
                  <span className="font-medium text-blue-400">
                    {m.metricTypeName}
                  </span>{" "}
                  — {m.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">
              Активности не указаны
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
