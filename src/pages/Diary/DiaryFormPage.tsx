import React, { useEffect, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { dictionaryApi } from "@/api/dictionaryApi";
import type { DictionaryItem } from "@/types/dictionary";

type ActivityFormItem = {
  id: number;          // временный id в форме
  nameId: number | null;
  unitId: number | null;
  count: number;
};

export default function DiaryEntryForm() {
  const nav = useNavigate();

  // словари
  const [whatHappenedList, setWhatHappenedList] = useState<DictionaryItem[]>([]);
  const [whatList, setWhatList] = useState<DictionaryItem[]>([]);
  const [itemNames, setItemNames] = useState<DictionaryItem[]>([]);
  const [units, setUnits] = useState<DictionaryItem[]>([]);

  // выбранные значения
  const [whatHappenedId, setWhatHappenedId] = useState<number | null>(null);
  const [whatId, setWhatId] = useState<number | null>(null);

  const [anyDescription, setAnyDescription] = useState("");
  const [howYouWereFeeling, setFeeling] = useState<number>(3);
  const [status, setStatus] = useState<"ACTIVE" | "PLANNED" | "FINISHED">(
    "ACTIVE"
  );
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");

  const [activities, setActivities] = useState<ActivityFormItem[]>([
    { id: 1, nameId: null, unitId: null, count: 1 },
  ]);

  const [loading, setLoading] = useState(false);

  // ===== Загрузка словарей =====
  useEffect(() => {
    (async () => {
      try {
        const [wh, items, unitsList] = await Promise.all([
          dictionaryApi.getWhatHappened(),
          dictionaryApi.getItemNames(),
          dictionaryApi.getUnits(),
        ]);
        setWhatHappenedList(wh);
        setItemNames(items);
        setUnits(unitsList);
      } catch (e) {
        console.error(e);
        alert("Ошибка при загрузке словарей");
      }
    })();
  }, []);

  // Загрузка WHAT по выбранному whatHappenedId
  useEffect(() => {
    if (!whatHappenedId) {
      setWhatList([]);
      setWhatId(null);
      return;
    }

    (async () => {
      try {
        const list = await dictionaryApi.getWhatByParent(whatHappenedId);
        setWhatList(list);
        setWhatId(null);
      } catch (e) {
        console.error(e);
        alert("Ошибка при загрузке списка 'Что делал'");
      }
    })();
  }, [whatHappenedId]);

  // ===== Работа с активностями =====
  const handleAddActivity = () => {
    setActivities((prev) => [
      ...prev,
      { id: Date.now(), nameId: null, unitId: null, count: 1 },
    ]);
  };

  const handleRemoveActivity = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleActivityChange = (
    id: number,
    field: keyof ActivityFormItem,
    value: number
  ) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, [field]: value } : act
      )
    );
  };

  // ===== Сабмит =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatHappenedId || !whatId) {
      alert("Выберите 'Что происходило' и 'Что делал'");
      return;
    }

    if (!whenStarted || !whenEnded) {
      alert("Укажите время начала и окончания");
      return;
    }

    const filteredActivities = activities.filter(
      (a) => a.nameId && a.unitId && a.count > 0
    );

    const payload = {
      whatHappenedId,
      whatId,
      whenStarted, // backend ожидает LocalDateTime, ты передаёшь ISO-строку
      whenEnded,
      howYouWereFeeling,
      anyDescription,
      status,
      whatDidYouDo: filteredActivities.map((a) => ({
        nameId: a.nameId as number,
        unitId: a.unitId as number,
        count: a.count,
      })),
    };

    try {
      setLoading(true);
      await diaryApi.createEntry(payload as any); // можно типизировать DiaryEntryCreate, если уже есть
      alert("✅ Запись успешно добавлена!");
      nav("/diary");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка при создании записи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Новая запись
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* WHAT HAPPENED */}
        <div>
          <label className="block mb-1 text-gray-300">Что происходило</label>
          <select
            value={whatHappenedId ?? ""}
            onChange={(e) =>
              setWhatHappenedId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
            required
          >
            <option value="">Выберите...</option>
            {whatHappenedList.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* WHAT */}
        <div>
          <label className="block mb-1 text-gray-300">Что делал</label>
          <select
            value={whatId ?? ""}
            onChange={(e) =>
              setWhatId(e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
            required
            disabled={!whatHappenedId}
          >
            <option value="">Сначала выберите 'Что происходило'</option>
            {whatList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Описание */}
        <div>
          <label className="block mb-1 text-gray-300">
            Описание / Комментарий
          </label>
          <Textarea
            value={anyDescription}
            onChange={(e) => setAnyDescription(e.target.value)}
            placeholder="Очень доволен результатом!"
          />
        </div>

        {/* Активности */}
        <div>
          <label className="block mb-2 text-gray-300">Активности</label>
          <div className="space-y-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="border border-gray-700 p-3 rounded-xl bg-slate-800 relative"
              >
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={act.nameId ?? ""}
                    onChange={(e) =>
                      handleActivityChange(
                        act.id,
                        "nameId",
                        e.target.value ? Number(e.target.value) : 0
                      )
                    }
                    className="p-2 rounded bg-slate-900 border border-gray-700"
                  >
                    <option value="">Активность</option>
                    {itemNames.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={act.unitId ?? ""}
                    onChange={(e) =>
                      handleActivityChange(
                        act.id,
                        "unitId",
                        e.target.value ? Number(e.target.value) : 0
                      )
                    }
                    className="p-2 rounded bg-slate-900 border border-gray-700"
                  >
                    <option value="">Ед. изм.</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    min={1}
                    value={act.count}
                    onChange={(e) =>
                      handleActivityChange(
                        act.id,
                        "count",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Кол-во"
                  />
                </div>

                {activities.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveActivity(act.id)}
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

        {/* Самочувствие */}
        <div>
          <label className="block mb-2 text-gray-300">
            Самочувствие (1–5)
          </label>
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

        {/* Статус */}
        <div>
          <label className="block mb-1 text-gray-300">Статус</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "ACTIVE" | "PLANNED" | "FINISHED")
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>

        {/* Время */}
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
          disabled={loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Сохраняю..." : "Добавить запись"}
        </Button>
      </form>
    </Card>
  );
}
