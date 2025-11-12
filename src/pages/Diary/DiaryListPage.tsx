import React, { useEffect, useMemo, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function DiaryListPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await diaryApi.getMyEntries();
        setEntries(data);
      } catch (err: any) {
        setError(err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filtered = useMemo(() => {
    if (!entries?.length) return [];
    return entries.filter((e) => {
      const byStatus = status ? e.status === status : true;
      const what = (e.what ?? "").toLowerCase();
      const bySearch = search ? what.includes(search.toLowerCase()) : true;
      const byDate = (() => {
        if (!date) return true;
        if (!e.whenStarted) return false;
        try {
          const entryDate = new Date(e.whenStarted);
          return entryDate.toDateString() === date.toDateString();
        } catch {
          return false;
        }
      })();
      return byStatus && bySearch && byDate;
    });
  }, [entries, status, search, date]);

  if (loading)
    return <p className="text-white text-center p-10">Загрузка...</p>;
  if (error)
    return (
      <p className="text-red-400 text-center p-10">
        Ошибка: {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-[#0E1420] text-white p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-400 text-center">
        Мои записи
      </h1>

      {/* --- ФИЛЬТРЫ --- */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-10 bg-[#151C2C]/70 backdrop-blur-md p-5 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-slate-700/50">
          
          {/* Статус */}
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-300 text-sm mb-1">Статус</label>
            <Select value={status || "ALL"} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
              <SelectTrigger className="bg-[#1C2435] border-none text-gray-100 rounded-2xl w-full h-11 px-4 text-sm focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C2435] border border-slate-700/60 text-gray-200 rounded-2xl shadow-lg">
                <SelectItem value="ALL">Все</SelectItem>
                <SelectItem value="ACTIVE">Активный</SelectItem>
                <SelectItem value="PLANNED">Запланированный</SelectItem>
                <SelectItem value="FINISHED">Завершённый</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Поиск */}
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-300 text-sm mb-1">Поиск</label>
            <input
              type="text"
              placeholder="🔍 Поиск по названию"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C2435] text-gray-100 border-none rounded-2xl px-4 py-2 h-11 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Дата */}
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-300 text-sm mb-1">Дата</label>
            <div className="bg-[#1C2435] rounded-2xl h-11 flex items-center px-3">
              <DatePicker date={date} setDate={setDate} />
            </div>
          </div>

          {/* Сброс */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setStatus("");
                setSearch("");
                setDate(undefined);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2 rounded-2xl font-semibold text-sm shadow-md shadow-blue-800/30 transition-all h-11"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

        {/* --- КАРТОЧКИ --- */}
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-400 text-center mt-20"
            >
              <p>Нет записей 😴</p>
              <Link
                to="/diary/new"
                className="mt-3 inline-block text-blue-500 hover:underline"
              >
                Создать запись
              </Link>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="relative bg-[#151C2C]/90 border border-slate-700/60 rounded-2xl p-6 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300"
                >
                  {/* Кнопка редактирования */}
                  <Link
                    to={`/diary/edit/${entry.id}`}
                    className="absolute top-3 right-3 bg-blue-600/80 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition"
                  >
                    ✏️ Редактировать
                  </Link>

                  <h2 className="text-xl font-semibold text-blue-400 mb-1">
                    {entry.what || "Без названия"}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    {entry.whatHappened || "Без описания"}
                  </p>
                  <div className="text-gray-500 text-xs mb-2">
                    {entry.whenStarted
                      ? new Date(entry.whenStarted).toLocaleDateString()
                      : "Дата не указана"}
                  </div>
                  <span
                    className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                      entry.status === "FINISHED"
                        ? "bg-green-600/20 text-green-400"
                        : entry.status === "PLANNED"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-blue-600/20 text-blue-400"
                    }`}
                  >
                    {entry.status || "—"}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
