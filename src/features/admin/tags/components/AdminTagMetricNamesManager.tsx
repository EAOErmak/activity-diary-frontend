import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Link2, Plus, Save, Search, Tags, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { adminTagMetricLinksApi } from "@/api/admin/adminTagMetricLinksApi";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { getIntlLocale } from "@/shared/i18n/locale";
import { syncTagMetricCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import { adminKeys } from "@/shared/lib/queryKeys";
import {
  getAdminDictionaryByTypeQueryOptions,
  getAdminTagMetricsQueryOptions,
  getTagListQueryOptions,
} from "@/shared/lib/queryOptions";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AdminDictionaryListResponse,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";
import type { AdminTagMetricLink } from "@/shared/types/adminTagMetricLink";
import type { Tag } from "@/shared/types/tag";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const apiMessage = error.response?.data?.message?.trim();

    if (apiMessage) {
      return apiMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function normalizeMetricNameIds(metricNameIds: number[]) {
  return [...new Set(metricNameIds)].sort((left, right) => left - right);
}

function mapLinkMetricNameIds(links: AdminTagMetricLink[]) {
  return normalizeMetricNameIds(links.map((link) => link.metricNameId));
}

function areSelectionsEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function sortMetricNames(items: DictionaryResponse[], locale: string) {
  return [...items].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    const labelCompare = left.label.localeCompare(right.label, locale);
    return labelCompare || left.id - right.id;
  });
}

function mergeDictionaryLookup(
  current: Record<number, DictionaryResponse>,
  items: DictionaryResponse[]
) {
  if (items.length === 0) {
    return current;
  }

  let changed = false;
  const next = { ...current };

  for (const item of items) {
    if (next[item.id] !== item) {
      next[item.id] = item;
      changed = true;
    }
  }

  return changed ? next : current;
}

type AdminTagMetricNamesManagerProps = {
  updatedTag?: Tag | null;
};

