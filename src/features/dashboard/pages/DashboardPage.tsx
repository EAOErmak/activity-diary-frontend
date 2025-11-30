import { useQuery } from "@tanstack/react-query";
import { fetchDiaryStats } from "@/api/dashboardApi";
import StatCard from "@/features/dashboard/components/StatCard";
import ActivityChart from "@/features/dashboard/components/ActivityChart";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["diary-stats"],
    queryFn: fetchDiaryStats,
  });

  if (isLoading) return <div className="text-gray-400 p-8">Загрузка...</div>;
  if (isError || !data) return <div className="text-red-500 p-8">Ошибка загрузки данных</div>;

  const { totalEntries, moodAverage, activityCount, weeklyTrend } = data;

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-slate-950 to-slate-900">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold mb-6"
      >
        Панель активности
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Записей" value={totalEntries} delay={0.1} />
        <StatCard title="Среднее настроение" value={moodAverage.toFixed(1)} delay={0.2} />
        <StatCard title="Типов активности" value={Object.keys(activityCount).length} delay={0.3} />
      </div>

      <ActivityChart data={weeklyTrend} />
    </div>
  );
}
