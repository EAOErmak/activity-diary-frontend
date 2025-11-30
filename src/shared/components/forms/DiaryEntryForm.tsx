import React, { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";
import { dictionaryApi } from "@/api/dictionaryApi";
import type { DictionaryItem } from "@/shared/types/dictionary";
import type { DiaryEntryCreateDto, EntryStatus } from "@/shared/types/diary";

type ActivityFormItem = {
  id: number;
  nameId: number | null;
  unitId: number | null;
  value: number; // только для UI
};

type Props = {
  onSubmit: (payload: DiaryEntryCreateDto) => Promise<void> | void;
  loading?: boolean;
  title?: string;
  submitLabel?: string;
};

export default function DiaryEntryForm({
  onSubmit,
  loading = false,
  title = "Новая запись",
  submitLabel = "Сохранить",
}: Props) {
  // ===== Dictionaries =====
  const [whatHappenedList, setWhatHappenedList] = useState<DictionaryItem[]>([]);
  const [whatList, setWhatList] = useState<DictionaryItem[]>([]);
  const [itemNames, setItemNames] = useState<DictionaryItem[]>([]);
  const [units, setUnits] = useState<DictionaryItem[]>([]);

  // ===== Selection =====
  const [whatHappenedId, setWhatHappenedId] = useState<number | null>(null);
  const [whatId, setWhatId] = useState<number | null>(null);

  const [anyDescription, setAnyDescription] = useState("");
  const [howYouWereFeeling, setFeeling] = useState<number>(3);
  const [status, setStatus] = useState<EntryStatus>("ACTIVE");
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");

  const [activities, setActivities] = useState<ActivityFormItem[]>([
    { id: 1, nameId: null, unitId: null, value: 1 },
  ]);

  // ===== Load dictionaries =====
  useEffect(() => {
    (async () => {
      const [wh, items, unitsList] = await Promise.all([
        dictionaryApi.getWhatHappened(),
        dictionaryApi.getItemNames(),
        dictionaryApi.getUnits(),
      ]);

      setWhatHappenedList(wh);
      setItemNames(items);
      setUnits(unitsList);
    })();
  }, []);

  // ===== Load WHAT by parent =====
  useEffect(() => {
    if (!whatHappenedId) {
      setWhatList([]);
      setWhatId(null);
      return;
    }

    (async () => {
      const list = await dictionaryApi.getWhatByParent(whatHappenedId);
      setWhatList(list);
      setWhatId(null);
    })();
  }, [whatHappenedId]);

  // ===== Activities =====
  const handleAddActivity = () => {
    setActivities((prev) => [
      ...prev,
      { id: Date.now(), nameId: null, unitId: null, value: 1 },
    ]);
  };

  const handleRemoveActivity = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleActivityChange = (
    id: number,
    field: keyof ActivityFormItem,
    value: number | null
  ) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, [field]: value } : act
      )
    );
  };

  // ===== Submit =====
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
      (a) => a.nameId !== null && a.unitId !== null && a.value > 0
    );

    const payload: DiaryEntryCreateDto = {
      whatHappenedId,
      whatId,
      whenStarted,
      whenEnded,
      howYouWereFeeling,
      anyDescription,
      status,
      whatDidYouDo: filteredActivities.map((a) => ({
        nameId: a.nameId!,   // ✅ строго backend
        unitId: a.unitId!,   // ✅ строго backend
        count: a.value,     // ✅ value -> count
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>

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
              setWhatId(e.target.value ? Number(e.target.value) : null)
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

        {/* DESCRIPTION */}
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

        {/* ACTIVITIES */}
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
                        e.target.value ? Number(e.target.value) : null
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
                        e.target.value ? Number(e.target.value) : null
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
                    value={act.value}
                    onChange={(e) =>
                      handleActivityChange(
                        act.id,
                        "value",
                        e.currentTarget.valueAsNumber
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

        {/* FEELING */}
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

        {/* STATUS */}
        <div>
          <label className="block mb-1 text-gray-300">Статус</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as EntryStatus)
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>

        {/* TIME */}
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
          {loading ? "Сохраняю..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
