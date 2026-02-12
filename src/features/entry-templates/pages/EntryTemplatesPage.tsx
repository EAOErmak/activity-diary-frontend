import { useCallback, useEffect, useState } from "react";

import { entryTemplateApi } from "@/api/entryTemplateApi";
import { scheduleTemplateApi } from "@/api/scheduleTemplateApi";
import { CreateDayTemplateDialog } from "@/features/entry-templates/components/CreateDayTemplateDialog";
import { CreateEntryTemplateDialog } from "@/features/entry-templates/components/CreateEntryTemplateDialog";
import { CreateWeekTemplateDialog } from "@/features/entry-templates/components/CreateWeekTemplateDialog";
import { EditDayTemplateDialog } from "@/features/entry-templates/components/EditDayTemplateDialog";
import { EditEntryTemplateDialog } from "@/features/entry-templates/components/EditEntryTemplateDialog";
import { EditWeekTemplateDialog } from "@/features/entry-templates/components/EditWeekTemplateDialog";
import type { EntryTemplateFormValues } from "@/features/entry-templates/components/EntryTemplateForm/EntryTemplateForm";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { DiaryEntryTemplate, DiaryEntryTemplateView } from "@/shared/types/entryTemplate";
import type { DayTemplateView, WeekTemplateView } from "@/shared/types/scheduleTemplate";