export function AdminTagMetricNamesManager({
  updatedTag = null,
}: AdminTagMetricNamesManagerProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [tagQuery, setTagQuery] = useState("");
  const [metricQuery, setMetricQuery] = useState("");
  const [metricPage, setMetricPage] = useState(DEFAULT_PAGE);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [initialMetricNameIds, setInitialMetricNameIds] = useState<number[]>([]);
  const [draftMetricNameIds, setDraftMetricNameIds] = useState<number[]>([]);
  const [knownMetricNames, setKnownMetricNames] = useState<Record<number, DictionaryResponse>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const debouncedTagQuery = useDebouncedValue(tagQuery.trim(), 180);
  const debouncedMetricQuery = useDebouncedValue(metricQuery.trim(), 300);

  function sortTags(tags: Tag[]) {
    return [...tags].sort((left, right) => left.name.localeCompare(right.name, locale));
  }

  const tagsQuery = useQuery<Tag[], Error>(getTagListQueryOptions(debouncedTagQuery));
  const metricNamesQuery = useQuery<AdminDictionaryListResponse, Error>(
    getAdminDictionaryByTypeQueryOptions({
      type: "METRIC_NAME",
      page: metricPage,
      limit: DEFAULT_LIMIT,
      q: debouncedMetricQuery,
    })
  );
  const linksQuery = useQuery<AdminTagMetricLink[], Error>({
    ...getAdminTagMetricsQueryOptions(selectedTagId ?? 0),
    enabled: selectedTagId != null,
  });

  const availableTags = useMemo(() => {
    const tags = sortTags(tagsQuery.data ?? []);

    if (updatedTag == null || !tags.some((tag) => tag.id === updatedTag.id)) {
      return tags;
    }

    return sortTags(
      tags.map((tag) => (tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag))
    );
  }, [locale, tagsQuery.data, updatedTag]);

  const metricNameItems = metricNamesQuery.data?.items ?? [];

  useEffect(() => {
    setKnownMetricNames((current) => mergeDictionaryLookup(current, metricNameItems));
  }, [metricNameItems]);

  const metricNames = useMemo(
    () => sortMetricNames(metricNameItems, locale),
    [locale, metricNameItems]
  );

  const isLoadingTags = tagsQuery.isPending;
  const isLoadingMetricNames = metricNamesQuery.isPending;
  const isLoadingLinks = selectedTagId != null && linksQuery.isPending;
  const tagsErrorMessage = tagsQuery.error?.message ?? null;
  const metricNamesErrorMessage = metricNamesQuery.error?.message ?? null;
  const linksErrorMessage = saveErrorMessage ?? linksQuery.error?.message ?? null;

  useEffect(() => {
    if (updatedTag == null) {
      return;
    }

    if (selectedTagId === updatedTag.id) {
      setSelectedTagName(updatedTag.name);
      setTagQuery(updatedTag.name);
    }
  }, [selectedTagId, updatedTag]);

  useEffect(() => {
    if (selectedTagId == null) {
      return;
    }

    if (availableTags.some((tag) => tag.id === selectedTagId)) {
      return;
    }

    setSelectedTagId(null);
    setSelectedTagName(null);
    setTagQuery("");
    setMetricQuery("");
    setMetricPage(DEFAULT_PAGE);
    setInitialMetricNameIds([]);
    setDraftMetricNameIds([]);
    setSaveErrorMessage(null);
  }, [availableTags, selectedTagId]);

  useEffect(() => {
    if (selectedTagId == null) {
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setSaveErrorMessage(null);
      return;
    }

    setInitialMetricNameIds([]);
    setDraftMetricNameIds([]);
    setSaveErrorMessage(null);
  }, [selectedTagId]);

  useEffect(() => {
    if (selectedTagId == null || linksQuery.data == null) {
      return;
    }

    const nextMetricNameIds = mapLinkMetricNameIds(linksQuery.data);
    setInitialMetricNameIds(nextMetricNameIds);
    setDraftMetricNameIds(nextMetricNameIds);
  }, [linksQuery.data, selectedTagId]);

  const draftMetricNameSet = useMemo(
    () => new Set(draftMetricNameIds),
    [draftMetricNameIds]
  );

  const hasChanges = useMemo(
    () => !areSelectionsEqual(initialMetricNameIds, draftMetricNameIds),
    [draftMetricNameIds, initialMetricNameIds]
  );

  const selectedMetricNames = useMemo(
    () =>
      draftMetricNameIds.map((metricNameId) => {
        const knownMetricName = knownMetricNames[metricNameId];
        const linkedMetricName =
          linksQuery.data?.find((link) => link.metricNameId === metricNameId) ?? null;

        return {
          id: metricNameId,
          label:
            knownMetricName?.label ??
            linkedMetricName?.metricNameLabel ??
            t("admin.tagMetricNames.metricMeta", {
              id: String(metricNameId),
            }),
          active: knownMetricName?.active ?? null,
        };
      }),
    [draftMetricNameIds, knownMetricNames, linksQuery.data, t]
  );

  function handleTagQueryChange(value: string) {
    setTagQuery(value);

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setMetricQuery("");
      setMetricPage(DEFAULT_PAGE);
      setSaveErrorMessage(null);
      return;
    }

    if (selectedTagName && selectedTagName.toLowerCase() !== normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setMetricQuery("");
      setMetricPage(DEFAULT_PAGE);
      setSaveErrorMessage(null);
    }
  }

  function handleSelectTag(value: string) {
    const nextTagId = Number(value);
    const nextTag = availableTags.find((tag) => tag.id === nextTagId) ?? null;

    setSelectedTagId(nextTagId);
    setSelectedTagName(nextTag?.name ?? null);
    setMetricQuery("");
    setMetricPage(DEFAULT_PAGE);
    setSaveErrorMessage(null);

    if (nextTag) {
      setTagQuery(nextTag.name);
    }
  }

  function toggleMetricName(metricNameId: number) {
    setDraftMetricNameIds((current) => {
      if (current.includes(metricNameId)) {
        return current.filter((currentId) => currentId !== metricNameId);
      }

      return normalizeMetricNameIds([...current, metricNameId]);
    });
  }

  function handleReset() {
    setDraftMetricNameIds(initialMetricNameIds);
  }

  async function handleSave() {
    if (selectedTagId == null || selectedTagName == null) {
      toast.error(t("admin.tagMetricNames.selectTagError"));
      return;
    }

    try {
      setIsSaving(true);
      setSaveErrorMessage(null);

      const data = await adminTagMetricLinksApi.replaceTagMetricsByTagAdmin(
        selectedTagId,
        { metricNameIds: draftMetricNameIds }
      );

      queryClient.setQueryData(
        adminKeys.tagMetricsByTag(selectedTagId),
        data
      );
      await syncTagMetricCachesAfterAdminMutation(queryClient, selectedTagId);

      const nextMetricNameIds = mapLinkMetricNameIds(data);
      setInitialMetricNameIds(nextMetricNameIds);
      setDraftMetricNameIds(nextMetricNameIds);

      toast.success(
        t("admin.tagMetricNames.saveSuccess", { tagName: selectedTagName })
      );
    } catch (error) {
      setSaveErrorMessage(
        extractApiErrorMessage(error, t("admin.tagMetricNames.saveError"))
      );
    } finally {
      setIsSaving(false);
    }
  }

  const currentLinksTitle = t("admin.tagMetricNames.currentLinksTitle", {
    suffix: selectedTagName
      ? t("admin.tagMetricNames.currentLinksSuffix", { name: selectedTagName })
      : "",
  }).trim();

  return (
    <div className="space-y-4">
      <Card className="bg-surface">
        <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("admin.tagMetricNames.title")}</CardTitle>
            <CardDescription>
              {t("admin.tagMetricNames.description")}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-transparent px-3 py-1"
          >
            <Link2 className="mr-2 h-3.5 w-3.5" />
            {t("admin.tagMetricNames.linksCount", {
              count: draftMetricNameIds.length,
            })}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {t("admin.tagMetricNames.tagSearchLabel")}
              </div>
              <Input
                value={tagQuery}
                onChange={(event) => handleTagQueryChange(event.target.value)}
                placeholder={t("admin.tagMetricNames.tagSearchPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tags className="h-4 w-4" />
                {t("admin.tagMetricNames.tagLabel")}
              </div>
              <Select
                value={selectedTagId != null ? String(selectedTagId) : ""}
                onValueChange={handleSelectTag}
                disabled={availableTags.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingTags && availableTags.length === 0
                        ? t("admin.tagMetricNames.tagLoading")
                        : availableTags.length === 0
                          ? t("admin.tagMetricNames.tagEmpty")
                          : t("admin.tagMetricNames.tagPlaceholder")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tagsErrorMessage && (
            <p className="text-sm text-destructive">{tagsErrorMessage}</p>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {t("admin.tagMetricNames.metricSearchLabel")}
              </div>
              <Input
                value={metricQuery}
                onChange={(event) => {
                  setMetricQuery(event.target.value);
                  setMetricPage(DEFAULT_PAGE);
                }}
                placeholder={t("admin.tagMetricNames.metricSearchPlaceholder")}
                disabled={isLoadingMetricNames && metricNames.length === 0}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="surface"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                {t("common.reset")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  selectedTagId == null ||
                  isLoadingMetricNames ||
                  isLoadingLinks ||
                  metricNamesErrorMessage != null ||
                  !hasChanges
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-background/60 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{currentLinksTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.tagMetricNames.currentLinksDescription")}
                </p>
              </div>

              {hasChanges && (
                <Badge
                  variant="outline"
                  className="w-fit rounded-full border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-300"
                >
                  {t("admin.tagMetricNames.unsavedChanges")}
                </Badge>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTagId == null ? (
                <p className="text-sm text-muted-foreground">
                  {t("admin.tagMetricNames.selectTagHint")}
                </p>
              ) : isLoadingLinks ? (
                <p className="text-sm text-muted-foreground">
                  {t("admin.tagMetricNames.loadingLinks")}
                </p>
              ) : linksErrorMessage ? (
                <p className="text-sm text-destructive">{linksErrorMessage}</p>
              ) : selectedMetricNames.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("admin.tagMetricNames.emptyCurrentLinks")}
                </p>
              ) : (
                selectedMetricNames.map((metricName) => (
                  <Button
                    key={metricName.id}
                    type="button"
                    size="sm"
                    variant="surface"
                    disabled={isSaving}
                    onClick={() => toggleMetricName(metricName.id)}
                    className="rounded-full border-0 bg-primary/10 text-primary hover:bg-primary/15"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {metricName.label}
                  </Button>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {hasChanges
                ? t("admin.tagMetricNames.saveHintDirty")
                : t("admin.tagMetricNames.saveHintClean")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="surface"
                size="sm"
                disabled={!metricNamesQuery.data?.hasPrevious}
                onClick={() => setMetricPage((current) => Math.max(DEFAULT_PAGE, current - 1))}
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="surface"
                size="sm"
                disabled={!metricNamesQuery.data?.hasNext}
                onClick={() => setMetricPage((current) => current + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.tagMetricNames.metricColumn")}</TableHead>
              <TableHead className="w-40">
                {t("admin.tagMetricNames.statusColumn")}
              </TableHead>
              <TableHead className="w-40">
                {t("admin.tagMetricNames.relationColumn")}
              </TableHead>
              <TableHead className="w-32 text-right">
                {t("admin.tagMetricNames.actionColumn")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedTagId == null ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.tagMetricNames.selectTagHint")}
                </TableCell>
              </TableRow>
            ) : isLoadingMetricNames ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.tagMetricNames.loadingMetricNames")}
                </TableCell>
              </TableRow>
            ) : metricNamesErrorMessage ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-destructive">
                  {metricNamesErrorMessage}
                </TableCell>
              </TableRow>
            ) : isLoadingLinks ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.tagMetricNames.loadingLinks")}
                </TableCell>
              </TableRow>
            ) : linksErrorMessage ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-destructive">
                  {linksErrorMessage}
                </TableCell>
              </TableRow>
            ) : metricNames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.tagMetricNames.emptyMetricNames")}
                </TableCell>
              </TableRow>
            ) : (
              metricNames.map((metricName) => {
                const isLinked = draftMetricNameSet.has(metricName.id);

                return (
                  <TableRow key={metricName.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{metricName.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tagMetricNames.metricMeta", {
                            id: String(metricName.id),
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          metricName.active
                            ? "rounded-full border-transparent bg-primary/10 text-primary"
                            : "rounded-full border-transparent bg-destructive/10 text-destructive"
                        }
                      >
                        {metricName.active
                          ? t("admin.tagMetricNames.activeStatus")
                          : t("admin.tagMetricNames.inactiveStatus")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isLinked
                            ? "rounded-full border-transparent bg-primary/10 text-primary"
                            : "rounded-full border-transparent bg-input text-muted-foreground"
                        }
                      >
                        {isLinked
                          ? t("admin.tagMetricNames.linkedStatus")
                          : t("admin.tagMetricNames.unlinkedStatus")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isLinked ? "surface" : undefined}
                        disabled={isSaving}
                        onClick={() => toggleMetricName(metricName.id)}
                      >
                        {isLinked ? (
                          <X className="mr-2 h-4 w-4" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        {isLinked
                          ? t("admin.tagMetricNames.removeAction")
                          : t("admin.tagMetricNames.addAction")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
