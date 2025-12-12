import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { diaryApi } from "@/api/diaryApi";
import { dictionaryApi } from "@/api/dictionaryApi";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";

import type {
  DiaryEntry,
  DiaryEntryUpdate,
  EntryStatus,
} from "@/shared/types/diary";
import type { DictionaryItem } from "@/shared/types/dictionary";

type ActivityFormItem = {
  id: number;
  backendId?: number | null;
  nameId: number | null;
  unitId: number | null;
  value: number;
};

export default function DiaryEditPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loadingEntry, setLoadingEntry] = useState(true);

  // Dictionaries
  const [categoryList, setCategoryList] = useState<DictionaryItem[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<DictionaryItem[]>([]);
  const [metricNames, setMetricNames] = useState<DictionaryItem[]>([]);
  const [units, setUnits] = useState<DictionaryItem[]>([]);

  // Entry fields
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState<number>(3);
  const [status, setStatus] = useState<EntryStatus | undefined>(undefined);
  const [whenStarted, setWhenStarted] = useState("");
  const [whenEnded, setWhenEnded] = useState("");

  const [activities, setActivities] = useState<ActivityFormItem[]>([]);

  // Load dictionaries
  useEffect(() => {
    (async () => {
      const [wh, metrics, unitsList] = await Promise.all([
        dictionaryApi.getCategory(),
        dictionaryApi.getMetrics(),
        dictionaryApi.getUnits(),
      ]);

      setCategoryList(wh);
      setMetricNames(metrics);
      setUnits(unitsList);
    })();
  }, []);

  // Load entry
  useEffect(() => {
    if (!id) return;

    (async () => {
      const data: DiaryEntry = await diaryApi.getEntry(Number(id));

      setCategoryId(data.categoryId);
      setSubCategoryId(data.subCategoryId);
      setDescription(data.description ?? "");
      setMood(data.mood ?? 3);
      setStatus(data.status as EntryStatus);
      setWhenStarted(data.whenStarted ?? "");
      setWhenEnded(data.whenEnded ?? "");

      setActivities(
        data.metrics?.map((m) => ({
          id: m.id,
          backendId: m.id,
          nameId: m.metricTypeId,
          unitId: m.unitId,
          value: m.value,
        })) ?? []
      );

      setLoadingEntry(false);
    })();
  }, [id]);

  // Load WHAT by parent
  useEffect(() => {
    if (!categoryId) {
      setSubCategoryList([]);
      setSubCategoryId(null);
      return;
    }

    (async () => {
      const list = await dictionaryApi.getSubCategoryByParent(categoryId);
      setSubCategoryList(list);
    })();
  }, [categoryId]);

  // Activity handlers
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

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: DiaryEntryUpdate = {
      categoryId: categoryId ?? undefined,
      subCategoryId: subCategoryId ?? undefined,
      description,
      mood,
      status,
      whenStarted,
      whenEnded,
      metrics: activities
        .filter((a) => a.nameId && a.unitId)
        .map((a) =>
          a.backendId
            ? {
                id: a.backendId,
                metricId: a.nameId!,
                unitId: a.unitId!,
                value: a.value,
              }
            : {
                metricId: a.nameId!,
                unitId: a.unitId!,
                value: a.value,
              }
        ),
    };

    try {
      await diaryApi.updateEntry(Number(id), payload);
      nav(`/diary/${id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Ошибка обновления");
    }
  };

  if (loadingEntry)
    return (
      <p className="text-white text-center p-10 text-xl">
        Загрузка записи...
      </p>
    );

  return (
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Редактирование записи
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CATEGORY */}
        <div>
          <label className="block mb-1 text-gray-300">Что происходило</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
          >
            <option value="">Выберите...</option>
            {categoryList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB CATEGORY */}
        <div>
          <label className="block mb-1 text-gray-300">Что делал</label>
          <select
            value={subCategoryId ?? ""}
            onChange={(e) =>
              setSubCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
            disabled={!categoryId}
          >
            <option value="">Выберите...</option>
            {subCategoryList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1 text-gray-300">Комментарий</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Комментарий к записи..."
          />
        </div>

        {/* METRICS */}
        <div>
          <label className="block mb-2 text-gray-300">Активности</label>

          <div className="space-y-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="border border-gray-700 p-3 rounded-xl bg-slate-800 relative"
              >
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={a.nameId ?? ""}
                    onChange={(e) =>
                      handleActivityChange(
                        a.id,
                        "nameId",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="p-2 rounded bg-slate-900 border border-gray-700"
                  >
                    <option value="">Активность</option>
                    {metricNames.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
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
                    value={a.value}
                    min={1}
                    onChange={(e) =>
                      handleActivityChange(a.id, "value", +e.target.value)
                    }
                  />
                </div>

                {activities.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveActivity(a.id)}
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

        {/* MOOD */}
        <div>
          <label className="block mb-2 text-gray-300">
            Самочувствие (1–5)
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setMood(lvl)}
                className={`w-10 h-10 rounded-full border-2 transition ${
                  lvl <= mood
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
            onChange={(e) => setStatus(e.target.value as EntryStatus)}
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
          >
            <option value="LOSE">LOSE</option>
            <option value="WIN">WIN</option>
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
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Когда закончил</label>
            <Input
              type="datetime-local"
              value={whenEnded}
              onChange={(e) => setWhenEnded(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Сохранить изменения
        </Button>
      </form>
    </Card>
  );
}
