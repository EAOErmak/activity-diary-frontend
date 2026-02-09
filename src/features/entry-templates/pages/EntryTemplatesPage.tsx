import { useCallback, useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreateEntryTemplateDialog } from "@/features/entry-templates/components/CreateEntryTemplateDialog";
import { EditEntryTemplateDialog } from "@/features/entry-templates/components/EditEntryTemplateDialog";
import { entryTemplateApi } from "@/api/entryTemplateApi";
import type { DiaryEntryTemplateView, DiaryEntryTemplate } from "@/shared/types/entryTemplate";
import type { EntryTemplateFormValues } from "@/features/entry-templates/components/EntryTemplateForm/EntryTemplateForm";

export default function EntryTemplatesPage() {
  const [templateKind, setTemplateKind] = useState<
    "entry" | "weekday" | "week"
  >("entry");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<DiaryEntryTemplateView[]>([]);
  const [loading, setLoading] = useState(false);
  const [editValues, setEditValues] = useState<EntryTemplateFormValues | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    const result = await entryTemplateApi.listEntryTemplates(0, 50);
    setTemplates(result ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = async (id: number) => {
    const template: DiaryEntryTemplate = await entryTemplateApi.getEntryTemplate(
      id
    );
    setEditValues({
      name: template.name,
      mood: template.mood ?? 3,
      description: template.description ?? "",
      metrics: template.metrics ?? [],
    });
    setEditId(id);
    setEditOpen(true);
  };

  const removeTemplate = async (id: number) => {
    const confirmed = window.confirm("Удалить шаблон?");
    if (!confirmed) return;
    await entryTemplateApi.deleteEntryTemplate(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-page text-foreground p-6 sm:p-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Шаблоны</h1>
          <p className="text-sm text-muted-foreground">
            Выберите тип шаблонов, которые хотите создавать
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          {templateKind === "entry"
            ? "Создать шаблон записи"
            : templateKind === "weekday"
            ? "Создать шаблон дня недели"
            : "Создать шаблон недели"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Тип шаблона</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setTemplateKind("entry")}
              className={`rounded-xl border p-4 text-left transition ${
                templateKind === "entry"
                  ? "border-primary bg-surface_second"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-base font-semibold">Шаблоны записей</div>
              <div className="text-sm text-muted-foreground">
                Быстро создавать повторяющиеся записи
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTemplateKind("weekday")}
              className={`rounded-xl border p-4 text-left transition ${
                templateKind === "weekday"
                  ? "border-primary bg-surface_second"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-base font-semibold">
                Шаблоны дня недели
              </div>
              <div className="text-sm text-muted-foreground">
                Планирование повторяющихся дней
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTemplateKind("week")}
              className={`rounded-xl border p-4 text-left transition ${
                templateKind === "week"
                  ? "border-primary bg-surface_second"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-base font-semibold">Шаблоны недели</div>
              <div className="text-sm text-muted-foreground">
                Сценарии и планы на неделю
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {templateKind === "entry"
              ? "Ваши шаблоны записей"
              : templateKind === "weekday"
              ? "Ваши шаблоны дня недели"
              : "Ваши шаблоны недели"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templateKind === "entry" ? (
            <>
              {loading && (
                <div className="text-sm text-muted-foreground">
                  Загрузка...
                </div>
              )}
              {!loading && templates.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Здесь появятся созданные шаблоны.
                </div>
              )}
              {!loading && templates.length > 0 && (
                <div className="space-y-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-xl border border-border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold truncate">
                            {tpl.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Настроение: {tpl.mood ?? "—"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="surface"
                            onClick={() => openEdit(tpl.id)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => removeTemplate(tpl.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>

                      {tpl.description && (
                        <div className="text-sm text-muted-foreground">
                          {tpl.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              {templateKind === "weekday"
                ? "Здесь будут отображаться шаблоны дня недели."
                : "Здесь будут отображаться шаблоны недели."}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEntryTemplateDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={load}
      />

      {editOpen && editId !== null && editValues && (
        <EditEntryTemplateDialog
          templateId={editId}
          open={editOpen}
          onOpenChange={(next) => {
            setEditOpen(next);
            if (!next) setEditId(null);
          }}
          initialValues={editValues}
          onUpdated={load}
        />
      )}
    </div>
  );
}
