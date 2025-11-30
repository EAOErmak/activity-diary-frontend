import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/shared/store/authStore";
import { diaryApi } from "@/api/diaryApi";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Link } from "react-router-dom";
import type { DiaryEntryDto } from "@/shared/types/diary";

export default function DiaryListPage() {
  const [entries, setEntries] = useState<DiaryEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const accessToken = useAuthStore((s) => s.accessToken);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    if (!accessToken) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        const page = await diaryApi.getMyEntries();
        setEntries(page.content);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [accessToken]);

  // ============================
  // FILTER
  // ============================

  const filtered = useMemo(() => {
    if (!entries.length) return [];

    return entries.filter((e) => {
      const byStatus = status ? e.status === status : true;

      const title = e.whatName.toLowerCase();
      const bySearch = search
        ? title.includes(search.toLowerCase())
        : true;

      const byDate = (() => {
        if (!date) return true;
        if (!e.whenStarted) return false;
        const entryDate = new Date(e.whenStarted);
        return entryDate.toDateString() === date.toDateString();
      })();

      return byStatus && bySearch && byDate;
    });
  }, [entries, status, search, date]);

  if (loading)
    return <p className="text-white text-center p-10">Загрузка...</p>;

  if (error)
    return <p className="text-red-400 text-center p-10">Ошибка: {error}</p>;

  return (
    <div className="min-h-screen bg-[#0E1420] text-white p-6 sm:p-10">
      {/* ============================
          HEADER
      ============================ */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-blue-400">
          Мои записи
        </h1>

        <Link
          to="/diary/new"
          className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-xl font-semibold text-sm"
        >
          + Создать запись
        </Link>
      </div>

      {/* ============================
          FILTERS
      ============================ */}
      <div className="w-full max-w-6xl mx-auto mb-10 bg-[#151C2C]/70 backdrop-blur-md p-5 rounded-2xl shadow border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">

          {/* Статус */}
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-300 text-sm mb-1">Статус</label>
            <Select
              value={status || "ALL"}
              onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="bg-[#1C2435] border-none text-gray-100 rounded-2xl w-full h-11 px-4 text-sm">
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
              className="w-full bg-[#1C2435] text-gray-100 border-none rounded-2xl px-4 py-2 h-11"
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2 rounded-2xl font-semibold text-sm h-11"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* ============================
          TABLE
      ============================ */}
      <div className="max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">
            <p>Нет записей 😴</p>
            <Link
              to="/diary/new"
              className="mt-3 inline-block text-blue-500 hover:underline"
            >
              Создать запись
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#151C2C] text-gray-300">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Что происходило</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Действие</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-[#0E1420] hover:bg-[#151C2C] transition"
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {entry.id}
                    </td>

                    <td className="px-4 py-3 text-blue-400 font-medium">
                      {entry.whatName}
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {entry.whatHappenedName}
                    </td>

                    <td className="px-4 py-3 text-gray-400">
                      {entry.whenStarted
                        ? new Date(entry.whenStarted).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.status === "FINISHED"
                            ? "bg-green-600/20 text-green-400"
                            : entry.status === "PLANNED"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-blue-600/20 text-blue-400"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/diary/${entry.id}/edit`}
                        className="inline-block bg-blue-600/80 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded-full"
                      >
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
