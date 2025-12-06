import { useQuery } from "@tanstack/react-query";
import {
  getTimeChartByCategory,
  getSequenceChartByCategory,
  getTimeChartByWhat,
  getSequenceChartByWhat,
} from "@/api/analyticsApi";
import ActivityChart from "@/features/dashboard/components/ActivityChart";
import AnalyticsFilters from "@/features/dashboard/components/AnalyticsFilters";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ChartResponse, MultiChartResponse } from "@/shared/types/analytics";

export default function DashboardPage() {
  // ✅ MULTI CATEGORY
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // ✅ MULTI WHAT
  const [selectedWhatIds, setSelectedWhatIds] = useState<number[]>([]);

  const [mode, setMode] = useState<"time" | "sequence">("time");
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);

  const [from, setFrom] = useState(monthAgo.toISOString());
  const [to, setTo] = useState(now.toISOString());


  const { data, isLoading, isError } = useQuery<MultiChartResponse>({
    queryKey: [
      "analytics-multi",
      { mode, selectedCategoryIds, selectedWhatIds, from, to }
    ],

    queryFn: async () => {
      const charts: ChartResponse[] = [];

      // ✅ 1. ЕСЛИ ВЫБРАНЫ WHAT — СТРОИМ ПО НИМ
      if (selectedWhatIds.length > 0) {
        for (const id of selectedWhatIds) {
          const chart =
            mode === "time"
              ? await getTimeChartByWhat(id, from, to)
              : await getSequenceChartByWhat(id, from, to);
          charts.push(chart);
        }

        return { charts };
      }

      // ✅ 2. ЕСЛИ WHAT НЕ ВЫБРАНЫ — СТРОИМ ПО КАТЕГОРИЯМ
      for (const catId of selectedCategoryIds) {
        const chart =
          mode === "time"
            ? await getTimeChartByCategory(catId, from, to)
            : await getSequenceChartByCategory(catId, from, to);

        charts.push(chart);
      }

      return { charts };
    },

    enabled: selectedCategoryIds.length > 0 || selectedWhatIds.length > 0,
  });

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-slate-950 to-slate-900">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold mb-6"
      >
        Аналитика активности (мульти-сравнение)
      </motion.h1>

      <AnalyticsFilters
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        selectedWhatIds={selectedWhatIds}
        setSelectedWhatIds={setSelectedWhatIds}
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        mode={mode}
        setMode={setMode}
      />

      {selectedCategoryIds.length === 0 &&
      selectedWhatIds.length === 0 && (
        <div className="text-gray-400 mt-10 text-center">
          Выберите категорию или конкретную активность для построения графика
        </div>
      )}

      {isLoading && <div className="text-gray-400">Загрузка...</div>}
      {isError && <div className="text-red-500">Ошибка</div>}

      {data && <ActivityChart data={data} />}
    </div>
  );
}
