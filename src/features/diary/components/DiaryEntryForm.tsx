import React, { useEffect, useState } from "react";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

import { dictionaryApi } from "@/api/dictionaryApi";
import { diaryApi } from "@/api/diaryApi";

import type {
  DiaryEntryCreate,
  DiaryEntryUpdate,
  EntryStatus,
  EntryFieldConfig,
} from "@/shared/types/diary";
import type { DictionaryItem } from "@/shared/types/dictionary";

// ======================================================
// TYPES
// ======================================================

export type DiaryEntryFormValues = {
  categoryId: number | null;
  subCategoryId: number | null;

  description: string;
  mood: number;

  status: EntryStatus; // only for edit UI

  whenStarted: string;
  whenEnded: string;

  metrics: {
    id: number;
    backendId?: number | null;
    nameId: number | null;
    unitId: number | null;
    value: number;
  }[];
};

type CreateProps = {
  mode: "create";
  title?: string;
  submitLabel?: string;

  onSubmit: (payload: DiaryEntryCreate) => void | Promise<void>;
};

type EditProps = {
  mode: "edit";
  initialValues: DiaryEntryFormValues;
  title?: string;
  submitLabel?: string;

  onSubmit: (payload: DiaryEntryUpdate) => void | Promise<void>;
};

// Форма принимает либо CreateProps, либо EditProps
type Props = CreateProps | EditProps;

// ======================================================
// COMPONENT
// ======================================================

