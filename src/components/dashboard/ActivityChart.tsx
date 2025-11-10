import ReactECharts from "echarts-for-react";

export default function ActivityChart({ data }: { data: { day: string; value: number }[] }) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-slate-800">
      <h3 className="text-gray-400 mb-2 text-sm">Активность за неделю</h3>
      <ReactECharts
        style={{ height: 300 }}
        option={{
          xAxis: {
            type: "category",
            data: data.map((d) => d.day),
            axisLabel: { color: "#888" },
            axisLine: { lineStyle: { color: "#333" } },
          },
          yAxis: {
            type: "value",
            axisLabel: { color: "#888" },
            splitLine: { lineStyle: { color: "#222" } },
          },
          series: [
            {
              data: data.map((d) => d.value),
              type: "line",
              smooth: true,
              lineStyle: { color: "#3b82f6" },
              areaStyle: {
                color: "rgba(59,130,246,0.2)",
              },
              symbol: "circle",
              symbolSize: 8,
              itemStyle: { color: "#60a5fa" },
            },
          ],
          grid: { top: 20, right: 20, left: 40, bottom: 30 },
        }}
      />
    </div>
  );
}
