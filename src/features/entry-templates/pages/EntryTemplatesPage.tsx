import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
import { formatMetricValueForForm } from "@/shared/lib/metricValue";
import {
  getDayTemplatesQueryOptions,
  getEntryTemplatesQueryOptions,
  getWeekTemplatesQueryOptions,
} from "@/shared/lib/queryOptions";
import type { DiaryEntryTemplate } from "@/shared/types/entryTemplate";
import type { DayTemplateView, WeekTemplateView } from "@/shared/types/scheduleTemplate";

const TEMPLATE_PAGE = 0;
const TEMPLATE_PAGE_SIZE = 50;

export default function EntryTemplatesPage() {
  const { t } = useTranslation();
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
  const {
    data: entryTemplates = [],
    isPending: isEntryTemplatesPending,
    refetch: refetchEntryTemplates,
  } = useQuery(getEntryTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));
  const {
    data: dayTemplates = [],
    isPending: isDayTemplatesPending,
    refetch: refetchDayTemplates,
  } = useQuery(getDayTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));
  const {
    data: weekTemplates = [],
    isPending: isWeekTemplatesPending,
    refetch: refetchWeekTemplates,
  } = useQuery(getWeekTemplatesQueryOptions(TEMPLATE_PAGE, TEMPLATE_PAGE_SIZE));

  const entryLoading = isEntryTemplatesPending && entryTemplates.length === 0;
  const dayLoading = isDayTemplatesPending && dayTemplates.length === 0;
  const weekLoading = isWeekTemplatesPending && weekTemplates.length === 0;

  const entryTemplateOptions = useMemo(
    () =>
      entryTemplates.map((tpl) => ({
        id: tpl.id,
        name: tpl.name,
      })),
    [entryTemplates]
  );
  const dayTemplateOptions = useMemo(
    () =>
      dayTemplates.map((tpl) => ({
        id: tpl.id,
        name: tpl.name,
      })),
    [dayTemplates]
  );

  const loadEntryTemplates = useCallback(async () => {
    await refetchEntryTemplates();
  }, [refetchEntryTemplates]);

  const loadDayTemplates = useCallback(async () => {
    await refetchDayTemplates();
  }, [refetchDayTemplates]);

  const loadWeekTemplates = useCallback(async () => {
    await refetchWeekTemplates();
  }, [refetchWeekTemplates]);

  const openEntryTemplateEdit = async (id: number) => {
    const template: DiaryEntryTemplate = await entryTemplateApi.getEntryTemplate(
      id
    );
    setEditValues({
      name: template.name,
      mood: template.mood ?? 3,
      description: template.description ?? "",
      timeStart: template.timeStart ?? "",
      timeEnd: template.timeEnd ?? "",
      metrics:
        template.metrics?.map((metric) => ({
          ...metric,
          values: metric.values.map((value) => ({
            unitId: value.unitId,
            value: formatMetricValueForForm(value.value),
          })),
        })) ?? [],
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
    const confirmed = window.confirm(t("templates.deleteEntryConfirm"));
    if (!confirmed) return;
    await entryTemplateApi.deleteEntryTemplate(id);
    await loadEntryTemplates();
  };

  const removeDayTemplate = async (id: number) => {
    const confirmed = window.confirm(t("templates.deleteDayConfirm"));
    if (!confirmed) return;
    await scheduleTemplateApi.deleteDayTemplate(id);
    await Promise.all([loadDayTemplates(), loadWeekTemplates()]);
  };

  const removeWeekTemplate = async (id: number) => {
    const confirmed = window.confirm(t("templates.deleteWeekConfirm"));
    if (!confirmed) return;
    await scheduleTemplateApi.deleteWeekTemplate(id);
    await loadWeekTemplates();
  };

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-1">
            <h1 className="text-2xl font-semibold">{t("templates.pageTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("templates.pageSubtitle")}
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
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
              ? t("templates.createEntry")
              : templateKind === "weekday"
              ? t("templates.createDay")
              : t("templates.createWeek")}
          </Button>
        </div>

        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>{t("templates.templateType")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setTemplateKind("entry")}
                className={`h-full w-full rounded-2xl px-4 py-3.5 text-left text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  templateKind === "entry"
                    ? "bg-[hsl(var(--input-hover))]"
                    : "bg-input hover:bg-[hsl(var(--input-hover))]"
                }`}
              >
                <div className="text-sm font-semibold sm:text-base">{t("templates.entryTypeTitle")}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t("templates.entryTypeDescription")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTemplateKind("weekday")}
                className={`h-full w-full rounded-2xl px-4 py-3.5 text-left text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  templateKind === "weekday"
                    ? "bg-[hsl(var(--input-hover))]"
                    : "bg-input hover:bg-[hsl(var(--input-hover))]"
                }`}
              >
                <div className="text-sm font-semibold sm:text-base">{t("templates.dayTypeTitle")}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t("templates.dayTypeDescription")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTemplateKind("week")}
                className={`h-full w-full rounded-2xl px-4 py-3.5 text-left text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  templateKind === "week"
                    ? "bg-[hsl(var(--input-hover))]"
                    : "bg-input hover:bg-[hsl(var(--input-hover))]"
                }`}
              >
                <div className="text-sm font-semibold sm:text-base">{t("templates.weekTypeTitle")}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t("templates.weekTypeDescription")}
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>
              {templateKind === "entry"
                ? t("templates.yourEntryTemplates")
                : templateKind === "weekday"
                ? t("templates.yourDayTemplates")
                : t("templates.yourWeekTemplates")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {templateKind === "entry" && (
              <>
                {entryLoading && (
                  <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
                )}
                {!entryLoading && entryTemplates.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t("templates.emptyEntryTemplates")}
                  </div>
                )}
                {!entryLoading && entryTemplates.length > 0 && (
                  <div className="grid gap-3">
                    {entryTemplates.map((tpl) => {
                      const previewDescription = tpl.description
                        ?.replace(/#([\p{L}\p{N}_-]{2,})/gu, "")
                        .replace(/\s{2,}/g, " ")
                        .trim();

                      return (
                        <div
                          key={tpl.id}
                          className="flex h-full flex-col gap-3 rounded-2xl bg-input/80 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="text-lg font-semibold truncate">{tpl.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {t("templates.moodValue", { value: String(tpl.mood ?? "—") })}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <Button
                                size="sm"
                                variant="surface"
                                className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                                onClick={() => openEntryTemplateEdit(tpl.id)}
                              >
                                {t("common.edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="surface"
                                className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                                onClick={() => removeEntryTemplate(tpl.id)}
                              >
                                {t("common.delete")}
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
                  <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
                )}
                {!dayLoading && dayTemplates.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t("templates.emptyDayTemplates")}
                  </div>
                )}
                {!dayLoading && dayTemplates.length > 0 && (
                  <div className="grid gap-3">
                    {dayTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex h-full flex-col gap-3 rounded-2xl bg-input/80 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="text-lg font-semibold truncate">{tpl.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {t("templates.dayItemsCount", { count: tpl.items.length })}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <Button
                              size="sm"
                              variant="surface"
                              className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                              onClick={() => openDayTemplateEdit(tpl)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="surface"
                              className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                              onClick={() => removeDayTemplate(tpl.id)}
                            >
                              {t("common.delete")}
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
                  <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
                )}
                {!weekLoading && weekTemplates.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t("templates.emptyWeekTemplates")}
                  </div>
                )}
                {!weekLoading && weekTemplates.length > 0 && (
                  <div className="grid gap-3">
                    {weekTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex h-full flex-col gap-3 rounded-2xl bg-input/80 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="text-lg font-semibold truncate">{tpl.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {t("templates.weekItemsCount", { count: tpl.items.length })}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <Button
                              size="sm"
                              variant="surface"
                              className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                              onClick={() => openWeekTemplateEdit(tpl)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="surface"
                              className="border border-transparent hover:border-border active:border-border focus-visible:border-border"
                              onClick={() => removeWeekTemplate(tpl.id)}
                            >
                              {t("common.delete")}
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
          entryTemplates={entryTemplateOptions}
          onCreated={loadDayTemplates}
        />

        <CreateWeekTemplateDialog
          open={weekOpen}
          onOpenChange={setWeekOpen}
          dayTemplates={dayTemplateOptions}
          onCreated={loadWeekTemplates}
        />

        <EditDayTemplateDialog
          open={editDayOpen}
          onOpenChange={(next) => {
            setEditDayOpen(next);
            if (!next) setEditingDayTemplate(null);
          }}
          template={editingDayTemplate}
          entryTemplates={entryTemplateOptions}
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
          dayTemplates={dayTemplateOptions}
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
    </div>
  );
}