export default function DiaryEntryForm(props: Props) {
  const { mode, title = "Запись", submitLabel = "Сохранить", onSubmit } = props;

  // Значения формы
  const [values, setValues] = useState<DiaryEntryFormValues>(
    mode === "edit"
      ? props.initialValues
      : {
          categoryId: null,
          subCategoryId: null,

          description: "",
          mood: 3,
          status: "LOSE",

          whenStarted: "",
          whenEnded: "",

          metrics: [{ id: 1, nameId: null, unitId: null, value: 1 }],
        }
  );

  const [config, setConfig] = useState<EntryFieldConfig | null>(null);

  const [categories, setCategories] = useState<DictionaryItem[]>([]);
  const [subCategories, setSubCategories] = useState<DictionaryItem[]>([]);
  const [metricNames, setMetricNames] = useState<DictionaryItem[]>([]);
  const [units, setUnits] = useState<DictionaryItem[]>([]);

  // ======================================================
  // LOAD DICTIONARIES
  // ======================================================

  useEffect(() => {
    (async () => {
      const [cats, metrics, unitsList] = await Promise.all([
        dictionaryApi.getCategory(),
        dictionaryApi.getMetrics(),
        dictionaryApi.getUnits(),
      ]);

      setCategories(cats);
      setMetricNames(metrics);
      setUnits(unitsList);
    })();
  }, []);

  // ======================================================
  // CONFIG (depends on category)
  // ======================================================

  useEffect(() => {
    if (!values.categoryId) {
      setConfig(null);
      return;
    }

    (async () => {
      const cfg = await diaryApi.getEntryFieldConfig(values.categoryId!);
      setConfig(cfg);
    })();
  }, [values.categoryId]);

  // ======================================================
  // SUB CATEGORIES (depends on category)
  // ======================================================

  useEffect(() => {
    if (!values.categoryId) {
      setSubCategories([]);
      return;
    }

    (async () => {
      const sc = await dictionaryApi.getSubCategoryByParent(values.categoryId!);
      setSubCategories(sc);
    })();
  }, [values.categoryId]);

  // ======================================================
  // HANDLERS
  // ======================================================

  const setField = (field: keyof DiaryEntryFormValues, val: any) => {
    setValues((v) => ({ ...v, [field]: val }));
  };

  const updateMetric = (id: number, field: string, val: any) => {
    setValues((v) => ({
      ...v,
      metrics: v.metrics.map((m) =>
        m.id === id ? { ...m, [field]: val } : m
      ),
    }));
  };

  const addMetric = () => {
    setValues((v) => ({
      ...v,
      metrics: [
        ...v.metrics,
        {
          id: Date.now(),
          backendId: null,
          nameId: null,
          unitId: null,
          value: 1,
        },
      ],
    }));
  };

  const removeMetric = (id: number) => {
    setValues((v) => ({
      ...v,
      metrics: v.metrics.filter((m) => m.id !== id),
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      const payload: DiaryEntryCreate = {
        categoryId: values.categoryId!,
        subCategoryId: values.subCategoryId,

        whenStarted: values.whenStarted,
        whenEnded: values.whenEnded,

        mood: values.mood,
        description: values.description,

        metrics: values.metrics
          .filter((m) => m.nameId && m.unitId)
          .map((m) => ({
            metricId: m.nameId!,
            unitId: m.unitId!,
            value: m.value,
          })),
      };

      onSubmit(payload);
      return;
    }

    // EDIT MODE
    const payload: DiaryEntryUpdate = {
      categoryId: values.categoryId ?? undefined,
      subCategoryId: values.subCategoryId ?? undefined,

      whenStarted: values.whenStarted,
      whenEnded: values.whenEnded,

      mood: values.mood,
      description: values.description,

      status: values.status, // WIN / LOSE

      metrics: values.metrics
        .filter((m) => m.nameId && m.unitId)
        .map((m) =>
          m.backendId
            ? {
                id: m.backendId,
                metricId: m.nameId!,
                unitId: m.unitId!,
                value: m.value,
              }
            : {
                metricId: m.nameId!,
                unitId: m.unitId!,
                value: m.value,
              }
        ),
    };

    onSubmit(payload);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Card className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CATEGORY */}
        <div>
          <label className="block mb-1 text-gray-300">Что происходило</label>
          <select
            className="w-full p-2 rounded bg-slate-800 border border-gray-700"
            value={values.categoryId ?? ""}
            onChange={(e) =>
              setField(
                "categoryId",
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Выберите...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB CATEGORY */}
        {config?.showSubCategory && (
          <div>
            <label className="block mb-1 text-gray-300">Что делал</label>
            <select
              className="w-full p-2 rounded bg-slate-800 border border-gray-700"
              value={values.subCategoryId ?? ""}
              onChange={(e) =>
                setField(
                  "subCategoryId",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              required={config.requiredSubCategory}
              disabled={!values.categoryId}
            >
              <option value="">Выберите...</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DESCRIPTION */}
        {config?.showDescription && (
          <div>
            <label className="block mb-1 text-gray-300">Комментарий</label>
            <Textarea
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Комментарий к записи..."
            />
          </div>
        )}

        {/* METRICS */}
        {config?.showMetrics && (
          <div>
            <label className="block mb-2 text-gray-300">Активности</label>

            <div className="space-y-4">
              {values.metrics.map((m) => (
                <div
                  key={m.id}
                  className="border border-gray-700 p-3 rounded-xl bg-slate-800 relative"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      className="p-2 rounded bg-slate-900 border border-gray-700"
                      value={m.nameId ?? ""}
                      onChange={(e) =>
                        updateMetric(
                          m.id,
                          "nameId",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">Активность</option>
                      {metricNames.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="p-2 rounded bg-slate-900 border border-gray-700"
                      value={m.unitId ?? ""}
                      onChange={(e) =>
                        updateMetric(
                          m.id,
                          "unitId",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
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
                      value={m.value}
                      onChange={(e) =>
                        updateMetric(m.id, "value", +e.target.value)
                      }
                    />
                  </div>

                  {values.metrics.length > 1 && (
                    <Button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                      onClick={() => removeMetric(m.id)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              className="w-full mt-3 bg-green-600 hover:bg-green-700"
              onClick={addMetric}
            >
              + Добавить активность
            </Button>
          </div>
        )}

        {/* MOOD */}
        {config?.showMood && (
          <div>
            <label className="block mb-2 text-gray-300">
              Самочувствие (1–5)
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setField("mood", lvl)}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    lvl <= values.mood
                      ? "bg-blue-500 border-blue-400"
                      : "bg-slate-800 border-gray-600"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATUS — only in edit */}
        {mode === "edit" && (
          <div>
            <label className="block mb-2 text-gray-300">Статус</label>

            <div className="flex items-center gap-4">
              {/* LOSE */}
              <button
                type="button"
                onClick={() => setField("status", "LOSE")}
                className={`w-12 h-12 rounded-full border-2 text-xl transition ${
                  values.status === "LOSE"
                    ? "bg-red-600 border-red-400"
                    : "bg-slate-800 border-gray-600"
                }`}
              >
                ✕
              </button>

              {/* WIN */}
              <button
                type="button"
                onClick={() => setField("status", "WIN")}
                className={`w-12 h-12 rounded-full border-2 text-xl transition ${
                  values.status === "WIN"
                    ? "bg-green-600 border-green-400"
                    : "bg-slate-800 border-gray-600"
                }`}
              >
                ✔
              </button>
            </div>
          </div>
        )}

        {/* TIME */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Когда начал</label>
            <Input
              type="datetime-local"
              value={values.whenStarted}
              onChange={(e) => setField("whenStarted", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Когда закончил</label>
            <Input
              type="datetime-local"
              value={values.whenEnded}
              onChange={(e) => setField("whenEnded", e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
