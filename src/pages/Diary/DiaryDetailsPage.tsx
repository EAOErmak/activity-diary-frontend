import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Calendar, Activity } from "lucide-react";

export default function DiaryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const data = await diaryApi.getEntry(id ? Number(id) : 0);
        setEntry(data);
      } catch (err: any) {
        setError(err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (loading)
    return <p className="text-center text-white mt-20">Загрузка...</p>;
  if (error)
    return <p className="text-center text-red-400 mt-20">Ошибка: {error}</p>;
  if (!entry)
    return <p className="text-center text-gray-400 mt-20">Запись не найдена</p>;

  return (
    <div className="min-h-screen bg-[#0E1420] text-white p-6 sm:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Назад
        </button>

        <Button
          onClick={() => navigate(`/diary/${id}/edit`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500"
        >
          <Edit3 className="w-4 h-4" /> Редактировать
        </Button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto bg-[#151C2C]/90 border border-slate-700/60 rounded-3xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-blue-400 mb-4">
          {entry.what || "Без названия"}
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          {entry.whatHappened || "Без описания"}
        </p>

        <div className="flex flex-wrap gap-6 text-gray-300 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            {entry.whenStarted
              ? new Date(entry.whenStarted).toLocaleDateString()
              : "Дата не указана"}
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                entry.status === "FINISHED"
                  ? "bg-green-600/20 text-green-400"
                  : entry.status === "PLANNED"
                  ? "bg-yellow-600/20 text-yellow-400"
                  : "bg-blue-600/20 text-blue-400"
              }`}
            >
              {entry.status}
            </span>
          </div>
        </div>

        {entry.anyDescription && (
          <div className="text-gray-300 mb-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              Комментарий
            </h3>
            <p>{entry.anyDescription}</p>
          </div>
        )}

        {entry.whatDidYouDo?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              Активности
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              {entry.whatDidYouDo.map((act: any, idx: number) => (
                <li key={idx}>
                  <span className="font-medium text-blue-400">{act.title}</span>
                  {act.description && ` — ${act.description}`} ({act.count})
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
