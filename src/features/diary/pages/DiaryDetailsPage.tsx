import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { Edit3, Calendar, Activity, Trash2, X } from "lucide-react";
import ReactECharts from "echarts-for-react";

import type { DiaryEntry } from "@/shared/types/diary";
import { getUiStatus, STATUS_STYLES, type UiStatus } from "@/shared/lib/uiStatus";
import { EditEntryDialog } from "@/features/diary/components/EditEntryDialog";

/* ================================
   UI LABELS
================================ */

export const UI_STATUS_LABELS_LEGACY: Record<string, string> = {
  PLANNED: "Запланировано",
  ACTIVE: "Активно",
  WIN: "Успех",
  LOSE: "Провал",
};

const UI_STATUS_LABELS: Record<UiStatus, string> = {
  PLANNED: "Запланировано",
  ACTIVE: "Активно",
  FINISHED: "Завершено",
  FAILED: "Провал",
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

  async function handleDelete() {
    if (!entry) return;
    const ok = confirm("Удалить запись? Действие нельзя отменить.");
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

  const uiStatus = getUiStatus({
    id: entry.id,
    whenStarted: entry.whenStarted,
    whenEnded: entry.whenEnded,
    status: entry.status,
    firstTag: entry.firstTag ?? null,
  });
  const canEdit = entry.status !== "DELETED";
  const title = entry.firstTag ?? "Запись";

  const readCssVar = (name: string) => {
    if (typeof window === "undefined") return "";
    const style = getComputedStyle(document.documentElement);
    const raw = style.getPropertyValue(name).trim();
    if (raw.startsWith("var(")) {
      const inner = raw.slice(4, -1).trim();
      return style.getPropertyValue(inner).trim();
    }
    return raw;
  };

  const toHsl = (value: string, fallback: string) =>
    value ? `hsl(${value})` : fallback;

  const colorPrimary = toHsl(readCssVar("--primary"), "#3b82f6");
  const colorMutedFg = toHsl(readCssVar("--muted-foreground"), "#94a3b8");
  const colorPopover = toHsl(readCssVar("--popover"), "#0b1220");
  const colorPopoverFg = toHsl(
    readCssVar("--popover-foreground"),
    "#e2e8f0"
  );
  const colorBorder = toHsl(readCssVar("--border"), "#1f2937");

  const buildMiniChartOption = (
    values: { value: number; unitName?: string }[],
    unitLabel: string
  ) => {
    const labels = values.map((_, idx) => `${idx + 1}`);
    const data = values.map((v) => v.value);

    return {
      backgroundColor: "transparent",
      grid: { left: 8, right: 8, top: 10, bottom: 18 },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { fontSize: 10, color: colorMutedFg },
        axisLine: { show: true, lineStyle: { color: colorBorder, opacity: 0.35, width: 2 } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          show: true,
          fontSize: 10,
          color: colorMutedFg,
          margin: 6,
          formatter: (value: number) =>
            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`,
        },
        splitNumber: 3,
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { color: colorBorder, opacity: 0.35, width: 2 } },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: "item",
        axisPointer: { type: "none" },
        triggerOn: "mousemove",
        valueFormatter: (value: number) => `${value} ${unitLabel}`,
        backgroundColor: colorPopover,
        borderColor: colorBorder,
        textStyle: { color: colorPopoverFg },
      },
      series: [
        {
          type: "bar",
          data,
          barWidth: 14,
          barCategoryGap: "20%",
          itemStyle: { color: colorPrimary, borderColor: colorBorder, borderWidth: 1 },
          emphasis: { itemStyle: { color: colorPrimary } },
        },
      ],
    };
  };

  const groupedMetrics = entry.metrics.reduce<
    { metricTypeName: string; unitLabel: string; values: { value: number; unitName?: string }[] }[]
  >((acc, m) => {
    for (const v of m.values) {
      const unitLabel = v.unitName ?? "Unit";
      const key = `${m.metricTypeName}__${unitLabel}`;
      const existing = acc.find(
        (g) => g.metricTypeName + "__" + g.unitLabel === key
      );
      if (existing) {
        existing.values.push(v);
      } else {
        acc.push({
          metricTypeName: m.metricTypeName,
          unitLabel,
          values: [v],
        });
      }
    }
    return acc;
  }, []);

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
            {title}
          </h1>
        </div>

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
              {groupedMetrics.length ? (
                groupedMetrics.map((g, idx) => (
                  <li key={`${g.metricTypeName}__${g.unitLabel}__${idx}`}>
                    <div className="font-medium text-primary">
                      {g.metricTypeName}
                    </div>
                    <div className="text-xs text-mutedForeground mb-1">
                      {g.unitLabel}
                    </div>
                    <div className="rounded-xl border border-border bg-surface_second p-2">
                      <ReactECharts
                        option={buildMiniChartOption(g.values, g.unitLabel)}
                        style={{ height: 80, width: "100%" }}
                      />
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-mutedForeground text-sm">
                  No values
                </li>
              )}
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
              onClick={handleDelete}
              variant="primary"
              className="mt-6"
            >
              <Trash2 className="w-4 h-4" />
              Удалить
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
