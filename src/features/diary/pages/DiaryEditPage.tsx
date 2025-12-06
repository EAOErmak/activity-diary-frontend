import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { dictionaryApi } from "@/api/dictionaryApi";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";

import type {
  DiaryEntryDto,
  DiaryEntryUpdateDto,
  EntryStatus,
} from "@/shared/types/diary";
import type { DictionaryItem } from "@/shared/types/dictionary";

type ActivityFormItem = {
  id: number;                // локальный ID
  backendId?: number | null; // ID из БД
  nameId: number | null;
  unitId: number | null;
  value: number;
};

export default function DiaryEditPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);

  // ===== Dictionaries =====
  const [whatHappenedList, setWhatHappenedList] = useState<DictionaryItem[]>([]);
  const [whatList, setWhatList] = useState<DictionaryItem[]>([]);
  const [itemNames, setItemNames] = useState<DictionaryItem[]>([]);
  const [units, setUnits] = useState<DictionaryItem[]>([]);

  // ===== Fields =====
  const [whatHappenedId, setWhatHappenedId] = useState<number | null>(null);
  const [whatId, setWhatId] = useState<number | null>(null);

  const [anyDescription, setAnyDescription] = useState("");
  const [howYouWereFeeling, setFeeling] = useState<number>(3);
  const [status, setStatus] = useState<EntryStatus>("ACTIVE");
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");

  const [activities, setActivities] = useState<ActivityFormItem[]>([]);

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

  // ===== Load Entry =====
  useEffect(() => {
    if (!id) return;

    (async () => {
      const data: DiaryEntryDto = await diaryApi.getEntry(Number(id));

      setWhatHappenedId(data.whatHappenedId);
      setWhatId(data.whatId);
      setAnyDescription(data.anyDescription ?? "");
      setFeeling(data.howYouWereFeeling ?? 3);
      setStatus(data.status as EntryStatus);
      setWhenStarted(data.whenStarted ?? "");
      setWhenEnded(data.whenEnded ?? "");

      setActivities(
        data.whatDidYouDo?.map((a) => ({
          id: a.id,
          backendId: a.id,
          nameId: a.nameId,
          unitId: a.unitId,
          value: a.count,
        })) ?? []
      );

      setLoading(false);
    })();
  }, [id]);

  // ===== Load WHAT by parent =====
  useEffect(() => {
    if (!whatHappenedId) return;

    (async () => {
      const list = await dictionaryApi.getWhatByParent(whatHappenedId);
      setWhatList(list);
    })();
  }, [whatHappenedId]);

  // ===== Activities =====
  const handleActivityChange = (
    id: number,
    field: keyof ActivityFormItem,
    value: number | null
  ) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleAddActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now(),
        backendId: null,
        nameId: null,
        unitId: null,
        value: 1,
      },
    ]);
  };

  const handleRemoveActivity = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // ===== Submit =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: DiaryEntryUpdateDto = {
      whatHappenedId: whatHappenedId ?? undefined,
      whatId: whatId ?? undefined,
      whenStarted,
      whenEnded,
      howYouWereFeeling,
      anyDescription,
      status,

      whatDidYouDo: activities
        .filter((a) => a.nameId && a.unitId)
        .map((a) => {
          // ✅ СУЩЕСТВУЮЩАЯ АКТИВНОСТЬ (update)
          if (a.backendId) {
            return {
              id: a.backendId,      // строго number
              nameId: a.nameId!,
              unitId: a.unitId!,
              count: a.value,
            };
          }

          // ✅ НОВАЯ АКТИВНОСТЬ (create)
          return {
            nameId: a.nameId!,
            unitId: a.unitId!,
            count: a.value,
          };
        }),
    };

    try {
      await diaryApi.updateEntry(Number(id), payload);
      alert("✅ Запись обновлена!");
      nav(`/diary/${id}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Ошибка обновления");
    }
  };

  if (loading)
    return <p className="text-white p-10 text-center">Загрузка...</p>;

  // ===== UI =====
  return (
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        ✏️ Редактирование записи
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* WHAT HAPPENED */}
        <select
          value={whatHappenedId ?? ""}
          onChange={(e) =>
            setWhatHappenedId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full p-2 rounded bg-slate-800"
        >
          <option value="">— Что происходило —</option>
          {whatHappenedList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* WHAT */}
        <select
          value={whatId ?? ""}
          onChange={(e) =>
            setWhatId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full p-2 rounded bg-slate-800"
        >
          <option value="">— Тип активности —</option>
          {whatList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <Textarea
          placeholder="Комментарий"
          value={anyDescription}
          onChange={(e) => setAnyDescription(e.target.value)}
        />

        {/* ACTIVITIES */}
        {activities.map((a) => (
          <div key={a.id} className="grid grid-cols-3 gap-2 items-center">
            <select
              value={a.nameId ?? ""}
              onChange={(e) =>
                handleActivityChange(
                  a.id,
                  "nameId",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Элемент</option>
              {itemNames.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>

            <select
              value={a.unitId ?? ""}
              onChange={(e) =>
                handleActivityChange(
                  a.id,
                  "unitId",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Ед.</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <Input
              type="number"
              value={a.value}
              onChange={(e) =>
                handleActivityChange(
                  a.id,
                  "value",
                  Number(e.target.value)
                )
              }
              min={1}
            />

            <Button type="button" onClick={() => handleRemoveActivity(a.id)}>
              ✕
            </Button>
          </div>
        ))}

        <Button type="button" onClick={handleAddActivity}>
          + Добавить активность
        </Button>

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EntryStatus)}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="PLANNED">PLANNED</option>
          <option value="FINISHED">FINISHED</option>
        </select>

        <Input
          type="datetime-local"
          value={whenStarted}
          onChange={(e) => setWhenStarted(e.target.value)}
        />

        <Input
          type="datetime-local"
          value={whenEnded}
          onChange={(e) => setWhenEnded(e.target.value)}
        />

        <Button type="submit">💾 Сохранить</Button>
      </form>
    </Card>
  );
}
