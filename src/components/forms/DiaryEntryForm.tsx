import React, { useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/Card";

export default function DiaryEntryForm() {
  const nav = useNavigate();

  const [what, setWhat] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [anyDescription, setAnyDescription] = useState("");
  const [howYouWereFeeling, setFeeling] = useState<number>(3);
  const [status, setStatus] = useState<"ACTIVE" | "PLANNED" | "FINISHED">("ACTIVE");
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");
  const [activities, setActivities] = useState([
    { title: "", description: "", count: 1 },
  ]);

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
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Новая запись</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-gray-300">Что сделал</label>
          <Input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="Сделал JWT и email verification"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Что происходило</label>
          <Input
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            placeholder="Учился Spring Boot"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Описание / Комментарий</label>
          <Textarea
            value={anyDescription}
            onChange={(e) => setAnyDescription(e.target.value)}
            placeholder="Очень доволен результатом!"
          />
        </div>

        {/* 🔹 Динамический список действий */}
        <div>
          <label className="block mb-2 text-gray-300">Активности</label>
          <div className="space-y-4">
            {activities.map((act, idx) => (
              <div
                key={idx}
                className="border border-gray-700 p-3 rounded-xl bg-slate-800 relative"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Название"
                    value={act.title}
                    onChange={(e) => handleActivityChange(idx, "title", e.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={act.count}
                    onChange={(e) =>
                      handleActivityChange(idx, "count", Number(e.target.value))
                    }
                    placeholder="Количество"
                  />
                </div>

                <Textarea
                  className="mt-2"
                  placeholder="Описание"
                  value={act.description}
                  onChange={(e) =>
                    handleActivityChange(idx, "description", e.target.value)
                  }
                />

                {activities.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveActivity(idx)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleAddActivity}
            className="mt-3 bg-green-600 hover:bg-green-700 w-full"
          >
            + Добавить активность
          </Button>
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Самочувствие (1–5)</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFeeling(lvl)}
                className={`w-10 h-10 rounded-full border-2 transition ${
                  lvl <= howYouWereFeeling
                    ? "bg-blue-500 border-blue-400"
                    : "bg-slate-800 border-gray-600"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Когда начал</label>
            <Input
              type="datetime-local"
              value={whenStarted}
              onChange={(e) => setWhenStarted(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Когда закончил</label>
            <Input
              type="datetime-local"
              value={whenEnded}
              onChange={(e) => setWhenEnded(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Добавить запись
        </Button>
      </form>
    </Card>
  );
}
