import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import type { DiaryEntry } from "@/shared/types/diary";
import { getSyncState } from "@/api/syncApi";
import { useDiaryCache } from "@/shared/store/diaryCache";

type DisplayStatus = "WIN" | "LOSE" | "ACTIVE" | "PLANNED";

// то, что реально хранится в БД
type BackendStatus = "WIN" | "LOSE" | "DELETED";

const STATUS_LABELS: Record<DisplayStatus, string> = {
  WIN: "Успех",
  LOSE: "Провал",
  ACTIVE: "В процессе",
  PLANNED: "Запланировано",
};

// вычисляем “отображаемый” статус по времени и backend-статусу
function getDisplayStatus(entry: DiaryEntry): DisplayStatus {
  const backendStatus = entry.status as BackendStatus;

  const startStr = entry.whenStarted;
  const endStr = entry.whenEnded;

  // если нет времени —fallback в то, что пришло из бэка (DELETED → LOSE)
  if (!startStr || !endStr) {
    if (backendStatus === "WIN" || backendStatus === "LOSE") {
      return backendStatus;
    }
    return "LOSE";
  }

  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);

  // сейчас идёт
  if (now >= start && now <= end) {
    return "ACTIVE";
  }

  // в будущем
  if (now < start) {
    return "PLANNED";
  }

  // в прошлом — берём окончательный статус
  if (backendStatus === "WIN" || backendStatus === "LOSE") {
    return backendStatus;
  }

  // на всякий случай
  return "LOSE";
}

export default function DiaryListPage() {
  const nav = useNavigate();

  const { entries: cachedEntries, version, setEntries: setCache } = useDiaryCache();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<DisplayStatus | "" >("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const accessToken = useAuthStore((s) => s.accessToken);

  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    if (!accessToken) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const sync = await getSyncState();
        if (!sync) {
          setError("Failed to get sync state");
          return;
        }
        const diaryServerVersion = sync.state.DIARY;

        if (diaryServerVersion === version && cachedEntries.length > 0) {
          setEntries(cachedEntries);
          setLoading(false);
          return;
        }

        const page = await diaryApi.getMyEntries();
        setEntries(page.content);
        setCache(page.content, diaryServerVersion);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken]);

  const filtered = useMemo(() => {
    if (!entries.length) return [];

    const safeSearch = (search ?? "").toLowerCase();

    return entries.filter((e) => {
      const displayStatus = getDisplayStatus(e);

      const byStatus = status ? displayStatus === status : true;

      const title = (
        e.subCategoryName ??
        e.categoryName ??
        displayStatus ??
        ""
      ).toLowerCase();

      const bySearch = safeSearch
        ? title.includes(safeSearch)
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
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Мои записи</h1>
          <p className="text-slate-400 text-sm mt-1">
            Найдено: {filtered.length}
          </p>
        </div>

        <Link
          to="/diary/new"
          className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-xl font-semibold text-sm"
        >
          + Создать запись
        </Link>
      </div>

      {/* FILTERS */}
      <div className="w-full max-w-6xl mx-auto mb-10 bg-[#151C2C]/70 backdrop-blur-md p-5 rounded-2xl shadow border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Статус */}
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-300 text-sm mb-1">Статус</label>
            <Select
              value={status || "ALL"}
              onValueChange={(v) =>
                setStatus(v === "ALL" ? "" : (v as DisplayStatus))
              }
            >
              <SelectTrigger className="bg-[#1C2435] border-none text-gray-100 rounded-2xl w-full h-11 px-4 text-sm">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C2435] border border-slate-700/60 text-gray-200 rounded-2xl shadow-lg">
                <SelectItem value="ALL">Все</SelectItem>
                <SelectItem value="ACTIVE">В процессе</SelectItem>
                <SelectItem value="PLANNED">Запланировано</SelectItem>
                <SelectItem value="WIN">Успех</SelectItem>
                <SelectItem value="LOSE">Провал</SelectItem>
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

      {/* TABLE */}
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
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {filtered.map((entry) => {
                  const displayStatus = getDisplayStatus(entry);

                  const statusClass =
                    displayStatus === "WIN"
                      ? "bg-green-600/20 text-green-400"
                      : displayStatus === "LOSE"
                      ? "bg-red-600/20 text-red-400"
                      : displayStatus === "ACTIVE"
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-yellow-600/20 text-yellow-400";

                  return (
                    <tr
                      key={entry.id}
                      className="bg-[#0E1420] hover:bg-[#151C2C] transition"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {entry.id}
                      </td>

                      <td className="px-4 py-3 text-blue-400 font-medium">
                        {entry.subCategoryName}
                      </td>

                      <td className="px-4 py-3 text-gray-300">
                        {entry.categoryName}
                      </td>

                      <td className="px-4 py-3 text-gray-400">
                        {entry.whenStarted
                          ? new Date(entry.whenStarted).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                        >
                          {STATUS_LABELS[displayStatus]}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right space-x-2">
                        {/* открыть всегда можно */}
                        <button
                          onClick={() => nav(`/diary/${entry.id}`)}
                          className="inline-block bg-slate-600/80 hover:bg-slate-600 text-white text-xs px-4 py-1 rounded-full"
                        >
                          Подробнее
                        </button>

                        {/* редактировать имеет смысл только для PLANNED / ACTIVE */}
                        {(displayStatus === "PLANNED" ||
                          displayStatus === "ACTIVE") && (
                          <button
                            onClick={() => nav(`/diary/${entry.id}/edit`)}
                            className="inline-block bg-blue-600/80 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded-full"
                          >
                            Редактировать
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