export default function EntryTemplatesPage() {
  const [templateKind, setTemplateKind] = useState<"entry" | "weekday" | "week">(
    "entry"
  );
  const [entryOpen, setEntryOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<EntryTemplateFormValues | null>(
    null
  );

  const [editDayOpen, setEditDayOpen] = useState(false);
  const [editWeekOpen, setEditWeekOpen] = useState(false);
  const [editingDayTemplate, setEditingDayTemplate] = useState<DayTemplateView | null>(
    null
  );
  const [editingWeekTemplate, setEditingWeekTemplate] = useState<WeekTemplateView | null>(
    null
  );

  const [entryTemplates, setEntryTemplates] = useState<DiaryEntryTemplateView[]>([]);
  const [dayTemplates, setDayTemplates] = useState<DayTemplateView[]>([]);
  const [weekTemplates, setWeekTemplates] = useState<WeekTemplateView[]>([]);

  const [entryLoading, setEntryLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [weekLoading, setWeekLoading] = useState(false);

  const loadEntryTemplates = useCallback(async () => {
    setEntryLoading(true);
    try {
      const result = await entryTemplateApi.listEntryTemplates(0, 50);
      setEntryTemplates(result ?? []);
    } finally {
      setEntryLoading(false);
    }
  }, []);

  const loadDayTemplates = useCallback(async () => {
    setDayLoading(true);
    try {
      const result = await scheduleTemplateApi.listDayTemplates(0, 50);
      setDayTemplates(result ?? []);
    } finally {
      setDayLoading(false);
    }
  }, []);

  const loadWeekTemplates = useCallback(async () => {
    setWeekLoading(true);
    try {
      const result = await scheduleTemplateApi.listWeekTemplates(0, 50);
      setWeekTemplates(result ?? []);
    } finally {
      setWeekLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntryTemplates();
    void loadDayTemplates();
    void loadWeekTemplates();
  }, [loadEntryTemplates, loadDayTemplates, loadWeekTemplates]);

  const openEntryTemplateEdit = async (id: number) => {
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

  const openDayTemplateEdit = (template: DayTemplateView) => {
    setEditingDayTemplate(template);
    setEditDayOpen(true);
  };

  const openWeekTemplateEdit = (template: WeekTemplateView) => {
    setEditingWeekTemplate(template);
    setEditWeekOpen(true);
  };

  const removeEntryTemplate = async (id: number) => {
    const confirmed = window.confirm("Удалить шаблон?");
    if (!confirmed) return;
    await entryTemplateApi.deleteEntryTemplate(id);
    await loadEntryTemplates();
  };

  const removeDayTemplate = async (id: number) => {
    const confirmed = window.confirm("Удалить шаблон дня?");
    if (!confirmed) return;
    await scheduleTemplateApi.deleteDayTemplate(id);
    await Promise.all([loadDayTemplates(), loadWeekTemplates()]);
  };

  const removeWeekTemplate = async (id: number) => {
    const confirmed = window.confirm("Удалить шаблон недели?");
    if (!confirmed) return;
    await scheduleTemplateApi.deleteWeekTemplate(id);
    await loadWeekTemplates();
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
        <Button
          onClick={() => {
            if (templateKind === "entry") {
              setEntryOpen(true);
              return;
            }
            if (templateKind === "weekday") {
              setDayOpen(true);
              return;
            }
            setWeekOpen(true);
          }}
        >
          {templateKind === "entry"
            ? "Создать шаблон записи"
            : templateKind === "weekday"
            ? "Создать шаблон дня"
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
              className={`rounded-xl p-4 text-left bg-input text-foreground transition-colors hover:bg-[hsl(var(--input-hover))] focus:outline-none focus:ring-2 focus:ring-ring ${
                templateKind === "entry"
                  ? "border border-primary"
                  : "border border-transparent"
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
              className={`rounded-xl p-4 text-left bg-input text-foreground transition-colors hover:bg-[hsl(var(--input-hover))] focus:outline-none focus:ring-2 focus:ring-ring ${
                templateKind === "weekday"
                  ? "border border-primary"
                  : "border border-transparent"
              }`}
            >
              <div className="text-base font-semibold">Шаблоны дней</div>
              <div className="text-sm text-muted-foreground">
                Планирование повторяющихся дней
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTemplateKind("week")}
              className={`rounded-xl p-4 text-left bg-input text-foreground transition-colors hover:bg-[hsl(var(--input-hover))] focus:outline-none focus:ring-2 focus:ring-ring ${
                templateKind === "week"
                  ? "border border-primary"
                  : "border border-transparent"
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
              ? "Ваши шаблоны дня"
              : "Ваши шаблоны недели"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templateKind === "entry" && (
            <>
              {entryLoading && (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              )}
              {!entryLoading && entryTemplates.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Здесь появятся созданные шаблоны.
                </div>
              )}
              {!entryLoading && entryTemplates.length > 0 && (
                <div className="space-y-3">
                  {entryTemplates.map((tpl) => {
                    const previewDescription = tpl.description
                      ?.replace(/#([\p{L}\p{N}_-]{2,})/gu, "")
                      .replace(/\s{2,}/g, " ")
                      .trim();

                    return (
                    <div
                      key={tpl.id}
                      className="rounded-xl bg-input p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold truncate">{tpl.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Настроение: {tpl.mood ?? "—"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => openEntryTemplateEdit(tpl.id)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => removeEntryTemplate(tpl.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>

                      {previewDescription && (
                        <div className="text-sm text-muted-foreground">
                          {previewDescription}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {templateKind === "weekday" && (
            <>
              {dayLoading && (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              )}
              {!dayLoading && dayTemplates.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Здесь появятся шаблоны дня.
                </div>
              )}
              {!dayLoading && dayTemplates.length > 0 && (
                <div className="space-y-3">
                  {dayTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-xl bg-input p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold truncate">{tpl.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Записей в шаблоне: {tpl.items.length}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => openDayTemplateEdit(tpl)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => removeDayTemplate(tpl.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {templateKind === "week" && (
            <>
              {weekLoading && (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              )}
              {!weekLoading && weekTemplates.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Здесь появятся шаблоны недели.
                </div>
              )}
              {!weekLoading && weekTemplates.length > 0 && (
                <div className="space-y-3">
                  {weekTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-xl bg-input p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold truncate">{tpl.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Дней в шаблоне: {tpl.items.length}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => openWeekTemplateEdit(tpl)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="surface"
                            className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                            onClick={() => removeWeekTemplate(tpl.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateEntryTemplateDialog
        open={entryOpen}
        onOpenChange={setEntryOpen}
        onCreated={loadEntryTemplates}
      />

      <CreateDayTemplateDialog
        open={dayOpen}
        onOpenChange={setDayOpen}
        entryTemplates={entryTemplates.map((tpl) => ({
          id: tpl.id,
          name: tpl.name,
        }))}
        onCreated={loadDayTemplates}
      />

      <CreateWeekTemplateDialog
        open={weekOpen}
        onOpenChange={setWeekOpen}
        dayTemplates={dayTemplates.map((tpl) => ({
          id: tpl.id,
          name: tpl.name,
        }))}
        onCreated={loadWeekTemplates}
      />

      <EditDayTemplateDialog
        open={editDayOpen}
        onOpenChange={(next) => {
          setEditDayOpen(next);
          if (!next) setEditingDayTemplate(null);
        }}
        template={editingDayTemplate}
        entryTemplates={entryTemplates.map((tpl) => ({
          id: tpl.id,
          name: tpl.name,
        }))}
        onUpdated={async () => {
          await Promise.all([loadDayTemplates(), loadWeekTemplates()]);
        }}
      />

      <EditWeekTemplateDialog
        open={editWeekOpen}
        onOpenChange={(next) => {
          setEditWeekOpen(next);
          if (!next) setEditingWeekTemplate(null);
        }}
        template={editingWeekTemplate}
        dayTemplates={dayTemplates.map((tpl) => ({
          id: tpl.id,
          name: tpl.name,
        }))}
        onUpdated={loadWeekTemplates}
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
          onUpdated={loadEntryTemplates}
        />
      )}
    </div>
  );
}
