import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactECharts from "echarts-for-react";
export default function ActivityChart({ data }) {
    return (_jsxs("div", { className: "bg-slate-900/70 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-slate-800", children: [_jsx("h3", { className: "text-gray-400 mb-2 text-sm", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0437\u0430 \u043D\u0435\u0434\u0435\u043B\u044E" }), _jsx(ReactECharts, { style: { height: 300 }, option: {
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
                } })] }));
}
