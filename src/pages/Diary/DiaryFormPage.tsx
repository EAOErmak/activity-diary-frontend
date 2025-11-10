import React, { useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function DiaryEntryForm() {
  const nav = useNavigate();

  const [what, setWhat] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [anyDescription, setAnyDescription] = useState("");
  const [howYouWereFeeling, setFeeling] = useState<number>(3);
  const [status, setStatus] = useState<"ACTIVE" | "PLANNED" | "FINISHED">("ACTIVE");
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");
  const [activities, setActivities] = useState([{ title: "", description: "", count: 1 }]);

  const handleAddActivity = () => {
    setActivities((prev) => [...prev, { title: "", description: "", count: 1 }]);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleActivityChange = (index: number, field: string, value: string | number) => {
    setActivities((prev) =>
      prev.map((act, i) => (i === index ? { ...act, [field]: value } : act))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(whenStarted);
    const end = new Date(whenEnded);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    const payload = {
      what,
      whatHappened,
      anyDescription,
      howYouWereFeeling,
      status,
      duration,
      whenStarted,
      whenEnded,
      whatDidYouDo: activities.filter((a) => a.title.trim() !== ""),
    };

    try {
      await diaryApi.createEntry(payload);
      alert("✅ Запись успешно добавлена!");
      nav("/diary");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка при создании записи");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E1420] via-[#101725] to-[#131B2F] text-white flex justify-center py-20 px-6 md:px-12">
      <Card className="w-full max-w-2xl bg-[#151C2C]/90 backdrop-blur-md border border-slate-800/50 text-gray-100 rounded-3xl p-10 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_45px_rgba(59,130,246,0.25)]">
        
        {/* Заголовок */}
        <h2 className="text-3xl font-extrabold mb-3 text-center text-blue-400 tracking-tight">
          Новая запись
        </h2>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Добавь впечатления, чувства и активность за день ✨
        </p>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Что сделал */}
          <Input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="Что сделал"
            className="bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-4 py-3 placeholder-gray-500 text-gray-100"
            required
          />

          {/* Что происходило */}
          <Input
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            placeholder="Что происходило"
            className="bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-4 py-3 placeholder-gray-500 text-gray-100"
            required
          />

          {/* Даты */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Когда начал</label>
              <Input
                type="datetime-local"
                value={whenStarted}
                onChange={(e) => setWhenStarted(e.target.value)}
                required
                className="bg-[#1C2435] border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Когда закончил</label>
              <Input
                type="datetime-local"
                value={whenEnded}
                onChange={(e) => setWhenEnded(e.target.value)}
                required
                className="bg-[#1C2435] border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>
          </div>

          {/* Самочувствие */}
          <div className="flex flex-col gap-3">
            <label className="text-gray-300 text-sm">Самочувствие</label>
            <div className="flex justify-between gap-4">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const colors = [
                  "bg-red-500",
                  "bg-orange-500",
                  "bg-yellow-500",
                  "bg-lime-500",
                  "bg-green-500",
                ];
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFeeling(lvl)}
                    className={`w-12 h-12 rounded-full transition-all transform hover:scale-110 ${
                      colors[lvl - 1]
                    } ${
                      lvl === howYouWereFeeling
                        ? "ring-4 ring-blue-400 shadow-lg"
                        : "opacity-70"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Описание */}
          <Textarea
            value={anyDescription}
            onChange={(e) => setAnyDescription(e.target.value)}
            placeholder="Описание / комментарий"
            className="bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl p-4 placeholder-gray-500 text-gray-100 min-h-[100px]"
          />

          {/* Статус */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#1C2435] border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 text-gray-100"
            >
              <option value="ACTIVE">Активный</option>
              <option value="PLANNED">Запланированный</option>
              <option value="FINISHED">Завершённый</option>
            </select>
          </div>

          {/* Активности */}
          <div className="flex flex-col gap-4">
            <label className="text-gray-300 text-sm">Активности</label>
            {activities.map((act, idx) => (
              <div
                key={idx}
                className="relative flex flex-wrap md:flex-nowrap items-center gap-4 p-5 bg-[#1C2435] rounded-2xl border border-slate-700/60 hover:border-blue-500/60 transition-all duration-300"
              >
                <Input
                  placeholder="Название"
                  value={act.title}
                  onChange={(e) => handleActivityChange(idx, "title", e.target.value)}
                  className="flex-1 bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
                <Input
                  placeholder="Описание"
                  value={act.description}
                  onChange={(e) => handleActivityChange(idx, "description", e.target.value)}
                  className="flex-[2] bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
                <Input
                  type="number"
                  min={1}
                  value={act.count}
                  onChange={(e) => handleActivityChange(idx, "count", Number(e.target.value))}
                  placeholder="Кол-во"
                  className="w-24 bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 text-center"
                />
                {activities.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveActivity(idx)}
                    className="bg-red-600 hover:bg-red-700 w-8 h-8 p-0 rounded-full flex items-center justify-center text-sm"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={handleAddActivity}
              className="mt-3 w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 rounded-2xl py-3 font-medium shadow-md shadow-green-700/20 transition"
            >
              + Добавить активность
            </Button>
          </div>

          {/* Кнопка */}
          <Button
            type="submit"
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full py-4 text-lg font-semibold shadow-md shadow-blue-800/30 transition-all duration-300"
          >
            💾 Добавить запись
          </Button>
        </form>
      </Card>
    </div>
  );
}