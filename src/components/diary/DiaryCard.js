import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
export function DiaryCard({ entry }) {
    return (_jsxs(Card, { className: "bg-[#151C2C]/90 border border-slate-700/60 rounded-2xl p-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-300", children: [_jsx("h2", { className: "text-xl font-semibold text-blue-400 mb-2", children: entry.what ?? "Без названия" }), _jsx("p", { className: "text-gray-400 text-sm mb-2", children: entry.whatHappened ?? "Нет описания" }), _jsxs("div", { className: "flex justify-between items-center text-xs text-gray-500 mt-4", children: [_jsx("span", { children: entry.whenStarted ? new Date(entry.whenStarted).toLocaleDateString() : "Дата не указана" }), _jsx("span", { className: `font-medium ${entry.status === "FINISHED"
                            ? "text-green-400"
                            : entry.status === "PLANNED"
                                ? "text-yellow-400"
                                : "text-blue-400"}`, children: entry.status ?? "—" })] })] }));
}
