import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import type { MultiChartResponse } from "@/shared/types/analytics";

export default function ActivityChart({ data }: { data: MultiChartResponse }) {
  if (!data || !data.charts || data.charts.length === 0) {
    return (
      <div className="bg-slate-900/70 p-4 rounded-2xl text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const validCharts = data.charts.filter(
    (c) => c && c.title && c.points && c.points.length > 0
  );

  if (!validCharts.length) {
    return (
      <div className="bg-slate-900/70 p-4 rounded-2xl text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const first = validCharts[0];

  // ✅ универсальная X-ось
  const xAxisData = useMemo(() => {
    const set = new Set<string>();

    validCharts.forEach((chart) => {
      (chart.points ?? []).forEach((p) => p?.x && set.add(p.x));
    });

    return Array.from(set).sort();
  }, [validCharts]);

  // ✅ безопасная генерация цветов
  const colors = useMemo(() => {
    return validCharts.map((_, i) => {
      const hue = (i * 47) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });
  }, [validCharts.length]);

  const option = useMemo(
    () => ({
      color: colors,

      tooltip: {
        trigger: "axis",
      },

      legend: {
        data: validCharts.map((c) => c.title), // ✅ ГАРАНТИРОВАНО НЕ null
        textStyle: { color: "#e5e7eb" },
      },

      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#374151" } },
      },

      yAxis: {
        type: "value",
        axisLabel: { color: "#9ca3af" },
        splitLine: { lineStyle: { color: "#1f2937" } },
      },

      series: validCharts.map((chart) => {
        const map = new Map(
          (chart.points ?? [])
            .filter((p) => p?.x !== undefined)
            .map((p) => [p.x, p.y])
        );

        return {
          name: chart.title, // ✅ СТРОКА
          type: "line",
          smooth: true,
          connectNulls: true,

          data: xAxisData.map((x) => map.get(x) ?? null),

          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.12 },
        };
      }),

      grid: { top: 40, right: 20, left: 50, bottom: 30 },
    }),
    [validCharts, xAxisData, colors]
  );

  return (
    <div className="bg-slate-900/70 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-slate-800">
      <h3 className="text-gray-300 mb-2 text-sm">
        {validCharts.length === 1
          ? `${first.title}${first.unit ? ` (${first.unit})` : ""}`
          : "Сравнение выбранных показателей"}
      </h3>

      <ReactECharts
        option={option}
        style={{ height: 340 }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
