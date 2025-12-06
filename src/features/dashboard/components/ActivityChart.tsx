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

  const first = data.charts[0];
  if (!first.points || first.points.length === 0) {
    return (
      <div className="bg-slate-900/70 p-4 rounded-2xl text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  // ✅ универсальная X-ось (по максимальному набору)
  const xAxisData = useMemo(() => {
    const set = new Set<string>();

    data.charts.forEach((chart) => {
      chart.points.forEach((p) => set.add(p.x));
    });

    return Array.from(set).sort(); // ✅ единая и отсортированная ось
  }, [data.charts]);

  // ✅ генерация цветов под любое количество линий
  const colors = useMemo(() => {
    return data.charts.map((_, i) => {
      const hue = (i * 47) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });
  }, [data.charts.length]);

  const option = useMemo(
    () => ({
      color: colors,

      tooltip: {
        trigger: "axis",
      },

      legend: {
        data: data.charts.map((c) => c.title),
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

      series: data.charts.map((chart) => {
        const map = new Map(chart.points.map((p) => [p.x, p.y]));

        return {
          name: chart.title,
          type: "line",
          smooth: true,

          connectNulls: true, // ✅ ВОТ ЭТО ВОЗВРАЩАЕТ ЗАЛИВКУ

          data: xAxisData.map((x) => map.get(x) ?? null),

          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.12 },
        };
      }),

      grid: { top: 40, right: 20, left: 50, bottom: 30 },
    }),
    [data, xAxisData, colors]
  );

  return (
    <div className="bg-slate-900/70 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-slate-800">
      <h3 className="text-gray-300 mb-2 text-sm">
        {data.charts.length === 1
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
