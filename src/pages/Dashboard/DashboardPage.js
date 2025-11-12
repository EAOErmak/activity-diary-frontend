import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { fetchDiaryStats } from "@/api/dashboardApi";
import StatCard from "@/components/dashboard/StatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { motion } from "framer-motion";
export default function DashboardPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["diary-stats"],
        queryFn: fetchDiaryStats,
    });
    if (isLoading)
        return _jsx("div", { className: "text-gray-400 p-8", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." });
    if (isError || !data)
        return _jsx("div", { className: "text-red-500 p-8", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0434\u0430\u043D\u043D\u044B\u0445" });
    const { totalEntries, moodAverage, activityCount, weeklyTrend } = data;
    return (_jsxs("div", { className: "min-h-screen p-6 text-white bg-gradient-to-br from-slate-950 to-slate-900", children: [_jsx(motion.h1, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: "text-3xl font-bold mb-6", children: "\u041F\u0430\u043D\u0435\u043B\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [_jsx(StatCard, { title: "\u0417\u0430\u043F\u0438\u0441\u0435\u0439", value: totalEntries, delay: 0.1 }), _jsx(StatCard, { title: "\u0421\u0440\u0435\u0434\u043D\u0435\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435", value: moodAverage.toFixed(1), delay: 0.2 }), _jsx(StatCard, { title: "\u0422\u0438\u043F\u043E\u0432 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438", value: Object.keys(activityCount).length, delay: 0.3 })] }), _jsx(ActivityChart, { data: weeklyTrend })] }));
}
