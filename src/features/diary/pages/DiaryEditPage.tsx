import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DiaryEntryForm, {
  DiaryEntryFormValues,
} from "@/features/diary/components/DiaryEntryForm/DiaryEntryForm";

import { diaryApi } from "@/api/diaryApi";
import type { DiaryEntry, DiaryEntryUpdate } from "@/shared/types/diary";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export default function DiaryEditPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [values, setValues] = useState<DiaryEntryFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"WIN" | "LOSE" | "DELETED">("WIN");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const entry: DiaryEntry = await diaryApi.getEntry(Number(id));

        setStatus(entry.status);

        // Р—Р°РїРѕР»РЅСЏРµРј С„РѕСЂРјСѓ, С‚РѕР»СЊРєРѕ РµСЃР»Рё Р·Р°РїРёСЃСЊ РЅРµ DELETED
        if (entry.status !== "DELETED") {
          setValues({     
            description: entry.description ?? "",
            mood: entry.mood ?? 3,
            status: entry.status, // WIN / LOSE

            whenStarted: entry.whenStarted ?? "",
            whenEnded: entry.whenEnded ?? "",
            tags: [],

            metrics:
              entry.metrics?.map((m) => ({
                id: m.id,
                metricTypeId: m.metricTypeId,
                values: m.values.map((v) => ({
                  unitId: v.unitId,
                  value: v.value,
                })),
              })) ?? [],
          });
        }

      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: DiaryEntryUpdate) => {
    await diaryApi.updateEntry(Number(id), payload);
    nav(`/diary/${id}`);
  };

  if (loading)
    return <p className="text-white text-center p-10">Р—Р°РіСЂСѓР·РєР°...</p>;

  // =============== DELETED ===============
  if (status === "DELETED") {
    return (
      <Card className="max-w-xl mx-auto bg-slate-900 text-white p-8 mt-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Р—Р°РїРёСЃСЊ РЅРµРґРѕСЃС‚СѓРїРЅР°
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Р­С‚Р° Р·Р°РїРёСЃСЊ Р±С‹Р»Р° РїРѕРјРµС‡РµРЅР° РєР°Рє СѓРґР°Р»С‘РЅРЅР°СЏ Рё Р±РѕР»СЊС€Рµ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РёР·РјРµРЅРµРЅР°.
        </p>

        <div className="flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => nav("/diary")}
          >
            Р’РµСЂРЅСѓС‚СЊСЃСЏ РЅР°Р·Р°Рґ
          </Button>
        </div>
      </Card>
    );
  }

  // =============== NORMAL EDIT ===============
  if (!values)
    return <p className="text-white text-center p-10">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РїРёСЃРё</p>;

  return (
    <DiaryEntryForm
      mode="edit"
      title="Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РїРёСЃРё"
      submitLabel="РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ"
      initialValues={values}
      onSubmit={handleSubmit}
    />
  );
}



